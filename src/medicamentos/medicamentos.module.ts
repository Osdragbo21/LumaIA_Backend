// Ruta: src/medicamentos/medicamentos.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MedicamentosService } from './medicamentos.service';
import { MedicamentosResolver } from './medicamentos.resolver';
import { Medicamento, MedicamentoSchema } from './entities/medicamento.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Medicamento.name, schema: MedicamentoSchema }]),
  ],
  providers: [MedicamentosResolver, MedicamentosService],
  exports: [MedicamentosService],
})
export class MedicamentosModule {}