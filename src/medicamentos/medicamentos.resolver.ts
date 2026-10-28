// [BACKEND] Ruta: src/medicamentos/medicamentos.resolver.ts

import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { Medicamento } from './entities/medicamento.entity';
import { CreateMedicamentoInput, UpdateMedicamentoInput } from './dto/create-medicamento.input';
import { MedicamentosService } from './medicamentos.service';

@Resolver(() => Medicamento)
export class MedicamentosResolver {
  constructor(private readonly medicamentosService: MedicamentosService) {}

  @Query(() => [Medicamento], { name: 'obtenerMedicamentosPorUsuario' })
  async obtenerMedicamentosPorUsuario(@Args('usuario_id', { type: () => ID }) usuario_id: string): Promise<Medicamento[]> {
    return this.medicamentosService.findAllByUserId(usuario_id);
  }

  @Query(() => [Medicamento], { name: 'obtenerMedicamentosPapelera' })
  async obtenerMedicamentosPapelera(@Args('usuario_id', { type: () => ID }) usuario_id: string): Promise<Medicamento[]> {
    return this.medicamentosService.findDeletedByUserId(usuario_id);
  }

  @Mutation(() => Medicamento, { name: 'crearMedicamento' })
  async crearMedicamento(@Args('createMedicamentoInput') createMedicamentoInput: CreateMedicamentoInput): Promise<Medicamento> {
    return this.medicamentosService.create(createMedicamentoInput);
  }

  @Mutation(() => Medicamento, { name: 'actualizarMedicamento' })
  async actualizarMedicamento(@Args('updateMedicamentoInput') updateMedicamentoInput: UpdateMedicamentoInput): Promise<Medicamento> {
    return this.medicamentosService.update(updateMedicamentoInput);
  }

  @Mutation(() => Medicamento, { name: 'eliminarMedicamento' })
  async eliminarMedicamento(@Args('id', { type: () => ID }) id: string): Promise<Medicamento> {
    return this.medicamentosService.softDelete(id);
  }

  @Mutation(() => Medicamento, { name: 'restaurarMedicamento' })
  async restaurarMedicamento(@Args('id', { type: () => ID }) id: string): Promise<Medicamento> {
    return this.medicamentosService.restore(id);
  }
}