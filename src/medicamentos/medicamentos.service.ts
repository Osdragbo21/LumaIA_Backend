// [BACKEND] Ruta: src/medicamentos/medicamentos.service.ts

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { GraphQLError } from 'graphql';
import { Medicamento } from './entities/medicamento.entity';
import { CreateMedicamentoInput, UpdateMedicamentoInput } from './dto/create-medicamento.input';

@Injectable()
export class MedicamentosService {
  constructor(
    @InjectModel(Medicamento.name) private medicamentoModel: Model<Medicamento>,
  ) {}

  private calcularHorarios(horaInicialStr: string, frecuencia: number): string[] {
    const partesHora = horaInicialStr.split(':');
    if (partesHora.length !== 2) return [horaInicialStr];
    
    const horaInicial = parseInt(partesHora[0], 10);
    const minutos = parseInt(partesHora[1], 10);
    const limiteTomasDia = Math.floor(24 / frecuencia);
    const horariosCalculados = [];

    for (let i = 0; i < limiteTomasDia; i++) {
      const horaCalculada = (horaInicial + (i * frecuencia)) % 24;
      const hh = horaCalculada.toString().padStart(2, '0');
      const mm = minutos.toString().padStart(2, '0');
      horariosCalculados.push(`${hh}:${mm}`);
    }
    return horariosCalculados;
  }

  async create(input: CreateMedicamentoInput): Promise<Medicamento> {
    try {
      const usuarioObjectId = new Types.ObjectId(input.usuario_id);
      let horariosCalculados = input.horarios_especificos;

      if (input.horarios_especificos?.length > 0 && input.frecuencia_horas && input.frecuencia_horas > 0) {
        horariosCalculados = this.calcularHorarios(input.horarios_especificos[0], input.frecuencia_horas);
      }

      const nuevoMedicamento = new this.medicamentoModel({
        ...input,
        usuario_id: usuarioObjectId,
        horarios_especificos: horariosCalculados,
      });

      return await nuevoMedicamento.save();
    } catch (error) {
      throw new GraphQLError(`Fallo al guardar el medicamento: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async findAllByUserId(usuario_id: string): Promise<Medicamento[]> {
    return await this.medicamentoModel.find({ 
      usuario_id: new Types.ObjectId(usuario_id),
      fecha_eliminacion: { $exists: false } 
    }).exec();
  }

  // NUEVO: Obtener los eliminados (Papelera)
  async findDeletedByUserId(usuario_id: string): Promise<Medicamento[]> {
    return await this.medicamentoModel.find({ 
      usuario_id: new Types.ObjectId(usuario_id),
      fecha_eliminacion: { $exists: true } 
    }).exec();
  }

  // NUEVO: Actualizar
  async update(input: UpdateMedicamentoInput): Promise<Medicamento> {
    try {
      const { _id, ...updateData } = input;
      
      // Si cambian la hora o frecuencia, recalculamos
      if (updateData.horarios_especificos?.length > 0 && updateData.frecuencia_horas) {
        updateData.horarios_especificos = this.calcularHorarios(updateData.horarios_especificos[0], updateData.frecuencia_horas);
      }

      const actualizado = await this.medicamentoModel.findByIdAndUpdate(_id, updateData, { new: true }).exec();
      if (!actualizado) throw new Error('Medicamento no encontrado');
      return actualizado;
    } catch (error) {
      throw new GraphQLError(`Error al actualizar: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // NUEVO: Borrado Lógico (Mover a papelera)
  async softDelete(id: string): Promise<Medicamento> {
    const borrado = await this.medicamentoModel.findByIdAndUpdate(id, { fecha_eliminacion: new Date() }, { new: true }).exec();
    if (!borrado) throw new GraphQLError('Medicamento no encontrado');
    return borrado;
  }

  // NUEVO: Restaurar de papelera
  async restore(id: string): Promise<Medicamento> {
    const restaurado = await this.medicamentoModel.findByIdAndUpdate(id, { $unset: { fecha_eliminacion: 1 } }, { new: true }).exec();
    if (!restaurado) throw new GraphQLError('Medicamento no encontrado');
    return restaurado;
  }
}