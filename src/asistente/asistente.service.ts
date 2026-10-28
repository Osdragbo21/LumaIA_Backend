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

interface IAsistenteResponse {
  respuesta_texto: string;
  intencion: string;
}

@Injectable()
export class AsistenteService {
  constructor(
    private readonly httpService: HttpService,
    @InjectModel(Medicamento.name) private medicamentoModel: Model<Medicamento>,
    @InjectModel(LogInteraccion.name) private logInteraccionModel: Model<LogInteraccion>,
    @InjectModel(Cita.name) private citaModel: Model<Cita>,
    @InjectModel(RegistroToma.name) private registroTomaModel: Model<RegistroToma>,
  ) {}

  private getRangoDiaLocalUTC(offsetHoras: number = -6): { inicioDia: Date, finDia: Date } {
    const ahora = new Date();
    const horaLocal = new Date(ahora.getTime() + offsetHoras * 3600 * 1000);

    const inicioDiaLocal = new Date(horaLocal);
    inicioDiaLocal.setUTCHours(0, 0, 0, 0);
    const inicioDiaUTC = new Date(inicioDiaLocal.getTime() - offsetHoras * 3600 * 1000);

    const finDiaLocal = new Date(horaLocal);
    finDiaLocal.setUTCHours(23, 59, 59, 999);
    const finDiaUTC = new Date(finDiaLocal.getTime() - offsetHoras * 3600 * 1000);

    return { inicioDia: inicioDiaUTC, finDia: finDiaUTC };
  }

  private clasificarIntencionRapida(pregunta: string): string {
    const p = pregunta.toLowerCase();
    if (p.includes('agregar') || p.includes('nuevo') || p.includes('crear') || p.includes('registrar')) {
      if (p.includes('medicina') || p.includes('pastilla') || p.includes('tratamiento')) return 'ACCION_NUEVO_MEDICAMENTO';
      if (p.includes('cita') || p.includes('doctor') || p.includes('consulta')) return 'ACCION_NUEVA_CITA';
      if (p.includes('contacto') || p.includes('familiar') || p.includes('apoyo')) return 'ACCION_NUEVO_CONTACTO';
    }
    return 'CONSULTA_GENERAL';
  }

