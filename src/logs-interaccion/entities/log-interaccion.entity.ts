// Ruta: src/logs-interaccion/entities/log-interaccion.entity.ts
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@ObjectType()
@Schema({ timestamps: false }) // Desactivamos timestamps automáticos para usar la fecha_interaccion exacta
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

  @Field()
  @Prop({ required: true, default: false })
  bloqueo_medico: boolean;

  @Field(() => Date)
  @Prop({ required: true, default: Date.now })
  fecha_interaccion: Date;
}

export const LogInteraccionSchema = SchemaFactory.createForClass(LogInteraccion);