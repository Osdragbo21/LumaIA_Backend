// Ruta: src/registros-toma/registros-toma.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RegistrosTomaService } from './registros-toma.service';
import { RegistrosTomaResolver } from './registros-toma.resolver';
import { RegistroToma, RegistroTomaSchema } from './entities/registro-toma.entity';
import { Medicamento, MedicamentoSchema } from '../medicamentos/entities/medicamento.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: RegistroToma.name, schema: RegistroTomaSchema }]),
    MongooseModule.forFeature([{ name: Medicamento.name, schema: MedicamentoSchema }]), // Inyectamos el modelo de Medicamento
  ],
  providers: [RegistrosTomaResolver, RegistrosTomaService],
  exports: [RegistrosTomaService], // Exportable para cruzar datos con el Motor IA
})
export class RegistrosTomaModule {}