  private parsearRespuestaJSON(respuestaRaw: string, intencionRespaldo: string): IAsistenteResponse {
    try {
      const cleanJson = respuestaRaw.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      return {
        respuesta_texto: parsed.respuesta_texto ? parsed.respuesta_texto.replace(/"/g, '') : "Lo siento, no pude procesar eso.",
        intencion: parsed.intencion || intencionRespaldo
      };
    } catch (error) {
      return {
        respuesta_texto: respuestaRaw.replace(/"/g, ''),
        intencion: intencionRespaldo
      };
    }
  }

  // NUEVO MÉTODO: Envía el audio a FastAPI
  async transcribirAudio(base64Audio: string): Promise<string> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.post('http://localhost:8000/transcribir', { audio_base64: base64Audio })
      );
      return data.texto;
    } catch (error) {
      throw new GraphQLError('Error al comunicar con el motor de transcripción IA.');
    }
  }

  async procesarPregunta(usuario_id: string, pregunta_id: string, modelo: string = 'Luma Cloud'): Promise<IAsistenteResponse> {
    try {
      if (!Types.ObjectId.isValid(usuario_id)) throw new Error('ID de usuario inválido.');
      const objectId = new Types.ObjectId(usuario_id);

      const medicamentos = await this.medicamentoModel.find({ usuario_id: objectId, fecha_eliminacion: { $exists: false } }).exec();
      const { inicioDia, finDia } = this.getRangoDiaLocalUTC(-6);

      const citasHoyDocs = await this.citaModel.find({ usuario_id: objectId, fecha_eliminacion: { $exists: false }, fecha_hora: { $gte: inicioDia, $lte: finDia } }).exec();
      const tomasHoyDocs = await this.registroTomaModel.find({
        medicamento_id: { $in: medicamentos.map(m => m._id) },
        estado_toma: Enum_EstadoToma.CONFIRMADA,
        fecha_confirmacion: { $gte: inicioDia, $lte: finDia }
      }).exec();

      const idsTomadosHoy = tomasHoyDocs.map(t => t.medicamento_id.toString());
      const medicamentos_activos = medicamentos.map(med => ({ id: med._id.toString(), nombre_farmaco: med.nombre_farmaco, horarios_especificos: med.horarios_especificos }));
      
      const citas_hoy = citasHoyDocs.map(cita => ({ titulo_evento: cita.titulo_evento, fecha_hora: cita.fecha_hora.toISOString(), ubicacion: cita.ubicacion || 'Sin ubicación' }));
      const medsPendientes = medicamentos_activos.filter(m => !idsTomadosHoy.includes(m.id));
      const medsTomados = medicamentos_activos.filter(m => idsTomadosHoy.includes(m.id));

      const systemPrompt = `
        Eres Luma, el asistente personal del usuario. 
        REGLAS ESTRICTAS:
        1. Háblale SIEMPRE de "tú" de forma muy cálida y humana.
        2. Los nombres en la lista de "Medicamentos" son NOMBRES COMERCIALES DE MEDICINAS. NUNCA los interpretes como estudios de laboratorio, procedimientos ni pruebas médicas, sin importar lo raros que suenen.
        3. Sé extremadamente breve y nunca uses comillas para envolver tu respuesta.
        4. Responde ÚNICAMENTE entregando un objeto JSON válido con este formato exacto: {"respuesta_texto": "Tu respuesta", "intencion": "TIPO_DE_INTENCION"}
        5. Intenciones válidas: CONSULTA_GENERAL, ACCION_NUEVO_MEDICAMENTO, ACCION_NUEVA_CITA.

        CONTEXTO HOY:
        - Citas: ${citas_hoy.map(c => c.titulo_evento).join(', ') || 'Ninguna'}.
        - Medicamentos YA TOMADOS: ${medsTomados.map(m => m.nombre_farmaco).join(', ') || 'Ninguno'}.
        - Medicamentos PENDIENTES por tomar: ${medsPendientes.map(m => m.nombre_farmaco).join(', ') || 'Ninguno'}.

        EL USUARIO DICE: "${pregunta_id}"
      `;

      const intencionRapida = this.clasificarIntencionRapida(pregunta_id);
      let resultadoFinal: IAsistenteResponse;

      if (modelo === 'Llama 3.2 Local') {
        const ollamaPayload = {
          model: "llama3.2",
          prompt: systemPrompt,
          format: "json", 
          stream: false
        };

        const { data } = await firstValueFrom(
          this.httpService.post('http://127.0.0.1:11434/api/generate', ollamaPayload)
        );
        resultadoFinal = this.parsearRespuestaJSON(data.response, intencionRapida);
      } else {
        const { data } = await firstValueFrom(
          this.httpService.post('http://localhost:8000/evaluar', {
            pregunta_id,
            medicamentos_activos,
            citas: citas_hoy,
            tomas_hoy_ids: idsTomadosHoy,
            prompt_forzado: systemPrompt 
          })
        );
        
        if (data.respuesta_texto && data.intencion) {
          resultadoFinal = { respuesta_texto: data.respuesta_texto, intencion: data.intencion };
        } else {
          resultadoFinal = { respuesta_texto: "Lo siento, hubo un problema de comunicación con el servidor.", intencion: 'CONSULTA_GENERAL' };
        }
      }

      const nuevoLog = new this.logInteraccionModel({
        usuario_id: objectId,
        premisa_entrada: pregunta_id,
        respuesta_generada: resultadoFinal.respuesta_texto,
        bloqueo_medico: false,
        fecha_interaccion: new Date(),
      });
      await nuevoLog.save();

      return resultadoFinal;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      throw new GraphQLError(`Fallo en el motor de inferencia: ${errorMessage}`, {
        extensions: { code: 'INTERNAL_SERVER_ERROR' },
      });
    }
  }
}