// Ruta: src/citas/citas.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CitasService } from './citas.service';
import { CitasResolver } from './citas.resolver';
import { Cita, CitaSchema } from './entities/cita.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Cita.name, schema: CitaSchema }]),
  ],
  providers: [CitasResolver, CitasService],
  exports: [CitasService],
})
export class CitasModule {}