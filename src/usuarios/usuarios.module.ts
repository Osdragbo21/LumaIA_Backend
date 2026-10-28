// [BACKEND] Ruta: src/usuarios/usuarios.module.ts

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsuariosService } from './usuarios.service';
import { UsuariosResolver } from './usuarios.resolver';
import { Usuario, UsuarioSchema } from './entities/usuario.entity';
import { Medicamento, MedicamentoSchema } from '../medicamentos/entities/medicamento.entity';
import { Cita, CitaSchema } from '../citas/entities/cita.entity';
import { RegistroToma, RegistroTomaSchema } from '../registros-toma/entities/registro-toma.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Usuario.name, schema: UsuarioSchema },
      { name: Medicamento.name, schema: MedicamentoSchema },
      { name: Cita.name, schema: CitaSchema },
      { name: RegistroToma.name, schema: RegistroTomaSchema }
    ]),
  ],
  providers: [UsuariosResolver, UsuariosService],
  exports: [UsuariosService],
})
export class UsuariosModule {}