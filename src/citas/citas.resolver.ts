// Ruta: src/citas/citas.resolver.ts
import { Resolver, Query } from '@nestjs/graphql';
import { Cita } from './entities/cita.entity';

@Resolver(() => Cita)
export class CitasResolver {
  @Query(() => [Cita], { name: 'citasBase' })
  obtenerCitas(): Cita[] {
    return [];
  }
}