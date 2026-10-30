// [BACKEND] Ruta: src/analitica/analitica.resolver.ts

import { Resolver, Query, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/gql-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { AnaliticaDashboard } from './entities/analitica.entity';
import { AnaliticaService } from './analitica.service';
import { CurrentUser } from '../auth/current-user.decorator'; // Lo crearemos en un momento

@Resolver()
export class AnaliticaResolver {
  constructor(private readonly analiticaService: AnaliticaService) {}

  @Query(() => AnaliticaDashboard, { name: 'obtenerMiAnaliticaCuidador' })
  @UseGuards(GqlAuthGuard, RolesGuard) // DOBLE PROTECCIÓN: Debe tener Token Y ser Cuidador
  async obtenerMiAnaliticaCuidador(
    @CurrentUser() user: any, // Extraemos el ID directamente del Token, no de los argumentos
    @Args('dias', { type: () => Int, defaultValue: 7 }) dias: number,
  ): Promise<AnaliticaDashboard> {
    // user.sub contiene el ID del cuidador que viene encriptado en el JWT
    return this.analiticaService.obtenerEstadisticas(user.sub, dias);
  }
}