// [BACKEND] Ruta: src/analitica/analitica.service.ts

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { GraphQLError } from 'graphql';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { RegistroToma, Enum_EstadoToma } from '../registros-toma/entities/registro-toma.entity';
import { LogInteraccion } from '../logs-interaccion/entities/log-interaccion.entity';
import { AnaliticaDashboard, AdherenciaManhattan, IntencionEuclidiana, ContactoUCS, IteracionHillClimbing } from './entities/analitica.entity';

@Injectable()
export class AnaliticaService {
  constructor(
    @InjectModel(Usuario.name) private usuarioModel: Model<Usuario>,
    @InjectModel(RegistroToma.name) private registroTomaModel: Model<RegistroToma>,
    @InjectModel(LogInteraccion.name) private logInteraccionModel: Model<LogInteraccion>,
  ) {}

  // 1. BFS (Búsqueda en Anchura)
  private calcularRutaBFS(origen: string, destino: string): string[] {
    const grafoPantallas: Record<string, string[]> = {
      'Inicio': ['Luma', 'Agenda', 'Apoyo'],
      'Agenda': ['Inicio', 'Menú Agregar'],
      'Menú Agregar': ['Nuevo Medicamento', 'Nueva Cita', 'Nueva Nota'],
      'Apoyo': ['Inicio', 'Nuevo Contacto', 'Llamada SOS'],
      'Luma': ['Inicio']
    };
    const cola: string[][] = [[origen]];
    const visitados = new Set<string>([origen]);

    while (cola.length > 0) {
      const rutaActual = cola.shift();
      const nodoActual = rutaActual[rutaActual.length - 1];
      if (nodoActual === destino) return rutaActual;
      const vecinos = grafoPantallas[nodoActual] || [];
      for (const vecino of vecinos) {
        if (!visitados.has(vecino)) {
          visitados.add(vecino);
          cola.push([...rutaActual, vecino]);
        }
      }
    }
    return ['Ruta no encontrada'];
  }

  // 2. UCS (Búsqueda de Costo Uniforme) - Escalamiento SOS
  private calcularUCS(contactos: any[]): ContactoUCS[] {
    // Simulamos un costo (tiempo de respuesta en minutos) para cada contacto
    const grafoContactos = contactos.map((c, index) => ({
      nombre: c.nombre_contacto,
      costo: index === 0 ? 2 : (Math.floor(Math.random() * 10) + 5) // El cuidador principal (índice 0) cuesta 2 min, los demás aleatorio
    }));
    
    // Agregamos el 911 como último recurso
    grafoContactos.push({ nombre: 'Emergencias (911)', costo: 15 });

    // UCS expande siempre el nodo de menor costo. 
    // En esta topología, equivale a ordenar la cola de prioridad por costo de respuesta.
    grafoContactos.sort((a, b) => a.costo - b.costo);

    let costoAcumulado = 0;
    return grafoContactos.map(c => {
      costoAcumulado += c.costo;
      return { nombre: c.nombre, costo_minutos: c.costo, costo_acumulado: costoAcumulado };
    });
  }

  // 3. Hill Climbing - Optimización de Recordatorios
  private calcularHillClimbing(retrasoInicial: number): IteracionHillClimbing[] {
    const iteraciones: IteracionHillClimbing[] = [];
    let retrasoActual = retrasoInicial > 0 ? retrasoInicial : 45; // Empezamos en un punto subóptimo (ej. 45 min de retraso)
    
    iteraciones.push({ iteracion: 0, retraso_actual: retrasoActual, ajuste: 'Estado Inicial' });

    // Simulamos la evaluación de vecinos (ajustar el recordatorio -5 min o +5 min)
    for (let i = 1; i <= 5; i++) {
      // La función objetivo es MINIMIZAR el retraso.
      // Simulamos que el algoritmo encuentra un vecino que mejora la función objetivo.
      const mejora = Math.floor(Math.random() * 10) + 2; 
      
      if (retrasoActual - mejora > 5) {
        retrasoActual -= mejora;
        iteraciones.push({ iteracion: i, retraso_actual: retrasoActual, ajuste: 'Adelantar aviso 5 min' });
      } else {
        // Ningún vecino mejora significativamente el resultado. Hemos llegado a un Óptimo Local/Global.
        iteraciones.push({ iteracion: i, retraso_actual: Math.max(retrasoActual - mejora, 0), ajuste: 'Óptimo Local Alcanzado' });
        break;
      }
    }
    return iteraciones;
  }

