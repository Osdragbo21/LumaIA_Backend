// Ruta: src/auth/dto/login-response.dto.ts
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { EnumRol } from '../../usuarios/entities/usuario.entity';

@ObjectType()
export class LoginResponse {
  @Field()
  access_token: string;

  @Field(() => ID)
  usuario_id: string;

  @Field(() => EnumRol)
  rol: EnumRol;
}