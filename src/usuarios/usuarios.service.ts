// Ruta: src/usuarios/usuarios.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { GraphQLError } from 'graphql';
import * as bcrypt from 'bcrypt';
import { Usuario } from './entities/usuario.entity';
import { AgregarContactoInput } from './dto/agregar-contacto.input';
import { CreateUsuarioInput } from './dto/create-usuario.input';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectModel(Usuario.name) private usuarioModel: Model<Usuario>,
  ) {}

  // 1. Obtener perfil completo
  async findOneById(usuario_id: string): Promise<Usuario> {
    try {
      const objectId = new Types.ObjectId(usuario_id);
      const usuario = await this.usuarioModel.findById(objectId).exec();
      if (!usuario) throw new Error('Usuario no encontrado');
      return usuario;
    } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      throw new GraphQLError(`Error al obtener perfil: ${errorMessage}`, {
        extensions: { code: 'BAD_USER_INPUT' },
      });
    }
  }

  // 2. Agregar contacto al arreglo usando modificador atómico $push
  async agregarContacto(input: AgregarContactoInput): Promise<Usuario> {
    try {
      const { usuario_id, ...nuevoContacto } = input;
      const objectId = new Types.ObjectId(usuario_id);

      const usuarioActualizado = await this.usuarioModel.findByIdAndUpdate(
        objectId,
        { $push: { contactos_emergencia: nuevoContacto } },
        { new: true } // Retorna el documento actualizado
      ).exec();

      if (!usuarioActualizado) throw new Error('Usuario no encontrado');
      return usuarioActualizado;
    } catch (error) {
              const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      throw new GraphQLError(`Fallo al agregar contacto: ${errorMessage}`, {
        extensions: { code: 'INTERNAL_SERVER_ERROR' },
      });
    }
  }
  
  async registrarUsuario(input: CreateUsuarioInput): Promise<Usuario> {
    try {
      const { password, ...restoDatos } = input;
      
      // 1. Generar Hash con bcrypt (Cumplimiento RNF-06)
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(password, salt);

      // 2. Instanciar documento con los campos iniciales requeridos
      const nuevoUsuario = new this.usuarioModel({
        ...restoDatos,
        password_hash,
        estado_activo: true,
        tokens_dispositivo: [],
        contactos_emergencia: [],
      });

      // 3. Guardar en MongoDB Atlas
      return await nuevoUsuario.save();
    } catch (error) {
      // Manejo de restricción de unicidad de correo (Error 11000 en MongoDB)
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 11000
      ) {
        throw new GraphQLError('El correo electrónico ya está registrado.', {
          extensions: { code: 'CONFLICT' },
        });
      }
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      throw new GraphQLError(`Fallo al registrar usuario: ${errorMessage}`, {
        extensions: { code: 'INTERNAL_SERVER_ERROR' },
      });
    }
  }
}