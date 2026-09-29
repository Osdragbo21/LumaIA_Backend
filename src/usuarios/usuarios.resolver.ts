// Ruta: src/usuarios/usuarios.resolver.ts
import { Resolver, Query } from '@nestjs/graphql';
import { Usuario } from './entities/usuario.entity';

@Resolver(() => Usuario)
export class UsuariosResolver {
  @Query(() => [Usuario], { name: 'usuariosBase' })
  obtenerUsuarios(): Usuario[] {
    // Retorno temporal vacío para forzar la compilación del esquema de GraphQL
    return [];
  }
}