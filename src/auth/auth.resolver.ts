// Ruta: src/auth/auth.resolver.ts
import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { LoginResponse } from './dto/login-response.dto';
import { Enum_Rol } from '../usuarios/entities/usuario.entity';

@Resolver()
export class AuthResolver {
  
  @Mutation(() => LoginResponse, { name: 'login' })
  async loginUsuario(
    @Args('correo') correo: string,
    @Args('password') password_hash: string,
  ): Promise<LoginResponse> {
    
    // TODO: Conectar con AuthService para validación real con bcrypt
    // Retorno simulado para desbloquear al frontend hoy
    return {
      access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      usuario_id: '64f1a2b3c4d5e6f7a8b9c0d1',
      rol: Enum_Rol.CUIDADOR, 
    };
  }
}