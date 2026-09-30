// Ruta: src/medicamentos/medicamentos.resolver.ts
import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { Medicamento } from './entities/medicamento.entity';
import { CreateMedicamentoInput } from './dto/create-medicamento.input';
import { MedicamentosService } from './medicamentos.service';

@Resolver(() => Medicamento)
export class MedicamentosResolver {
  constructor(private readonly medicamentosService: MedicamentosService) {}

  @Query(() => [Medicamento], { name: 'obtenerMedicamentosPorUsuario' })
  async obtenerMedicamentosPorUsuario(
    @Args('usuario_id', { type: () => ID }) usuario_id: string,
  ): Promise<Medicamento[]> {
    // Retorna la lista real desde MongoDB Atlas
    return this.medicamentosService.findAllByUserId(usuario_id);
  }

  @Mutation(() => Medicamento, { name: 'crearMedicamento' })
  async crearMedicamento(
    @Args('createMedicamentoInput') createMedicamentoInput: CreateMedicamentoInput,
  ): Promise<Medicamento> {
    return this.medicamentosService.create(createMedicamentoInput);
  }
}