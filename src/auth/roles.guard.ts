// [BACKEND] Ruta: src/auth/roles.guard.ts

import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { GraphQLError } from 'graphql';
import { Enum_Rol } from '../usuarios/entities/usuario.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const ctx = GqlExecutionContext.create(context);
    const req = ctx.getContext().req;
    
    // Verificamos que el usuario inyectado por el GqlAuthGuard sea un CUIDADOR
    if (req.user?.rol !== Enum_Rol.CUIDADOR) {
      throw new GraphQLError('Acceso denegado: Solo el cuidador puede ver las estadísticas y gráficas.', { 
        extensions: { code: 'FORBIDDEN' } 
      });
    }
    
    return true;
  }
}