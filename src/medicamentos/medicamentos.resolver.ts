// Ruta: src/medicamentos/medicamentos.resolver.ts
import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { Medicamento } from './entities/medicamento.entity';
import { CreateMedicamentoInput } from './dto/create-medicamento.input';

@Resolver(() => Medicamento)
export class MedicamentosResolver {
  
  // Query para listar los medicamentos de un usuario específico
  @Query(() => [Medicamento], { name: 'obtenerMedicamentosPorUsuario' })
  obtenerMedicamentosPorUsuario(
    @Args('usuario_id', { type: () => ID }) usuario_id: string,
  ): Medicamento[] {
    // TODO: Conectar con MedicamentosService.findAllByUserId(usuario_id)
    return [];
  }

  // Mutation para registrar un nuevo esquema médico
  @Mutation(() => Medicamento, { name: 'crearMedicamento' })
  crearMedicamento(
    @Args('createMedicamentoInput') createMedicamentoInput: CreateMedicamentoInput,
  ): Medicamento {
    // TODO: Conectar con MedicamentosService.create(createMedicamentoInput)
    // Retorno mock para que el frontend compile
    return {
      _id: 'mock_id_123',
      ...createMedicamentoInput,
      fecha_eliminacion: null,
    } as any;
  }
}