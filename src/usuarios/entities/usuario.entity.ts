// Ruta: src/usuarios/entities/usuario.entity.ts
import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum Enum_Rol {
  ADULTO_MAYOR = 'Adulto Mayor',
  CUIDADOR = 'Cuidador',
}
registerEnumType(Enum_Rol, { name: 'Enum_Rol' });

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
@Schema({ collection: 'usuarios', timestamps: true })
export class Usuario extends Document {
  @Field(() => ID)
  _id: Types.ObjectId;

  @Field()
  @Prop({ required: true })
  nombre: string;

  @Field()
  @Prop({ required: true, unique: true }) // Restricción de unicidad
  correo: string;

  @Field()
  @Prop({ required: true })
  password_hash: string;

  @Field(() => Enum_Rol)
  @Prop({ required: true, enum: Enum_Rol })
  rol: Enum_Rol;

  @Field(() => ID, { nullable: true })
  @Prop({ type: Types.ObjectId, ref: 'Usuario' })
  cuidador_vinculado_id?: Types.ObjectId;

  @Field({ nullable: true })
  @Prop()
  pin_vinculacion?: string;

  @Field()
  @Prop({ default: true }) // Borrado Lógico
  estado_activo: boolean;

  @Field(() => [String])
  @Prop({ type: [String], default: [] })
  tokens_dispositivo: string[];

  @Field(() => [ContactoEmergencia])
  @Prop({ type: Array, default: [] })
  contactos_emergencia: ContactoEmergencia[];
}

export const UsuarioSchema = SchemaFactory.createForClass(Usuario);