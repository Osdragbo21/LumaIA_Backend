// Ruta: src/asistente/asistente.module.ts
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import { AsistenteService } from './asistente.service';
import { AsistenteResolver } from './asistente.resolver';
import { Medicamento, MedicamentoSchema } from '../medicamentos/entities/medicamento.entity';
import { LogInteraccion, LogInteraccionSchema } from '../logs-interaccion/entities/log-interaccion.entity';

@Module({
  imports: [
    HttpModule,
    MongooseModule.forFeature([
      { name: Medicamento.name, schema: MedicamentoSchema },
      { name: LogInteraccion.name, schema: LogInteraccionSchema },
    ]),
  ],
  providers: [AsistenteResolver, AsistenteService],
})
export class AsistenteModule {}