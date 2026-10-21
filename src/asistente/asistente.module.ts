// [BACKEND] Ruta: src/asistente/asistente.module.ts

import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import { AsistenteService } from './asistente.service';
import { AsistenteResolver } from './asistente.resolver';
import { Medicamento, MedicamentoSchema } from '../medicamentos/entities/medicamento.entity';
import { LogInteraccion, LogInteraccionSchema } from '../logs-interaccion/entities/log-interaccion.entity';
import { Cita, CitaSchema } from '../citas/entities/cita.entity'; // <-- NUEVO
import { RegistroToma, RegistroTomaSchema } from '../registros-toma/entities/registro-toma.entity';

@Module({
  imports: [
    HttpModule,
    MongooseModule.forFeature([
      { name: Medicamento.name, schema: MedicamentoSchema },
      { name: LogInteraccion.name, schema: LogInteraccionSchema },
      { name: Cita.name, schema: CitaSchema }, // <-- NUEVO
    ]),
    MongooseModule.forFeature([{ name: RegistroToma.name, schema: RegistroTomaSchema }]), // <-- NUEVO
  ],
  providers: [AsistenteResolver, AsistenteService],
})
export class AsistenteModule {}