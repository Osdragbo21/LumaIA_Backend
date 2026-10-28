// [BACKEND] Ruta: src/usuarios/usuarios.service.ts

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { GraphQLError } from 'graphql';
import * as bcrypt from 'bcrypt';
// CORRECCIÓN 1: Importamos Enum_Rol para usarlo en las consultas
import { Usuario, Enum_Rol } from './entities/usuario.entity';
import { CreateUsuarioInput } from './dto/create-usuario.input';
import { Medicamento } from '../medicamentos/entities/medicamento.entity';
import { Cita } from '../citas/entities/cita.entity';
import { RegistroToma, Enum_EstadoToma } from '../registros-toma/entities/registro-toma.entity';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectModel(Usuario.name) private usuarioModel: Model<Usuario>,
    @InjectModel(Medicamento.name) private medicamentoModel: Model<Medicamento>,
    @InjectModel(Cita.name) private citaModel: Model<Cita>,
    @InjectModel(RegistroToma.name) private registroTomaModel: Model<RegistroToma>,
  ) {}

  private getRangoDiaLocalUTC(offsetHoras: number = -6): { inicioDia: Date, finDia: Date } {
    const ahora = new Date();
    const horaLocal = new Date(ahora.getTime() + offsetHoras * 3600 * 1000);

    const inicioDiaLocal = new Date(horaLocal);
    inicioDiaLocal.setUTCHours(0, 0, 0, 0);
    const inicioDiaUTC = new Date(inicioDiaLocal.getTime() - offsetHoras * 3600 * 1000);

    const finDiaLocal = new Date(horaLocal);
    finDiaLocal.setUTCHours(23, 59, 59, 999);
    const finDiaUTC = new Date(finDiaLocal.getTime() - offsetHoras * 3600 * 1000);

    return { inicioDia: inicioDiaUTC, finDia: finDiaUTC };
  }

  async registrarUsuario(input: CreateUsuarioInput): Promise<Usuario> {
    try {
      const existe = await this.usuarioModel.findOne({ correo: input.correo }).exec();
      if (existe) {
        throw new Error('El correo ya está registrado.');
      }

      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(input.password, salt);
      
      const nuevoUsuario = new this.usuarioModel({
        ...input,
        password_hash: hash,
      });
      
      const usuarioGuardado = await nuevoUsuario.save();
      return usuarioGuardado as unknown as Usuario;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      throw new GraphQLError(`Error al registrar: ${errorMessage}`, {
        extensions: { code: 'BAD_USER_INPUT' }
      });
    }
  }

  async vincularAdultoMayor(cuidador_id: string, correo_adulto: string): Promise<Usuario> {
    try {
      if (!Types.ObjectId.isValid(cuidador_id)) throw new Error('ID de cuidador inválido.');
      const cuidadorObjectId = new Types.ObjectId(cuidador_id);
      
      // CORRECCIÓN 2: Usamos el Enum_Rol explícito en lugar del string quemado
      const adulto = await this.usuarioModel.findOne({ 
        correo: correo_adulto, 
        rol: Enum_Rol.ADULTO_MAYOR 
      }).exec();
      
      if (!adulto) throw new Error('No se encontró un Adulto Mayor con ese correo.');

      await this.usuarioModel.findByIdAndUpdate(cuidadorObjectId, {
        // CORRECCIÓN 3: Forzamos (adulto as any) para que TypeScript no se queje del _id
        $addToSet: { adultos_vinculados: (adulto as any)._id }
      }).exec();

      // CORRECCIÓN 4: Forzamos (adulto as any) para asignar la propiedad sin errores de tipos
      (adulto as any).cuidador_vinculado_id = cuidadorObjectId;
      const adultoGuardado = await adulto.save();
      
      return adultoGuardado as unknown as Usuario;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      throw new GraphQLError(`Fallo al vincular: ${errorMessage}`);
    }
  }

  async obtenerAdultosVinculados(cuidador_id: string): Promise<any[]> {
    try {
      if (!Types.ObjectId.isValid(cuidador_id)) throw new Error('ID de cuidador inválido.');
      
      const cuidador = await this.usuarioModel.findById(new Types.ObjectId(cuidador_id)).exec();
      if (!cuidador || !cuidador.adultos_vinculados || cuidador.adultos_vinculados.length === 0) return [];

      const adultos = await this.usuarioModel.find({ _id: { $in: cuidador.adultos_vinculados } }).exec();
      
      const { inicioDia, finDia } = this.getRangoDiaLocalUTC(-6);

      const resumenAdultos = await Promise.all(adultos.map(async (adulto) => {
        const medicamentos = await this.medicamentoModel.find({ usuario_id: adulto._id, fecha_eliminacion: { $exists: false } }).exec();
        const citas_hoy = await this.citaModel.find({ usuario_id: adulto._id, fecha_eliminacion: { $exists: false }, fecha_hora: { $gte: inicioDia, $lte: finDia } }).exec();
        const tomas_hoy = await this.registroTomaModel.find({ medicamento_id: { $in: medicamentos.map(m => m._id) }, estado_toma: Enum_EstadoToma.CONFIRMADA, fecha_confirmacion: { $gte: inicioDia, $lte: finDia } }).exec();
        
        return {
          adulto,
          medicamentos,
          citas_hoy,
          tomas_hoy
        };
      }));

      return resumenAdultos;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      throw new GraphQLError(`Error al consultar vinculados: ${errorMessage}`);
    }
  }
}