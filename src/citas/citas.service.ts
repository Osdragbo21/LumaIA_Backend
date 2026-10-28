// [BACKEND] Ruta: src/citas/citas.service.ts

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { GraphQLError } from 'graphql';
import { Cita } from './entities/cita.entity';
import { CreateCitaInput, UpdateCitaInput } from './dto/create-cita.input';

@Injectable()
export class CitasService {
  constructor(@InjectModel(Cita.name) private citaModel: Model<Cita>) {}

  async create(input: CreateCitaInput): Promise<Cita> {
    const nuevaCita = new this.citaModel({ ...input, usuario_id: new Types.ObjectId(input.usuario_id) });
    return await nuevaCita.save();
  }

  async findAllByUserId(usuario_id: string): Promise<Cita[]> {
    return await this.citaModel.find({ usuario_id: new Types.ObjectId(usuario_id), fecha_eliminacion: { $exists: false } }).exec();
  }

  async findDeletedByUserId(usuario_id: string): Promise<Cita[]> {
    return await this.citaModel.find({ usuario_id: new Types.ObjectId(usuario_id), fecha_eliminacion: { $exists: true } }).exec();
  }

  async update(input: UpdateCitaInput): Promise<Cita> {
    const { _id, ...updateData } = input;
    const actualizado = await this.citaModel.findByIdAndUpdate(_id, updateData, { new: true }).exec();
    if (!actualizado) throw new GraphQLError('Cita no encontrada');
    return actualizado;
  }

  async softDelete(id: string): Promise<Cita> {
    const borrado = await this.citaModel.findByIdAndUpdate(id, { fecha_eliminacion: new Date() }, { new: true }).exec();
    if (!borrado) throw new GraphQLError('Cita no encontrada');
    return borrado;
  }

  async restore(id: string): Promise<Cita> {
    const restaurado = await this.citaModel.findByIdAndUpdate(id, { $unset: { fecha_eliminacion: 1 } }, { new: true }).exec();
    if (!restaurado) throw new GraphQLError('Cita no encontrada');
    return restaurado;
  }
}