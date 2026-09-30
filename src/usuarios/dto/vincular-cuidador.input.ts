// Ruta: src/usuarios/dto/vincular-cuidador.input.ts
import { InputType, Field, ID } from '@nestjs/graphql';

@InputType()
export class VincularCuidadorInput {
  @Field(() => ID)
  cuidador_id: string;

  @Field()
  pin: string;
}
