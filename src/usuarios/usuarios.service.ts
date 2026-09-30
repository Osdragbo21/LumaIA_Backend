// Ruta: src/usuarios/usuarios.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { GraphQLError } from 'graphql';
import { Usuario } from './entities/usuario.entity';
import { AgregarContactoInput } from './dto/agregar-contacto.input';

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
}