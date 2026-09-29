// Ruta: src/registros-toma/entities/registro-toma.entity.ts
import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum EnumEstadoToma {
  PENDIENTE = 'Pendiente',
  CONFIRMADA = 'Confirmada',
  OMITIDA = 'Omitida',
}

registerEnumType(EnumEstadoToma, { name: 'EnumEstadoToma' });

@ObjectType()
@Schema({ collection: 'registros_toma', timestamps: true })
export class RegistroToma extends Document {
  @Field(() => ID)
  _id: Types.ObjectId;

  @Field(() => ID)
  @Prop({ type: Types.ObjectId, ref: 'Medicamento', required: true })
  medicamento_id: Types.ObjectId;

  @Field()
  @Prop({ required: true })
  fecha_programada: Date;

  @Field(() => EnumEstadoToma)
  @Prop({ required: true, enum: EnumEstadoToma, default: EnumEstadoToma.PENDIENTE })
  estado_toma: EnumEstadoToma;

  @Field(() => Date, { nullable: true })
  @Prop({ type: Date })
  fecha_confirmacion?: Date;
}

export const RegistroTomaSchema = SchemaFactory.createForClass(RegistroToma);