  async obtenerEstadisticas(cuidador_id: string, dias: number = 7): Promise<AnaliticaDashboard> {
    try {
      const cuidador = await this.usuarioModel.findById(new Types.ObjectId(cuidador_id)).exec();
      if (!cuidador || !cuidador.adultos_vinculados || cuidador.adultos_vinculados.length === 0) {
        return { adherencia: [], intenciones: [], seguridad_dfs: { permitidas: 0, bloqueadas: 0 }, ruta_bfs_optima: [], escalamiento_ucs: [], optimizacion_hill_climbing: [] };
      }

      const adultoId = cuidador.adultos_vinculados[0];
      const adulto = await this.usuarioModel.findById(adultoId).exec();
      const fechaLimite = new Date();
      fechaLimite.setDate(fechaLimite.getDate() - dias);

      // MANHATTAN
      const tomas = await this.registroTomaModel.find({ estado_toma: Enum_EstadoToma.CONFIRMADA, fecha_confirmacion: { $gte: fechaLimite } }).exec();
      const adherenciaMap = new Map<string, number>();
      let ultimoRetraso = 45; // Para alimentar a Hill Climbing

      tomas.forEach(toma => {
        if (toma.fecha_confirmacion && toma.fecha_programada) {
          const fechaStr = toma.fecha_confirmacion.toISOString().split('T')[0];
          const diffMs = Math.abs(toma.fecha_confirmacion.getTime() - toma.fecha_programada.getTime());
          const diffMinutos = Math.floor(diffMs / 60000);
          ultimoRetraso = diffMinutos;
          adherenciaMap.set(fechaStr, (adherenciaMap.get(fechaStr) || 0) + diffMinutos);
        }
      });
      const adherencia: AdherenciaManhattan[] = Array.from(adherenciaMap.entries()).map(([fecha, retraso_minutos]) => ({ fecha, retraso_minutos }));

      // EUCLIDIANA Y DFS
      const logs = await this.logInteraccionModel.find({ usuario_id: adultoId, fecha_interaccion: { $gte: fechaLimite } }).exec();
      const intencionMap = new Map<string, { count: number, totalDist: number }>();
      let bloqueadas = 0, permitidas = 0;

      logs.forEach(log => {
        const data = intencionMap.get(log.intencion) || { count: 0, totalDist: 0 };
        data.count += 1;
        data.totalDist += log.distancia;
        intencionMap.set(log.intencion, data);
        if (log.bloqueo_medico) bloqueadas++; else permitidas++;
      });

      const intenciones: IntencionEuclidiana[] = Array.from(intencionMap.entries()).map(([intencion, data]) => ({
        intencion, cantidad: data.count, distancia_promedio: data.totalDist / data.count
      }));

      // BFS, UCS y HILL CLIMBING
      const ruta_bfs_optima = this.calcularRutaBFS('Inicio', 'Nuevo Medicamento');
      const escalamiento_ucs = this.calcularUCS(adulto.contactos_emergencia);
      const optimizacion_hill_climbing = this.calcularHillClimbing(ultimoRetraso);

      return { adherencia, intenciones, seguridad_dfs: { permitidas, bloqueadas }, ruta_bfs_optima, escalamiento_ucs, optimizacion_hill_climbing };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new GraphQLError(`Error al calcular analíticas: ${errorMessage}`);
    }
  }
}