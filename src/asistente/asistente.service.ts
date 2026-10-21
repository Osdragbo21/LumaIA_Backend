// [BACKEND] Ruta: src/asistente/asistente.service.ts

import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { firstValueFrom } from 'rxjs';
import { GraphQLError } from 'graphql';
import { Medicamento } from '../medicamentos/entities/medicamento.entity';
import { LogInteraccion } from '../logs-interaccion/entities/log-interaccion.entity';
import { Cita } from '../citas/entities/cita.entity';
import { RegistroToma, Enum_EstadoToma } from '../registros-toma/entities/registro-toma.entity';

@Injectable()
export class AsistenteService {
  constructor(
    private readonly httpService: HttpService,
    @InjectModel(Medicamento.name) private medicamentoModel: Model<Medicamento>,
    @InjectModel(LogInteraccion.name) private logInteraccionModel: Model<LogInteraccion>,
    @InjectModel(Cita.name) private citaModel: Model<Cita>,
    @InjectModel(RegistroToma.name) private registroTomaModel: Model<RegistroToma>,
  ) {}

  async procesarPregunta(usuario_id: string, pregunta_id: string, modelo: string = 'Luma Cloud'): Promise<string> {
    try {
      const objectId = new Types.ObjectId(usuario_id);

      // --- 1. EXTRACCIÓN DE CONTEXTO (BASE DE DATOS) ---
      const medicamentos = await this.medicamentoModel.find({ usuario_id: objectId, fecha_eliminacion: { $exists: false } }).exec();
      
      const inicioDia = new Date(); inicioDia.setHours(0, 0, 0, 0);
      const finDia = new Date(); finDia.setHours(23, 59, 59, 999);

      const citasHoyDocs = await this.citaModel.find({ usuario_id: objectId, fecha_eliminacion: { $exists: false }, fecha_hora: { $gte: inicioDia, $lte: finDia } }).exec();
      
      const tomasHoyDocs = await this.registroTomaModel.find({
        medicamento_id: { $in: medicamentos.map(m => m._id) },
        estado_toma: Enum_EstadoToma.CONFIRMADA,
        fecha_confirmacion: { $gte: inicioDia, $lte: finDia }
      }).exec();

      const idsTomadosHoy = tomasHoyDocs.map(t => t.medicamento_id.toString());
      
      const medicamentos_activos = medicamentos.map(med => ({ id: med._id.toString(), nombre_farmaco: med.nombre_farmaco, horarios_especificos: med.horarios_especificos }));
      const citas_hoy = citasHoyDocs.map(cita => ({ titulo_evento: cita.titulo_evento, fecha_hora: cita.fecha_hora.toISOString(), ubicacion: cita.ubicacion || 'Sin ubicación' }));

      let respuestaGenerada = "";

      // --- 2. ENRUTADOR DE MODELOS IA (ROUTING) ---
      
      if (modelo === 'Llama 3.2 Local') {
        // RUTA A: MODELO LOCAL (OLLAMA)
        // Construimos un Prompt explícito inyectando el contexto del usuario
        
        const medsPendientes = medicamentos_activos.filter(m => !idsTomadosHoy.includes(m.id));
        const medsTomados = medicamentos_activos.filter(m => idsTomadosHoy.includes(m.id));
        
        const promptContexto = `
          Eres Luma, un asistente médico empático para un adulto mayor. NO debes dar diagnósticos médicos.
          Contexto del paciente para hoy:
          - Citas médicas hoy: ${citas_hoy.map(c => c.titulo_evento).join(', ') || 'Ninguna'}.
          - Medicamentos que YA TOMÓ hoy: ${medsTomados.map(m => m.nombre_farmaco).join(', ') || 'Ninguno'}.
          - Medicamentos PENDIENTES por tomar: ${medsPendientes.map(m => m.nombre_farmaco).join(', ') || 'Ninguno'}.
          
          El usuario te pregunta o solicita lo siguiente: "${pregunta_id}"
          
          Responde de manera natural, breve, cálida y en español de México. Si pregunta por su próxima toma, menciona solo los pendientes. Si pide un resumen, incluye citas, tomados y pendientes.
        `;

        const ollamaPayload = {
          model: "llama3.2",
          prompt: promptContexto,
          stream: false // Importante para recibir un solo bloque de JSON
        };

        const { data } = await firstValueFrom(
          this.httpService.post('http://127.0.0.1:11434/api/generate', ollamaPayload)
        );
        respuestaGenerada = data.response;

      } else {
        // RUTA B: MODELO CLOUD (FASTAPI / OpenAI / Gemini actual)
        const { data } = await firstValueFrom(
          this.httpService.post('http://127.0.0.1:8000/evaluar', {
            pregunta_id,
            medicamentos_activos,
            citas: citas_hoy,
            tomas_hoy_ids: idsTomadosHoy 
          })
        );
        respuestaGenerada = data.respuesta;
      }

      // --- 3. AUDITORÍA Y RETORNO ---
      const nuevoLog = new this.logInteraccionModel({
        usuario_id: objectId,
        premisa_entrada: pregunta_id,
        respuesta_generada: respuestaGenerada,
        bloqueo_medico: false,
        fecha_interaccion: new Date(),
      });
      await nuevoLog.save();

      return respuestaGenerada;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      throw new GraphQLError(`Fallo en el motor de inferencia: ${errorMessage}`, {
        extensions: { code: 'INTERNAL_SERVER_ERROR' },
      });
    }
  }
}