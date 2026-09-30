// Ruta: src/usuarios/dto/create-usuario.input.ts
import { InputType, Field } from '@nestjs/graphql';
import { Enum_Rol } from '../../usuarios/entities/usuario.entity';

@InputType()
export class CreateUsuarioInput {
  @Field()
  nombre: string;

  @Field()
  correo: string;

  @Field()
  password: string;

  @Field(() => Enum_Rol)
  rol: Enum_Rol;
}