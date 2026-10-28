// [BACKEND] Ruta: src/asistente/asistente.resolver.ts

import { Resolver, Mutation, Args, ID, ObjectType, Field } from '@nestjs/graphql';
import { AsistenteService } from './asistente.service';

@ObjectType()
export class AsistenteResponse {
  @Field()
  respuesta_texto: string;

  @Field()
  intencion: string;
}

@Resolver()
export class AsistenteResolver {
  constructor(private readonly asistenteService: AsistenteService) {}

  @Mutation(() => AsistenteResponse, { name: 'consultarAsistente' })
  async consultarAsistente(
    @Args('usuario_id', { type: () => ID }) usuario_id: string,
    @Args('pregunta_id') pregunta_id: string,
    @Args('modelo', { type: () => String, nullable: true }) modelo?: string,
  ): Promise<AsistenteResponse> {
    return this.asistenteService.procesarPregunta(usuario_id, pregunta_id, modelo);
  }

  // NUEVA MUTACIÓN PARA EL DICTADO DE VOZ
  @Mutation(() => String, { name: 'transcribirAudio' })
  async transcribirAudio(
    @Args('base64Audio') base64Audio: string,
  ): Promise<string> {
    return this.asistenteService.transcribirAudio(base64Audio);
  }
}