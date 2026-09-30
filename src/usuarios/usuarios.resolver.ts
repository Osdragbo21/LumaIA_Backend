// Ruta: src/usuarios/usuarios.resolver.ts
import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { Usuario } from './entities/usuario.entity';
import { UsuariosService } from './usuarios.service';
import { AgregarContactoInput } from './dto/agregar-contacto.input';
import { CreateUsuarioInput } from './dto/create-usuario.input';
import { VincularCuidadorInput } from './dto/vincular-cuidador.input';

@Resolver(() => Usuario)
export class UsuariosResolver {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Query(() => Usuario, { name: 'obtenerUsuario' })
  async obtenerUsuario(
    @Args('usuario_id', { type: () => ID }) usuario_id: string,
  ): Promise<Usuario> {
    return this.usuariosService.findOneById(usuario_id);
  }

  @Mutation(() => Usuario, { name: 'agregarContactoEmergencia' })
  async agregarContactoEmergencia(
    @Args('input') input: AgregarContactoInput,
  ): Promise<Usuario> {
    return this.usuariosService.agregarContacto(input);
  }

  @Mutation(() => Usuario, { name: 'registrarUsuario' })
  async registrarUsuario(
    @Args('input') input: CreateUsuarioInput,
  ): Promise<Usuario> {
    return this.usuariosService.registrarUsuario(input);
  }

  @Mutation(() => String, { name: 'generarPinVinculacion' })
  async generarPinVinculacion(
    @Args('usuario_id', { type: () => ID }) usuario_id: string,
  ): Promise<string> {
    return this.usuariosService.generarPinVinculacion(usuario_id);
  }

  @Mutation(() => Usuario, { name: 'vincularCuidador' })
  async vincularCuidador(
    @Args('input') input: VincularCuidadorInput,
  ): Promise<Usuario> {
    return this.usuariosService.vincularCuidador(input);
  }

}