// Ruta: src/notas-personales/notas-personales.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { GraphQLError } from 'graphql';
import { NotaPersonal } from './entities/nota-personal.entity';
import { CreateNotaPersonalInput } from './dto/create-nota-personal.input';

@Injectable()
export class NotasPersonalesService {
  constructor(
    @InjectModel(NotaPersonal.name) private notaPersonalModel: Model<NotaPersonal>,
  ) {}

  async create(input: CreateNotaPersonalInput): Promise<NotaPersonal> {
    try {
      const usuarioObjectId = new Types.ObjectId(input.usuario_id);
      
      const nuevaNota = new this.notaPersonalModel({
        ...input,
        usuario_id: usuarioObjectId,
      });
      return await nuevaNota.save();
    } catch (error) {
              const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      throw new GraphQLError(`Fallo al guardar la nota: ${errorMessage}`, {
        extensions: { code: 'BAD_USER_INPUT' },
      });
    }
  }

  async findAllByUserId(usuario_id: string): Promise<NotaPersonal[]> {
    try {
      const usuarioObjectId = new Types.ObjectId(usuario_id);
      
      return await this.notaPersonalModel.find({ 
        usuario_id: usuarioObjectId,
        fecha_eliminacion: { $exists: false } 
      }).exec();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      throw new GraphQLError(`Error al consultar las notas: ${errorMessage}`, {
        extensions: { code: 'INTERNAL_SERVER_ERROR' },
      });
    }
  }
}