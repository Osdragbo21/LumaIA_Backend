// Ruta: src/usuarios/entities/usuario.entity.ts
import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

// Definición de Roles del Sistema
export enum EnumRol {
  ADULTO_MAYOR = 'Adulto Mayor',
  CUIDADOR = 'Cuidador',
}

registerEnumType(EnumRol, { name: 'EnumRol' });

// Sub-esquema desnormalizado para acceso rápido
@ObjectType()
export class ContactoEmergencia {
  @Field()
  nombre_contacto: string;

  @Field()
  telefono: string;

  @Field()
  parentesco: string;
}

@ObjectType()
@Schema({ timestamps: true })
export class Usuario extends Document {
  @Field(() => ID)
  _id: Types.ObjectId;

  @Field()
  @Prop({ required: true })
  nombre: string;

  @Field()
  @Prop({ required: true, unique: true })
  correo: string;

  @Field()
  @Prop({ required: true })
  password_hash: string;

  @Field(() => EnumRol)
  @Prop({ required: true, enum: EnumRol })
  rol: EnumRol;

  @Field(() => ID, { nullable: true })
  @Prop({ type: Types.ObjectId, ref: 'Usuario' })
  cuidador_vinculado_id?: Types.ObjectId;

  @Field({ nullable: true })
  @Prop()
  pin_vinculacion?: string;

  @Field()
  @Prop({ default: true })
  estado_activo: boolean;

  @Field(() => [String])
  @Prop({ type: [String], default: [] })
  tokens_dispositivo: string[];

  @Field(() => [ContactoEmergencia])
  @Prop({ type: Array, default: [] })
  contactos_emergencia: ContactoEmergencia[];
}

export const UsuarioSchema = SchemaFactory.createForClass(Usuario);