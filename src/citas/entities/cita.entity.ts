// Ruta: src/citas/entities/cita.entity.ts
import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

// Definición de estados del ciclo de vida de la cita
export enum EnumEstadoCita {
  PROGRAMADA = 'Programada',
  COMPLETADA = 'Completada',
  CANCELADA = 'Cancelada',
}

registerEnumType(EnumEstadoCita, { name: 'EnumEstadoCita' });

@ObjectType()
@Schema({ timestamps: true })
export class Cita extends Document {
  @Field(() => ID)
  _id: Types.ObjectId;

  @Field(() => ID)
  @Prop({ type: Types.ObjectId, ref: 'Usuario', required: true })
  usuario_id: Types.ObjectId;

  @Field()
  @Prop({ required: true })
  titulo_evento: string;

  @Field()
  @Prop({ required: true })
  fecha_hora: Date;

  @Field({ nullable: true })
  @Prop()
  ubicacion?: string;

  @Field(() => EnumEstadoCita)
  @Prop({ required: true, enum: EnumEstadoCita, default: EnumEstadoCita.PROGRAMADA })
  estado: EnumEstadoCita;

  // Sello de tiempo para ejecución del índice TTL (retención de 30 días)
  @Field(() => Date, { nullable: true })
  @Prop({ type: Date })
  fecha_eliminacion?: Date;
}

export const CitaSchema = SchemaFactory.createForClass(Cita);

// Índice TTL para destruir el documento 30 días después de ser marcado como eliminado
CitaSchema.index({ fecha_eliminacion: 1 }, { expireAfterSeconds: 2592000 });