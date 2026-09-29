// Ruta: src/notas-personales/notas-personales.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotasPersonalesService } from './notas-personales.service';
import { NotasPersonalesResolver } from './notas-personales.resolver';
import { NotaPersonal, NotaPersonalSchema } from './entities/nota-personal.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: NotaPersonal.name, schema: NotaPersonalSchema }]),
  ],
  providers: [NotasPersonalesResolver, NotasPersonalesService],
  exports: [NotasPersonalesService],
})
export class NotasPersonalesModule {}