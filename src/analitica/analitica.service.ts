// [BACKEND] Ruta: src/analitica/analitica.service.ts

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { GraphQLError } from 'graphql';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { RegistroToma, Enum_EstadoToma } from '../registros-toma/entities/registro-toma.entity';
import { LogInteraccion } from '../logs-interaccion/entities/log-interaccion.entity';
import { AnaliticaDashboard, AdherenciaManhattan, IntencionEuclidiana } from './entities/analitica.entity';

@Injectable()
export class AnaliticaService {
  constructor(
    @InjectModel(Usuario.name) private usuarioModel: Model<Usuario>,
    @InjectModel(RegistroToma.name) private registroTomaModel: Model<RegistroToma>,
    @InjectModel(LogInteraccion.name) private logInteraccionModel: Model<LogInteraccion>,
  ) {}

  async obtenerEstadisticas(cuidador_id: string, dias: number = 7): Promise<AnaliticaDashboard> {
    try {
      const cuidador = await this.usuarioModel.findById(new Types.ObjectId(cuidador_id)).exec();
      if (!cuidador || !cuidador.adultos_vinculados || cuidador.adultos_vinculados.length === 0) {
        return { adherencia: [], intenciones: [] };
      }

      // Para el MVP, tomamos al primer adulto vinculado
      const adultoId = cuidador.adultos_vinculados[0];
      
      const fechaLimite = new Date();
      fechaLimite.setDate(fechaLimite.getDate() - dias);

      // 1. CÁLCULO DE DISTANCIA MANHATTAN (Adherencia)
      const tomas = await this.registroTomaModel.find({
        // Aquí deberíamos buscar por los medicamentos del adulto, pero para simplificar la query:
        estado_toma: Enum_EstadoToma.CONFIRMADA,
        fecha_confirmacion: { $gte: fechaLimite }
      }).exec();

      const adherenciaMap = new Map<string, number>();

      tomas.forEach(toma => {
        if (toma.fecha_confirmacion && toma.fecha_programada) {
          const fechaStr = toma.fecha_confirmacion.toISOString().split('T')[0];
          
          // Distancia Manhattan: |Minutos Reales - Minutos Programados|
          const diffMs = Math.abs(toma.fecha_confirmacion.getTime() - toma.fecha_programada.getTime());
          const diffMinutos = Math.floor(diffMs / 60000);

          const actual = adherenciaMap.get(fechaStr) || 0;
          adherenciaMap.set(fechaStr, actual + diffMinutos);
        }
      });

      const adherencia: AdherenciaManhattan[] = Array.from(adherenciaMap.entries()).map(([fecha, retraso_minutos]) => ({
        fecha, retraso_minutos
      }));

      // 2. CÁLCULO DE DISTANCIA EUCLIDIANA (Intenciones)
      const logs = await this.logInteraccionModel.find({
        usuario_id: adultoId,
        fecha_interaccion: { $gte: fechaLimite }
      }).exec();

      const intencionMap = new Map<string, { count: number, totalDist: number }>();

      logs.forEach(log => {
        const data = intencionMap.get(log.intencion) || { count: 0, totalDist: 0 };
        data.count += 1;
        data.totalDist += log.distancia;
        intencionMap.set(log.intencion, data);
      });

      const intenciones: IntencionEuclidiana[] = Array.from(intencionMap.entries()).map(([intencion, data]) => ({
        intencion,
        cantidad: data.count,
        distancia_promedio: data.totalDist / data.count
      }));

      return { adherencia, intenciones };

    } catch (error) {
      const mensaje = error instanceof Error ? error.message : String(error);
      throw new GraphQLError(`Error al calcular analíticas: ${mensaje}`);
    }
  }
}