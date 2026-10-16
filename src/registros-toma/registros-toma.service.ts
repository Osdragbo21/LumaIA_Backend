// [BACKEND] Ruta: src/registros-toma/registros-toma.service.ts

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { GraphQLError } from 'graphql';
import { RegistroToma, Enum_EstadoToma } from './entities/registro-toma.entity';

@Injectable()
export class RegistrosTomaService {
  constructor(
    @InjectModel(RegistroToma.name) private registroTomaModel: Model<RegistroToma>,
  ) {}

  async confirmarToma(medicamento_id: string): Promise<RegistroToma> {
    try {
      // Por ahora, creamos el registro al vuelo al darle "Listo" (MVP)
      // En el futuro, un CronJob los creará en estado "PENDIENTE" al iniciar el día.
      const nuevaToma = new this.registroTomaModel({
        medicamento_id: new Types.ObjectId(medicamento_id),
        fecha_programada: new Date(), 
        estado_toma: Enum_EstadoToma.CONFIRMADA,
        fecha_confirmacion: new Date(),
      });
      
      return await nuevaToma.save();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      throw new GraphQLError(`Error al registrar la toma: ${errorMessage}`, {
        extensions: { code: 'INTERNAL_SERVER_ERROR' },
      });
    }
  }
}