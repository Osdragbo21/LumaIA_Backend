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
      // 1. Casteo estricto del String a ObjectId de MongoDB
      const usuarioObjectId = new Types.ObjectId(input.usuario_id);

      // 2. Instancia del documento
      const nuevoMedicamento = new this.medicamentoModel({
        ...input,
        usuario_id: usuarioObjectId,
      });

      // 3. Inserción real en Atlas
      return await nuevoMedicamento.save();
    } catch (error) {
      // 4. Romper el silencio: Lanza error formal de GraphQL al Frontend
      throw new GraphQLError(`Fallo al guardar el medicamento: ${error.message}`, {
        extensions: { code: 'BAD_USER_INPUT' },
      });
    }
  }
}