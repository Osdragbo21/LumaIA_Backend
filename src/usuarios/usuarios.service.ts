// [BACKEND] Ruta: src/usuarios/usuarios.service.ts

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { GraphQLError } from 'graphql';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto'; // NUEVO: Para generar el PIN seguro
import { Usuario, Enum_Rol } from './entities/usuario.entity';
import { CreateUsuarioInput } from './dto/create-usuario.input';
import { AgregarContactoInput } from './dto/agregar-contacto.input';
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

  async obtenerUsuario(usuario_id: string): Promise<Usuario> {
    try {
      if (!Types.ObjectId.isValid(usuario_id)) throw new Error('ID de usuario inválido.');
      const usuario = await this.usuarioModel.findById(usuario_id).exec();
      if (!usuario) throw new Error('Usuario no encontrado.');
      return usuario as unknown as Usuario;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      throw new GraphQLError(`Error al obtener usuario: ${errorMessage}`);
    }
  }

  async agregarContactoEmergencia(input: AgregarContactoInput): Promise<Usuario> {
    try {
      if (!Types.ObjectId.isValid(input.usuario_id)) throw new Error('ID de usuario inválido.');
      const usuarioActualizado = await this.usuarioModel.findByIdAndUpdate(
        input.usuario_id,
        {
          $push: {
            contactos_emergencia: {
              nombre_contacto: input.nombre_contacto,
              telefono: input.telefono,
              parentesco: input.parentesco,
            }
          }
        },
        { new: true }
      ).exec();

      if (!usuarioActualizado) throw new Error('Usuario no encontrado.');
      return usuarioActualizado as unknown as Usuario;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      throw new GraphQLError(`Error al agregar contacto: ${errorMessage}`);
    }
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

  // NUEVO: Generar PIN (RF-04 y S-05)
  async generarPinVinculacion(usuario_id: string): Promise<string> {
    try {
      if (!Types.ObjectId.isValid(usuario_id)) throw new Error('ID de usuario inválido.');
      
      const pin = crypto.randomInt(100000, 999999).toString();
      const expiracion = new Date(Date.now() + 10 * 60000); // 10 minutos desde ahora

      await this.usuarioModel.findByIdAndUpdate(usuario_id, {
        pin_vinculacion: pin,
        expiracion_pin: expiracion
      }).exec();

      return pin;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      throw new GraphQLError(`Error al generar PIN: ${errorMessage}`);
    }
  }

  // NUEVO: Vincular por PIN en lugar de correo
  async vincularAdultoMayor(cuidador_id: string, pin: string): Promise<Usuario> {
    try {
      if (!Types.ObjectId.isValid(cuidador_id)) throw new Error('ID de cuidador inválido.');
      const cuidadorObjectId = new Types.ObjectId(cuidador_id);
      
      const adulto = await this.usuarioModel.findOne({ 
        pin_vinculacion: pin, 
        rol: Enum_Rol.ADULTO_MAYOR 
      }).exec();
      
      if (!adulto) throw new Error('El PIN ingresado es incorrecto.');

      // Validar expiración (S-05)
      if (adulto.expiracion_pin && adulto.expiracion_pin < new Date()) {
        throw new Error('El PIN ha expirado. Pide al Adulto Mayor que genere uno nuevo.');
      }

      // Vincular
      await this.usuarioModel.findByIdAndUpdate(cuidadorObjectId, {
        $addToSet: { adultos_vinculados: (adulto as any)._id }
      }).exec();

      (adulto as any).cuidador_vinculado_id = cuidadorObjectId;
      // Eliminar el PIN tras usarlo (Un solo uso)
      (adulto as any).pin_vinculacion = undefined;
      (adulto as any).expiracion_pin = undefined;
      
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
        
        return { adulto, medicamentos, citas_hoy, tomas_hoy };
      }));

      return resumenAdultos;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      throw new GraphQLError(`Error al consultar vinculados: ${errorMessage}`);
    }
  }
}