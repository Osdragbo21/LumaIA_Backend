// Ruta: src/citas/dto/create-cita.input.ts
import { InputType, Field, ID } from '@nestjs/graphql';
import { EnumEstadoCita } from '../entities/cita.entity';

@InputType()
export class CreateCitaInput {
  @Field(() => ID)
  usuario_id: string;

  @Field()
  titulo_evento: string;

  @Field()
  fecha_hora: Date;

  @Field({ nullable: true })
  ubicacion?: string;

  @Field(() => EnumEstadoCita, { nullable: true })
  estado?: EnumEstadoCita;
}