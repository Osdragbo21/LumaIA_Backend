// Ruta: src/asistente/asistente.service.ts
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { firstValueFrom } from 'rxjs';
import { GraphQLError } from 'graphql';
import { Medicamento } from '../medicamentos/entities/medicamento.entity';
import { LogInteraccion } from '../logs-interaccion/entities/log-interaccion.entity';

@Injectable()
export class AsistenteService {
  constructor(
    private readonly httpService: HttpService,
    @InjectModel(Medicamento.name) private medicamentoModel: Model<Medicamento>,
    @InjectModel(LogInteraccion.name) private logInteraccionModel: Model<LogInteraccion>,
  ) {}

  async procesarPregunta(usuario_id: string, pregunta_id: string): Promise<string> {
    try {
      const objectId = new Types.ObjectId(usuario_id);

      // 1. Obtener contexto: Medicamentos activos del usuario (Ignora borrado lógico)
      const medicamentos = await this.medicamentoModel.find({ 
        usuario_id: objectId,
        fecha_eliminacion: { $exists: false } 
      }).exec();

      // 2. Mapear contrato para Python
      const medicamentos_activos = medicamentos.map(med => ({
        nombre_farmaco: med.nombre_farmaco,
        horarios_especificos: med.horarios_especificos,
      }));

      // 3. Petición HTTP al Microservicio Lógico
      const { data } = await firstValueFrom(
        this.httpService.post('http://localhost:8000/evaluar', {
          pregunta_id,
          medicamentos_activos,
        })
      );

      // 4. Auditoría: Guardar Log de Interacción en MongoDB
      const nuevoLog = new this.logInteraccionModel({
        usuario_id: objectId,
        premisa_entrada: pregunta_id,
        respuesta_generada: data.respuesta,
        bloqueo_medico: false,
        fecha_interaccion: new Date(),
      });
      await nuevoLog.save();

      // 5. Retornar solo el string de respuesta al Frontend
      return data.respuesta;

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      throw new GraphQLError(`Fallo en el motor de inferencia: ${errorMessage}`, {
        extensions: { code: 'INTERNAL_SERVER_ERROR' },
      });
    }
  }
}