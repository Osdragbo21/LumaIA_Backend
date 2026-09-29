// Ruta: src/medicamentos/medicamentos.resolver.ts
import { Resolver, Query } from '@nestjs/graphql';
import { Medicamento } from './entities/medicamento.entity';

@Resolver(() => Medicamento)
export class MedicamentosResolver {
  @Query(() => [Medicamento], { name: 'medicamentosBase' })
  obtenerMedicamentos(): Medicamento[] {
    return [];
  }
}