// [BACKEND] Ruta: src/logs-interaccion/entities/log-interaccion.entity.ts

import { ObjectType, Field, ID, Float } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@ObjectType()
@Schema({ collection: 'logs_interaccion', timestamps: false })
export class LogInteraccion extends Document {
  @Field(() => ID)
  _id: Types.ObjectId;

  @Field(() => ID)
  @Prop({ type: Types.ObjectId, ref: 'Usuario', required: true })
  usuario_id: Types.ObjectId;

  @Field()
  @Prop({ required: true })
  premisa_entrada: string;

  @Field()
  @Prop({ required: true })
  respuesta_generada: string;

  // NUEVO: Guardamos la intención detectada por la IA
  @Field()
  @Prop({ required: true, default: 'CONSULTA_GENERAL' })
  intencion: string;

  // NUEVO: Distancia Euclidiana (Qué tan seguro estaba el modelo de esta intención)
  @Field(() => Float)
  @Prop({ required: true, default: 0.0 })
  distancia: number;

  @Field()
  @Prop({ required: true, default: false })
  bloqueo_medico: boolean;

  @Field(() => Date)
  @Prop({ required: true, default: Date.now })
  fecha_interaccion: Date;
}

export const LogInteraccionSchema = SchemaFactory.createForClass(LogInteraccion);