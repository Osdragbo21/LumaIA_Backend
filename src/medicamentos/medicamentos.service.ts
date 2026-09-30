// Ruta: src/medicamentos/medicamentos.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { GraphQLError } from 'graphql';
import { Medicamento } from './entities/medicamento.entity';
import { CreateMedicamentoInput } from './dto/create-medicamento.input';

@Injectable()
export class MedicamentosService {
  constructor(
    @InjectModel(Medicamento.name) private medicamentoModel: Model<Medicamento>,
  ) {}

  async create(input: CreateMedicamentoInput): Promise<Medicamento> {
    try {
      const usuarioObjectId = new Types.ObjectId(input.usuario_id);
      const nuevoMedicamento = new this.medicamentoModel({
        ...input,
        usuario_id: usuarioObjectId,
      });
      return await nuevoMedicamento.save();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      throw new GraphQLError(`Fallo al guardar el medicamento: ${errorMessage}`, {
        extensions: { code: 'BAD_USER_INPUT' },
      });
    }
  }

  // NUEVO MÉTODO DE LECTURA
  async findAllByUserId(usuario_id: string): Promise<Medicamento[]> {
    try {
      const usuarioObjectId = new Types.ObjectId(usuario_id);
      // Busca todos los medicamentos de este usuario que no hayan sido marcados para borrado lógico (TTL)
      return await this.medicamentoModel.find({ 
        usuario_id: usuarioObjectId,
        fecha_eliminacion: { $exists: false } 
      }).exec();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      throw new GraphQLError(`Error al consultar medicamentos: ${errorMessage}`, {
        extensions: { code: 'INTERNAL_SERVER_ERROR' },
      });
    }
  }
}