// Ruta: src/citas/citas.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { GraphQLError } from 'graphql';
import { Cita } from './entities/cita.entity';
import { CreateCitaInput } from './dto/create-cita.input';

@Injectable()
export class CitasService {
  constructor(
    @InjectModel(Cita.name) private citaModel: Model<Cita>,
  ) {}

  async create(input: CreateCitaInput): Promise<Cita> {
    try {
      // 1. Casteo estricto del String a ObjectId
      const usuarioObjectId = new Types.ObjectId(input.usuario_id);
      
      // 2. Instancia y guardado en la colección
      const nuevaCita = new this.citaModel({
        ...input,
        usuario_id: usuarioObjectId,
      });
      return await nuevaCita.save();
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      throw new GraphQLError(`Fallo al programar la cita: ${errorMessage}`, {
        extensions: { code: 'BAD_USER_INPUT' },
      });
    }
  }

  async findAllByUserId(usuario_id: string): Promise<Cita[]> {
    try {
      const usuarioObjectId = new Types.ObjectId(usuario_id);
      // 3. Obtener citas activas (ignorando las que están en papelera TTL)
      return await this.citaModel.find({ 
        usuario_id: usuarioObjectId,
        fecha_eliminacion: { $exists: false } 
      }).exec();
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      throw new GraphQLError(`Error al consultar la agenda: ${errorMessage}`, {
        extensions: { code: 'INTERNAL_SERVER_ERROR' },
      });
    }
  }
}