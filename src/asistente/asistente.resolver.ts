// Ruta: src/asistente/asistente.resolver.ts
import { Resolver, Mutation, Args, ID } from '@nestjs/graphql';
import { AsistenteService } from './asistente.service';

@Resolver()
export class AsistenteResolver {
  constructor(private readonly asistenteService: AsistenteService) {}

  @Mutation(() => String, { name: 'consultarAsistente' })
  async consultarAsistente(
    @Args('usuario_id', { type: () => ID }) usuario_id: string,
    @Args('pregunta_id') pregunta_id: string,
  ): Promise<string> {
    return this.asistenteService.procesarPregunta(usuario_id, pregunta_id);
  }
}