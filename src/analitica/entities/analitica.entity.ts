// [BACKEND] Ruta: src/analitica/entities/analitica.entity.ts

import { ObjectType, Field, Float, Int } from '@nestjs/graphql';

@ObjectType()
export class AdherenciaManhattan {
  @Field() fecha: string;
  @Field(() => Float) retraso_minutos: number;
}

@ObjectType()
export class IntencionEuclidiana {
  @Field() intencion: string;
  @Field(() => Int) cantidad: number;
  @Field(() => Float) distancia_promedio: number;
}

@ObjectType()
export class SeguridadDFS {
  @Field(() => Int) permitidas: number;
  @Field(() => Int) bloqueadas: number;
}

// NUEVO: Entidad para UCS (Costo Uniforme)
@ObjectType()
export class ContactoUCS {
  @Field() nombre: string;
  @Field(() => Int) costo_minutos: number;
  @Field(() => Int) costo_acumulado: number;
}

// NUEVO: Entidad para Hill Climbing
@ObjectType()
export class IteracionHillClimbing {
  @Field(() => Int) iteracion: number;
  @Field(() => Int) retraso_actual: number;
  @Field() ajuste: string;
}

@ObjectType()
export class AnaliticaDashboard {
  @Field(() => [AdherenciaManhattan]) adherencia: AdherenciaManhattan[];
  @Field(() => [IntencionEuclidiana]) intenciones: IntencionEuclidiana[];
  @Field(() => SeguridadDFS) seguridad_dfs: SeguridadDFS;
  @Field(() => [String]) ruta_bfs_optima: string[];
  
  // NUEVOS CAMPOS
  @Field(() => [ContactoUCS]) escalamiento_ucs: ContactoUCS[];
  @Field(() => [IteracionHillClimbing]) optimizacion_hill_climbing: IteracionHillClimbing[];
}