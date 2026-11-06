// [BACKEND] Ruta: src/analitica/analitica.module.ts

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios'; // NUEVO: Importamos HttpModule
import { AnaliticaService } from './analitica.service';
import { AnaliticaResolver } from './analitica.resolver';
import { Usuario, UsuarioSchema } from '../usuarios/entities/usuario.entity';
import { RegistroToma, RegistroTomaSchema } from '../registros-toma/entities/registro-toma.entity';
import { LogInteraccion, LogInteraccionSchema } from '../logs-interaccion/entities/log-interaccion.entity';

@Module({
  imports: [
    HttpModule, // NUEVO: Registramos el módulo HTTP
    MongooseModule.forFeature([
      { name: Usuario.name, schema: UsuarioSchema },
      { name: RegistroToma.name, schema: RegistroTomaSchema },
      { name: LogInteraccion.name, schema: LogInteraccionSchema },
    ]),
  ],
  providers: [AnaliticaResolver, AnaliticaService],
})
export class AnaliticaModule {}