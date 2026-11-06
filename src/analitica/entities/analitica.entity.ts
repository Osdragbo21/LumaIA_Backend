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

@ObjectType()
export class ContactoUCS {
  @Field() nombre: string;
  @Field(() => Int) costo_minutos: number;
  @Field(() => Int) costo_acumulado: number;
}

@ObjectType()
export class IteracionHillClimbing {
  @Field(() => Int) iteracion: number;
  @Field(() => Int) retraso_actual: number;
  @Field() ajuste: string;
}

// ==========================================
// NUEVO: Entidad para Machine Learning
// ==========================================
@ObjectType()
export class PrediccionRiesgo {
  @Field() riesgo_regla_fija: boolean;
  @Field() riesgo_machine_learning: boolean;
  @Field(() => Float) exactitud_modelo_ml: number;
}

@ObjectType()
export class AnaliticaDashboard {
  @Field(() => [AdherenciaManhattan]) adherencia: AdherenciaManhattan[];
  @Field(() => [IntencionEuclidiana]) intenciones: IntencionEuclidiana[];
  @Field(() => SeguridadDFS) seguridad_dfs: SeguridadDFS;
  @Field(() => [String]) ruta_bfs_optima: string[];
  @Field(() => [ContactoUCS]) escalamiento_ucs: ContactoUCS[];
  @Field(() => [IteracionHillClimbing]) optimizacion_hill_climbing: IteracionHillClimbing[];
  
  // NUEVO: Campo para la predicción del modelo
  @Field(() => PrediccionRiesgo) prediccion_riesgo: PrediccionRiesgo;
}