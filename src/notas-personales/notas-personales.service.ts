// [BACKEND] Ruta: src/notas-personales/notas-personales.service.ts

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { GraphQLError } from 'graphql';
import { NotaPersonal } from './entities/nota-personal.entity';
import { CreateNotaPersonalInput, UpdateNotaPersonalInput } from './dto/create-nota-personal.input';

@Injectable()
export class NotasPersonalesService {
  constructor(@InjectModel(NotaPersonal.name) private notaPersonalModel: Model<NotaPersonal>) {}

  async create(input: CreateNotaPersonalInput): Promise<NotaPersonal> {
    const nuevaNota = new this.notaPersonalModel({ ...input, usuario_id: new Types.ObjectId(input.usuario_id) });
    return await nuevaNota.save();
  }

  async findAllByUserId(usuario_id: string): Promise<NotaPersonal[]> {
    return await this.notaPersonalModel.find({ usuario_id: new Types.ObjectId(usuario_id), fecha_eliminacion: { $exists: false } }).exec();
  }

  async findDeletedByUserId(usuario_id: string): Promise<NotaPersonal[]> {
    return await this.notaPersonalModel.find({ usuario_id: new Types.ObjectId(usuario_id), fecha_eliminacion: { $exists: true } }).exec();
  }

  async update(input: UpdateNotaPersonalInput): Promise<NotaPersonal> {
    const { _id, ...updateData } = input;
    const actualizado = await this.notaPersonalModel.findByIdAndUpdate(_id, updateData, { new: true }).exec();
    if (!actualizado) throw new GraphQLError('Nota no encontrada');
    return actualizado;
  }

  async softDelete(id: string): Promise<NotaPersonal> {
    const borrado = await this.notaPersonalModel.findByIdAndUpdate(id, { fecha_eliminacion: new Date() }, { new: true }).exec();
    if (!borrado) throw new GraphQLError('Nota no encontrada');
    return borrado;
  }

  async restore(id: string): Promise<NotaPersonal> {
    const restaurado = await this.notaPersonalModel.findByIdAndUpdate(id, { $unset: { fecha_eliminacion: 1 } }, { new: true }).exec();
    if (!restaurado) throw new GraphQLError('Nota no encontrada');
    return restaurado;
  }
}