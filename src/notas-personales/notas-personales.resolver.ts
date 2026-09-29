// Ruta: src/notas-personales/notas-personales.resolver.ts
import { Resolver, Query } from '@nestjs/graphql';
import { NotaPersonal } from './entities/nota-personal.entity';

@Resolver(() => NotaPersonal)
export class NotasPersonalesResolver {
  @Query(() => [NotaPersonal], { name: 'notasPersonalesBase' })
  obtenerNotasPersonales(): NotaPersonal[] {
    return [];
  }
}