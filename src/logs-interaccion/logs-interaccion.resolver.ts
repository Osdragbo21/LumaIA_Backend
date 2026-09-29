// Ruta: src/logs-interaccion/logs-interaccion.resolver.ts
import { Resolver, Query } from '@nestjs/graphql';
import { LogInteraccion } from './entities/log-interaccion.entity';

@Resolver(() => LogInteraccion)
export class LogsInteraccionResolver {
  @Query(() => [LogInteraccion], { name: 'logsInteraccionBase' })
  obtenerLogsInteraccion(): LogInteraccion[] {
    return [];
  }
}