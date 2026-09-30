// Ruta: src/usuarios/dto/create-usuario.input.ts
import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, MinLength } from 'class-validator';
import { Enum_Rol } from '../entities/usuario.entity';

@InputType()
export class CreateUsuarioInput {
  @Field()
  nombre: string;

  @Field()
  @IsEmail({}, { message: 'El formato del correo electrónico es inválido' })
  correo: string;

  @Field()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;

  @Field(() => Enum_Rol)
  rol: Enum_Rol;
}