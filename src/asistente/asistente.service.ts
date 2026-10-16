// [BACKEND] Ruta: src/asistente/asistente.service.ts

import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { firstValueFrom } from 'rxjs';
import { GraphQLError } from 'graphql';
import { Medicamento } from '../medicamentos/entities/medicamento.entity';
import { LogInteraccion } from '../logs-interaccion/entities/log-interaccion.entity';
import { Cita } from '../citas/entities/cita.entity'; // <-- NUEVO

@Injectable()
export class AsistenteService {
  constructor(
    private readonly httpService: HttpService,
    @InjectModel(Medicamento.name) private medicamentoModel: Model<Medicamento>,
    @InjectModel(LogInteraccion.name) private logInteraccionModel: Model<LogInteraccion>,
    @InjectModel(Cita.name) private citaModel: Model<Cita>, // <-- NUEVO
  ) {}

  async procesarPregunta(usuario_id: string, pregunta_id: string): Promise<string> {
    try {
      const objectId = new Types.ObjectId(usuario_id);

      // 1. Obtener Medicamentos y Citas activas
      const medicamentos = await this.medicamentoModel.find({ 
        usuario_id: objectId,
        fecha_eliminacion: { $exists: false } 
      }).exec();

      const citas = await this.citaModel.find({
        usuario_id: objectId,
        fecha_eliminacion: { $exists: false }
      }).exec();

      // 2. Mapear contratos para Python
      const medicamentos_activos = medicamentos.map(med => ({
        nombre_farmaco: med.nombre_farmaco,
        horarios_especificos: med.horarios_especificos,
      }));

      const citas_activas = citas.map(cita => ({
        titulo_evento: cita.titulo_evento,
        fecha_hora: cita.fecha_hora.toISOString(),
        ubicacion: cita.ubicacion || 'Sin ubicación'
      }));

      // 3. Petición HTTP al Microservicio Lógico (FastAPI)
      const { data } = await firstValueFrom(
        this.httpService.post('http://localhost:8000/evaluar', {
          pregunta_id,
          medicamentos_activos,
          citas: citas_activas // <-- NUEVO: Enviamos las citas
        })
      );

      // 4. Auditoría: Guardar Log
      const nuevoLog = new this.logInteraccionModel({
        usuario_id: objectId,
        premisa_entrada: pregunta_id,
        respuesta_generada: data.respuesta,
        bloqueo_medico: false,
        fecha_interaccion: new Date(),
      });
      await nuevoLog.save();

      return data.respuesta;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      throw new GraphQLError(`Fallo en el motor de inferencia: ${errorMessage}`, {
        extensions: { code: 'INTERNAL_SERVER_ERROR' },
      });
    }
  }
}