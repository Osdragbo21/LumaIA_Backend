// [BACKEND] Ruta: src/citas/citas.resolver.ts

import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { Cita } from './entities/cita.entity';
import { CreateCitaInput, UpdateCitaInput } from './dto/create-cita.input';
import { CitasService } from './citas.service';

@Resolver(() => Cita)
export class CitasResolver {
  constructor(private readonly citasService: CitasService) {}

  @Query(() => [Cita], { name: 'obtenerCitasPorUsuario' })
  async obtenerCitasPorUsuario(@Args('usuario_id', { type: () => ID }) usuario_id: string): Promise<Cita[]> {
    return this.citasService.findAllByUserId(usuario_id);
  }

  @Query(() => [Cita], { name: 'obtenerCitasPapelera' })
  async obtenerCitasPapelera(@Args('usuario_id', { type: () => ID }) usuario_id: string): Promise<Cita[]> {
    return this.citasService.findDeletedByUserId(usuario_id);
  }

  @Mutation(() => Cita, { name: 'crearCita' })
  async crearCita(@Args('createCitaInput') createCitaInput: CreateCitaInput): Promise<Cita> {
    return this.citasService.create(createCitaInput);
  }

  @Mutation(() => Cita, { name: 'actualizarCita' })
  async actualizarCita(@Args('updateCitaInput') updateCitaInput: UpdateCitaInput): Promise<Cita> {
    return this.citasService.update(updateCitaInput);
  }

  @Mutation(() => Cita, { name: 'eliminarCita' })
  async eliminarCita(@Args('id', { type: () => ID }) id: string): Promise<Cita> {
    return this.citasService.softDelete(id);
  }

  @Mutation(() => Cita, { name: 'restaurarCita' })
  async restaurarCita(@Args('id', { type: () => ID }) id: string): Promise<Cita> {
    return this.citasService.restore(id);
  }
}