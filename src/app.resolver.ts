// Ruta: src/app.resolver.ts
import { Query, Resolver } from '@nestjs/graphql';

@Resolver()
export class AppResolver {
  @Query(() => String, { description: 'Estado general del API LumaIA' })
  lumaStatus(): string {
    return 'LumaIA Core API v1.0 running - MongoDB & GraphQL Ready';
  }
}