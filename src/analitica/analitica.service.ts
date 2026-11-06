// [BACKEND] Ruta: src/analitica/analitica.service.ts

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { HttpService } from '@nestjs/axios'; // NUEVO
import { firstValueFrom } from 'rxjs'; // NUEVO
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
    private readonly httpService: HttpService, // NUEVO: Inyectamos HttpService
  ) {}

  private calcularRutaBFS(origen: string, destino: string): string[] {
    const grafoPantallas: Record<string, string[]> = {
      'Inicio': ['Luma', 'Agenda', 'Apoyo'], 'Agenda': ['Inicio', 'Menú Agregar'],
      'Menú Agregar': ['Nuevo Medicamento', 'Nueva Cita', 'Nueva Nota'],
      'Apoyo': ['Inicio', 'Nuevo Contacto', 'Llamada SOS'], 'Luma': ['Inicio']
    };
    const cola: string[][] = [[origen]];
    const visitados = new Set<string>([origen]);
    while (cola.length > 0) {
      const rutaActual = cola.shift();
      const nodoActual = rutaActual[rutaActual.length - 1];
      if (nodoActual === destino) return rutaActual;
      const vecinos = grafoPantallas[nodoActual] || [];
      for (const vecino of vecinos) {
        if (!visitados.has(vecino)) { visitados.add(vecino); cola.push([...rutaActual, vecino]); }
      }
    }
    return ['Ruta no encontrada'];
  }

  private calcularUCS(contactos: any[]): ContactoUCS[] {
    const grafoContactos = contactos.map((c, index) => ({ nombre: c.nombre_contacto, costo: index === 0 ? 2 : (Math.floor(Math.random() * 10) + 5) }));
    grafoContactos.push({ nombre: 'Emergencias (911)', costo: 15 });
    grafoContactos.sort((a, b) => a.costo - b.costo);
    let costoAcumulado = 0;
    return grafoContactos.map(c => { costoAcumulado += c.costo; return { nombre: c.nombre, costo_minutos: c.costo, costo_acumulado: costoAcumulado }; });
  }

  private calcularHillClimbing(retrasoInicial: number): IteracionHillClimbing[] {
    const iteraciones: IteracionHillClimbing[] = [];
    let retrasoActual = retrasoInicial > 0 ? retrasoInicial : 45; 
    iteraciones.push({ iteracion: 0, retraso_actual: retrasoActual, ajuste: 'Estado Inicial' });
    for (let i = 1; i <= 5; i++) {
      const mejora = Math.floor(Math.random() * 10) + 2; 
      if (retrasoActual - mejora > 5) {
        retrasoActual -= mejora; iteraciones.push({ iteracion: i, retraso_actual: retrasoActual, ajuste: 'Adelantar aviso 5 min' });
      } else {
        iteraciones.push({ iteracion: i, retraso_actual: Math.max(retrasoActual - mejora, 0), ajuste: 'Óptimo Local Alcanzado' });
        break;
      }
    }
    return iteraciones;
  }

  async obtenerEstadisticas(cuidador_id: string, dias: number = 7): Promise<AnaliticaDashboard> {
    try {
      const cuidador = await this.usuarioModel.findById(new Types.ObjectId(cuidador_id)).exec();
      
      // Objeto por defecto en caso de no tener vinculados
      const defaultResponse = { adherencia: [], intenciones: [], seguridad_dfs: { permitidas: 0, bloqueadas: 0 }, ruta_bfs_optima: [], escalamiento_ucs: [], optimizacion_hill_climbing: [], prediccion_riesgo: { riesgo_regla_fija: false, riesgo_machine_learning: false, exactitud_modelo_ml: 0.0 } };
      
      if (!cuidador || !cuidador.adultos_vinculados || cuidador.adultos_vinculados.length === 0) return defaultResponse;

      const adultoId = cuidador.adultos_vinculados[0];
      const adulto = await this.usuarioModel.findById(adultoId).exec();
      const fechaLimite = new Date();
      fechaLimite.setDate(fechaLimite.getDate() - dias);

      // 1. MANHATTAN Y RETRASO PROMEDIO
      const tomas = await this.registroTomaModel.find({ estado_toma: Enum_EstadoToma.CONFIRMADA, fecha_confirmacion: { $gte: fechaLimite } }).exec();
      const adherenciaMap = new Map<string, number>();
      let ultimoRetraso = 45;
      
      // Variables para Machine Learning
      let sumaRetrasos = 0;
      let totalTomas = 0;

      tomas.forEach(toma => {
        if (toma.fecha_confirmacion && toma.fecha_programada) {
          const fechaStr = toma.fecha_confirmacion.toISOString().split('T')[0];
          const diffMs = Math.abs(toma.fecha_confirmacion.getTime() - toma.fecha_programada.getTime());
          const diffMinutos = Math.floor(diffMs / 60000);
          ultimoRetraso = diffMinutos;
          sumaRetrasos += diffMinutos;
          totalTomas++;
          adherenciaMap.set(fechaStr, (adherenciaMap.get(fechaStr) || 0) + diffMinutos);
        }
      });
      const adherencia: AdherenciaManhattan[] = Array.from(adherenciaMap.entries()).map(([fecha, retraso_minutos]) => ({ fecha, retraso_minutos }));
      const retraso_promedio_minutos = totalTomas > 0 ? (sumaRetrasos / totalTomas) : 0;

      // 2. EUCLIDIANA, DFS Y SÍNTOMAS
      const logs = await this.logInteraccionModel.find({ usuario_id: adultoId, fecha_interaccion: { $gte: fechaLimite } }).exec();
      const intencionMap = new Map<string, { count: number, totalDist: number }>();
      let bloqueadas = 0, permitidas = 0;
      
      // Variables para Machine Learning
      let consultas_sintomas = 0;
      let alertas_sos = 0;

      logs.forEach(log => {
        const data = intencionMap.get(log.intencion) || { count: 0, totalDist: 0 };
        data.count += 1;
        data.totalDist += log.distancia;
        intencionMap.set(log.intencion, data);
        
        if (log.bloqueo_medico) {
            bloqueadas++;
            alertas_sos++; // Usamos los bloqueos como proxy de alertas SOS
        } else {
            permitidas++;
        }

        if (log.intencion === 'SINTOMA') consultas_sintomas++;
      });

      const intenciones: IntencionEuclidiana[] = Array.from(intencionMap.entries()).map(([intencion, data]) => ({
        intencion, cantidad: data.count, distancia_promedio: data.totalDist / data.count
      }));

      // 3. BFS, UCS y HILL CLIMBING
      const ruta_bfs_optima = this.calcularRutaBFS('Inicio', 'Nuevo Medicamento');
      const escalamiento_ucs = this.calcularUCS(adulto.contactos_emergencia);
      const optimizacion_hill_climbing = this.calcularHillClimbing(ultimoRetraso);

      // ==========================================
      // 4. MACHINE LEARNING (Llamada a FastAPI)
      // ==========================================
      let prediccion_riesgo = defaultResponse.prediccion_riesgo;
      try {
        const mlPayload = { retraso_promedio_minutos, consultas_sintomas, alertas_sos };
        const { data } = await firstValueFrom(
          this.httpService.post('http://localhost:8000/predecir-riesgo', mlPayload)
        );
        prediccion_riesgo = data;
      } catch (e) {
        console.error("No se pudo contactar al motor de Machine Learning en FastAPI.", e instanceof Error ? e.message : String(e));
      }

      return { adherencia, intenciones, seguridad_dfs: { permitidas, bloqueadas }, ruta_bfs_optima, escalamiento_ucs, optimizacion_hill_climbing, prediccion_riesgo };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new GraphQLError(`Error al calcular analíticas: ${message}`);
    }
  }
}