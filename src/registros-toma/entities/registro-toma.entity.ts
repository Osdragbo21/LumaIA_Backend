// Ruta: src/registros-toma/entities/registro-toma.entity.ts
import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum Enum_EstadoToma {
  PENDIENTE = 'Pendiente',
  CONFIRMADA = 'Confirmada',
  OMITIDA = 'Omitida',
}
registerEnumType(Enum_EstadoToma, { name: 'Enum_EstadoToma' });

@ObjectType()
@Schema({ collection: 'registros_toma', timestamps: true })
export class RegistroToma extends Document {
  @Field(() => ID)
  _id: Types.ObjectId;

  @Field(() => ID)
  @Prop({ type: Types.ObjectId, ref: 'Medicamento', required: true })
  medicamento_id: Types.ObjectId;

  @Field(() => Date)
  @Prop({ required: true, type: Date })
  fecha_programada: Date;

  @Field(() => Enum_EstadoToma)
  @Prop({ required: true, enum: Enum_EstadoToma, default: Enum_EstadoToma.PENDIENTE })
  estado_toma: Enum_EstadoToma;

  @Field(() => Date, { nullable: true })
  @Prop({ type: Date })
  fecha_confirmacion?: Date;
}

export const RegistroTomaSchema = SchemaFactory.createForClass(RegistroToma);