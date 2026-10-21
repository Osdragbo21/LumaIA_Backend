// [BACKEND] Ruta: src/medicamentos/medicamentos.service.ts

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
      
      // 1. Clonamos el arreglo original para manipularlo
      let horariosCalculados = input.horarios_especificos;

      // 2. Algoritmo de Cálculo de Horarios
      if (
        input.horarios_especificos && 
        input.horarios_especificos.length > 0 && 
        input.frecuencia_horas && 
        input.frecuencia_horas > 0
      ) {
        // Extraemos la primera toma (Ej. "08:30")
        const horaInicialStr = input.horarios_especificos[0];
        const partesHora = horaInicialStr.split(':');
        
        if (partesHora.length === 2) {
          const horaInicial = parseInt(partesHora[0], 10);
          const minutos = parseInt(partesHora[1], 10);

          // Límite de tomas al día (Ej. 24 / 8 = 3 tomas)
          const limiteTomasDia = Math.floor(24 / input.frecuencia_horas);
          
          horariosCalculados = []; // Vaciamos para llenarlo con la secuencia completa

          // Generamos la secuencia de horarios
          for (let i = 0; i < limiteTomasDia; i++) {
            // Calculamos la hora sumando la frecuencia y usando módulo 24 para saltos de medianoche
            const horaCalculada = (horaInicial + (i * input.frecuencia_horas)) % 24;
            
            // Formateo seguro a string de dos dígitos (HH:mm)
            const hh = horaCalculada.toString().padStart(2, '0');
            const mm = minutos.toString().padStart(2, '0');
            
            horariosCalculados.push(`${hh}:${mm}`);
          }
        }
      }

      // 3. Instanciar documento con el arreglo calculado y guardar
      const nuevoMedicamento = new this.medicamentoModel({
        ...input,
        usuario_id: usuarioObjectId,
        horarios_especificos: horariosCalculados, // Reemplazamos con el nuevo arreglo
      });

      return await nuevoMedicamento.save();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      throw new GraphQLError(`Fallo al guardar el medicamento: ${errorMessage}`, {
        extensions: { code: 'BAD_USER_INPUT' },
      });
    }
  }

  // MÉTODO DE LECTURA INTACTO
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