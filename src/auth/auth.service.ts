// Ruta: src/auth/auth.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { GraphQLError } from 'graphql';
import * as bcrypt from 'bcrypt';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { LoginResponse } from './dto/login-response.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Usuario.name) private usuarioModel: Model<Usuario>,
    private jwtService: JwtService,
  ) {}

  async validarUsuario(correo: string, password_plana: string): Promise<LoginResponse> {
    // 1. Buscar usuario por correo en MongoDB Atlas
    const usuario = await this.usuarioModel.findOne({ correo }).exec();
    if (!usuario) {
      throw new GraphQLError('Correo o contraseña incorrectos.', { extensions: { code: 'UNAUTHENTICATED' } });
    }

    // 2. Comparar la contraseña plana contra el Hash seguro (RNF-06)
    const passwordValida = await bcrypt.compare(password_plana, usuario.password_hash);
    if (!passwordValida) {
      throw new GraphQLError('Correo o contraseña incorrectos.', { extensions: { code: 'UNAUTHENTICATED' } });
    }

    // 3. Validar borrado lógico
    if (!usuario.estado_activo) {
      throw new GraphQLError('Esta cuenta se encuentra desactivada.', { extensions: { code: 'FORBIDDEN' } });
    }

    // 4. Firmar el Token JWT (RF-03.1)
    const payload = { sub: usuario._id, rol: usuario.rol };
    const access_token = await this.jwtService.signAsync(payload);

    return {
      access_token,
      usuario_id: usuario._id.toString(),
      rol: usuario.rol,
    };
  }
}