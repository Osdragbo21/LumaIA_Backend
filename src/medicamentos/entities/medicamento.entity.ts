// Ruta: src/medicamentos/entities/medicamento.entity.ts
import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@ObjectType()
@Schema({ collection: 'medicamentos', timestamps: true })
export class Medicamento extends Document {
  @Field(() => ID)
  _id: Types.ObjectId;

  @Field(() => ID)
  @Prop({ type: Types.ObjectId, ref: 'Usuario', required: true })
  usuario_id: Types.ObjectId;

  @Field()
  @Prop({ required: true })
  nombre_farmaco: string;

  @Field()
  @Prop({ required: true })
  dosis: string;

  @Field(() => Int, { nullable: true })
  @Prop({ type: Number })
  frecuencia_horas?: number;

  @Field(() => [String])
  @Prop({ type: [String], default: [] })
  horarios_especificos: string[];

  @Field(() => Date, { nullable: true })
  @Prop({ type: Date })
  fecha_eliminacion?: Date; // Índice TTL
}

export const MedicamentoSchema = SchemaFactory.createForClass(Medicamento);
MedicamentoSchema.index({ fecha_eliminacion: 1 }, { expireAfterSeconds: 2592000 });