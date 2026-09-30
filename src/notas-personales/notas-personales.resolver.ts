// Ruta: src/notas-personales/notas-personales.resolver.ts
import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { NotaPersonal } from './entities/nota-personal.entity';
import { CreateNotaPersonalInput } from './dto/create-nota-personal.input';
import { NotasPersonalesService } from './notas-personales.service';

@Resolver(() => NotaPersonal)
export class NotasPersonalesResolver {
  constructor(private readonly notasPersonalesService: NotasPersonalesService) {}

  @Query(() => [NotaPersonal], { name: 'obtenerNotasPersonalesPorUsuario' })
  async obtenerNotasPersonalesPorUsuario(
    @Args('usuario_id', { type: () => ID }) usuario_id: string,
  ): Promise<NotaPersonal[]> {
    return this.notasPersonalesService.findAllByUserId(usuario_id);
  }

  @Mutation(() => NotaPersonal, { name: 'crearNotaPersonal' })
  async crearNotaPersonal(
    @Args('createNotaPersonalInput') createNotaPersonalInput: CreateNotaPersonalInput,
  ): Promise<NotaPersonal> {
    return this.notasPersonalesService.create(createNotaPersonalInput);
  }
}