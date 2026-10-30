// [BACKEND] Ruta: src/auth/gql-auth.guard.ts

import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GqlAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Token de sesión no proporcionado.');
    }

    const token = authHeader.split(' ')[1]; // Extrae el token de "Bearer <token>"
    
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });
      // Inyectamos los datos del usuario en la request para que los resolvers los usen
      request.user = payload;
    } catch {
      throw new UnauthorizedException('Token inválido o expirado. Por favor, inicia sesión nuevamente.');
    }
    
    return true;
  }
}