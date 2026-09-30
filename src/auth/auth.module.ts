// Ruta: src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { Usuario, UsuarioSchema } from '../usuarios/entities/usuario.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Usuario.name, schema: UsuarioSchema }]),
    JwtModule.register({
      global: true,
      secret: 'LUMAIA_DEV_SECRET_KEY_2026', // En producción, mover a variables de entorno .env
      signOptions: { expiresIn: '30d' }, // RF-03: Sesión persistente
    }),
  ],
  providers: [AuthResolver, AuthService],
})
export class AuthModule {}