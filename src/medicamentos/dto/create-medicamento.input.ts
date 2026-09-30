// Ruta: src/medicamentos/dto/create-medicamento.input.ts
import { InputType, Field, Int, ID } from '@nestjs/graphql';

@InputType()
export class CreateMedicamentoInput {
    @Field(() => ID)
    usuario_id: string;

    @Field()
    nombre_farmaco: string;

    @Field()
    dosis: string;

    @Field(() => Int, { nullable: true })
    frecuencia_horas?: number;

    @Field(() => [String], { defaultValue: [] })
    horarios_especificos: string[];
}