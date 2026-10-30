// [BACKEND] Ruta: src/analitica/entities/analitica.entity.ts

import { ObjectType, Field, Float, Int } from '@nestjs/graphql';

@ObjectType()
export class AdherenciaManhattan {
  @Field()
  fecha: string;

  @Field(() => Float)
  retraso_minutos: number;
}

@ObjectType()
export class IntencionEuclidiana {
  @Field()
  intencion: string;

  @Field(() => Int)
  cantidad: number;

  @Field(() => Float)
  distancia_promedio: number;
}

@ObjectType()
export class AnaliticaDashboard {
  @Field(() => [AdherenciaManhattan])
  adherencia: AdherenciaManhattan[];

  @Field(() => [IntencionEuclidiana])
  intenciones: IntencionEuclidiana[];
}