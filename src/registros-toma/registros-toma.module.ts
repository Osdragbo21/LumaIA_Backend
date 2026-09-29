// Ruta: src/registros-toma/registros-toma.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RegistrosTomaService } from './registros-toma.service';
import { RegistrosTomaResolver } from './registros-toma.resolver';
import { RegistroToma, RegistroTomaSchema } from './entities/registro-toma.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: RegistroToma.name, schema: RegistroTomaSchema }]),
  ],
  providers: [RegistrosTomaResolver, RegistrosTomaService],
  exports: [RegistrosTomaService], // Exportable para cruzar datos con el Motor IA
})
export class RegistrosTomaModule {}