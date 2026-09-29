// Ruta: src/registros-toma/registros-toma.resolver.ts
import { Resolver, Query } from '@nestjs/graphql';
import { RegistroToma } from './entities/registro-toma.entity';


@Resolver(() => RegistroToma)
export class RegistrosTomaResolver {
  @Query(() => [RegistroToma], { name: 'registrosTomaBase' })
  obtenerRegistrosToma(): RegistroToma[] {
    return [];
  }
}