// [BACKEND] Ruta: src/registros-toma/registros-toma.service.ts

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { GraphQLError } from 'graphql';
import { RegistroToma, Enum_EstadoToma } from './entities/registro-toma.entity';
import { Medicamento } from '../medicamentos/entities/medicamento.entity';


@Injectable()
export class RegistrosTomaService {
  constructor(
    @InjectModel(RegistroToma.name) private registroTomaModel: Model<RegistroToma>,
    @InjectModel(Medicamento.name) private medicamentoModel: Model<Medicamento>, // Inyectamos Medicamento
  ) {}

  async confirmarToma(medicamento_id: string): Promise<RegistroToma> {
    try {
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

  // NUEVO: Obtener las tomas confirmadas del día actual
  async obtenerTomasHoy(usuario_id: string): Promise<RegistroToma[]> {
    try {
      const usuarioObjectId = new Types.ObjectId(usuario_id);

      // 1. Obtener los IDs de todos los medicamentos de este usuario
      const medicamentosUsuario = await this.medicamentoModel.find({ usuario_id: usuarioObjectId }).exec();
      const idsMedicamentos = medicamentosUsuario.map(med => med._id);

      // 2. Definir el rango del día actual (00:00:00 a 23:59:59)
      const inicioDia = new Date();
      inicioDia.setHours(0, 0, 0, 0);
      
      const finDia = new Date();
      finDia.setHours(23, 59, 59, 999);

      // 3. Buscar los registros de hoy que estén confirmados
      return await this.registroTomaModel.find({
        medicamento_id: { $in: idsMedicamentos },
        estado_toma: Enum_EstadoToma.CONFIRMADA,
        fecha_confirmacion: { $gte: inicioDia, $lte: finDia }
      }).exec();

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      throw new GraphQLError(`Error al consultar las tomas de hoy: ${errorMessage}`, {
        extensions: { code: 'INTERNAL_SERVER_ERROR' },
      });
    }
  }
}