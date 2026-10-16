// [BACKEND] Ruta: src/registros-toma/registros-toma.resolver.ts

import { Resolver, Mutation, Args, ID, Query } from '@nestjs/graphql';
import { RegistroToma } from './entities/registro-toma.entity';
import { RegistrosTomaService } from './registros-toma.service';

@Resolver(() => RegistroToma)
export class RegistrosTomaResolver {
  constructor(private readonly registrosTomaService: RegistrosTomaService) {}

  @Query(() => [RegistroToma], { name: 'registrosTomaBase' })
  obtenerRegistrosToma(): RegistroToma[] {
    return [];
  }

  // NUEVA MUTACIÓN PARA EL BOTÓN "LISTO ✔"
  @Mutation(() => RegistroToma, { name: 'confirmarTomaMedicamento' })
  async confirmarTomaMedicamento(
    @Args('medicamento_id', { type: () => ID }) medicamento_id: string,
  ): Promise<RegistroToma> {
    return this.registrosTomaService.confirmarToma(medicamento_id);
  }
}