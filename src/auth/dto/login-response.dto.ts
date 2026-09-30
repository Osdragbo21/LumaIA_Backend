// Ruta: src/auth/dto/login-response.dto.ts
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Enum_Rol } from '../../usuarios/entities/usuario.entity';

@ObjectType()
export class LoginResponse {
  @Field()
  access_token: string;

  @Field(() => ID)
  usuario_id: string;

  @Field(() => Enum_Rol)
  rol: Enum_Rol;
}