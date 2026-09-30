// Ruta: src/notas-personales/dto/create-nota-personal.input.ts
import { InputType, Field, ID } from '@nestjs/graphql';

@InputType()
export class CreateNotaPersonalInput {
  @Field(() => ID)
  usuario_id: string;

  @Field()
  contenido: string;

  @Field()
  fecha_creacion: Date;
}