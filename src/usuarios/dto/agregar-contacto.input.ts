// Ruta: src/usuarios/dto/agregar-contacto.input.ts
import { InputType, Field, ID } from '@nestjs/graphql';

@InputType()
export class AgregarContactoInput {
  @Field(() => ID)
  usuario_id: string;

  @Field()
  nombre_contacto: string;

  @Field()
  telefono: string;

  @Field()
  parentesco: string;
}