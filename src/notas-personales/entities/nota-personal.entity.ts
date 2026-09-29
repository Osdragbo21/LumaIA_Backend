// Ruta: src/notas-personales/entities/nota-personal.entity.ts
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@ObjectType()
@Schema({ timestamps: { createdAt: 'fecha_creacion', updatedAt: true } })
export class NotaPersonal extends Document {
  @Field(() => ID)
  _id: Types.ObjectId;

  @Field(() => ID)
  @Prop({ type: Types.ObjectId, ref: 'Usuario', required: true })
  usuario_id: Types.ObjectId;

  @Field()
  @Prop({ required: true })
  contenido: string;

  @Field(() => Date)
  fecha_creacion: Date;

  // Sello de tiempo para ejecución del índice TTL (retención de 30 días)
  @Field(() => Date, { nullable: true })
  @Prop({ type: Date })
  fecha_eliminacion?: Date;
}

export const NotaPersonalSchema = SchemaFactory.createForClass(NotaPersonal);

// Índice TTL para destruir el documento 30 días después de ser marcado para eliminación
NotaPersonalSchema.index({ fecha_eliminacion: 1 }, { expireAfterSeconds: 2592000 });