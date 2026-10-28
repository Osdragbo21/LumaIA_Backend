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
    @InjectModel(Medicamento.name) private medicamentoModel: Model<Medicamento>,
  ) {}

  // Función privada para calcular el inicio y fin del día en la zona horaria local
  private getRangoDiaLocalUTC(offsetHoras: number = -6): { inicioDia: Date, finDia: Date } {
    const ahora = new Date();
    // Ajustamos la hora actual al offset deseado
    const horaLocal = new Date(ahora.getTime() + offsetHoras * 3600 * 1000);

    // Calculamos la medianoche de inicio
    const inicioDiaLocal = new Date(horaLocal);
    inicioDiaLocal.setUTCHours(0, 0, 0, 0);
    const inicioDiaUTC = new Date(inicioDiaLocal.getTime() - offsetHoras * 3600 * 1000);

    // Calculamos la medianoche de fin
    const finDiaLocal = new Date(horaLocal);
    finDiaLocal.setUTCHours(23, 59, 59, 999);
    const finDiaUTC = new Date(finDiaLocal.getTime() - offsetHoras * 3600 * 1000);

    return { inicioDia: inicioDiaUTC, finDia: finDiaUTC };
  }

  async confirmarToma(medicamento_id: string): Promise<RegistroToma> {
    try {
      if (!Types.ObjectId.isValid(medicamento_id)) throw new Error('ID de medicamento inválido.');

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

  async obtenerTomasHoy(usuario_id: string): Promise<RegistroToma[]> {
    try {
      if (!Types.ObjectId.isValid(usuario_id)) throw new Error('ID de usuario inválido.');
      const usuarioObjectId = new Types.ObjectId(usuario_id);

      const medicamentosUsuario = await this.medicamentoModel.find({ usuario_id: usuarioObjectId }).exec();
      const idsMedicamentos = medicamentosUsuario.map(med => med._id);

      // CORRECCIÓN: Usamos el cálculo seguro de zona horaria
      const { inicioDia, finDia } = this.getRangoDiaLocalUTC(-6); // UTC-6 (Ej. CDMX)

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