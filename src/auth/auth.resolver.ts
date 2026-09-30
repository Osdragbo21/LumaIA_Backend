// Ruta: src/auth/auth.resolver.ts
import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { LoginResponse } from './dto/login-response.dto';
import { AuthService } from './auth.service';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => LoginResponse, { name: 'login' })
  async loginUsuario(
    @Args('correo') correo: string,
    @Args('password') password_plana: string,
  ): Promise<LoginResponse> {
    // Petición delegada al motor de autenticación real
    return this.authService.validarUsuario(correo, password_plana);
  }
}