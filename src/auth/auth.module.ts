// [BACKEND] Ruta: src/auth/auth.module.ts

import { Module, Global } from '@nestjs/common'; // <-- CORRECCIÓN: Importamos Global
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { Usuario, UsuarioSchema } from '../usuarios/entities/usuario.entity';

@Global() // <-- CORRECCIÓN: Hace que JwtModule y AuthService estén disponibles en toda la app sin tener que importarlos módulo por módulo
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Usuario.name, schema: UsuarioSchema }]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '30d' },
      }),
    }),
  ],
  providers: [AuthResolver, AuthService],
  exports: [JwtModule], // Exportamos JwtModule para que los Guards de otros módulos puedan usarlo
})
export class AuthModule {}