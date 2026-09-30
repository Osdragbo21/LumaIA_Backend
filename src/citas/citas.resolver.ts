// Ruta: src/citas/citas.resolver.ts
import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { Cita } from './entities/cita.entity';
import { CreateCitaInput } from './dto/create-cita.input';
import { CitasService } from './citas.service';

@Resolver(() => Cita)
export class CitasResolver {
  constructor(private readonly citasService: CitasService) {}

  @Query(() => [Cita], { name: 'obtenerCitasPorUsuario' })
  async obtenerCitasPorUsuario(
    @Args('usuario_id', { type: () => ID }) usuario_id: string,
  ): Promise<Cita[]> {
    return this.citasService.findAllByUserId(usuario_id);
  }

  @Mutation(() => Cita, { name: 'crearCita' })
  async crearCita(
    @Args('createCitaInput') createCitaInput: CreateCitaInput,
  ): Promise<Cita> {
    return this.citasService.create(createCitaInput);
  }
}