// [BACKEND] Ruta: src/usuarios/usuarios.resolver.ts

import { Resolver, Query, Mutation, Args, ID, ObjectType, Field } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/gql-auth.guard'; // NUEVO: Importamos el guardián
import { Usuario } from './entities/usuario.entity';
import { CreateUsuarioInput } from './dto/create-usuario.input';
import { AgregarContactoInput } from './dto/agregar-contacto.input';
import { UsuariosService } from './usuarios.service';
import { Medicamento } from '../medicamentos/entities/medicamento.entity';
import { Cita } from '../citas/entities/cita.entity';
import { RegistroToma } from '../registros-toma/entities/registro-toma.entity';

@ObjectType()
export class ResumenAdultoVinculado {
  @Field(() => Usuario) adulto: Usuario;
  @Field(() => [Medicamento]) medicamentos: Medicamento[];
  @Field(() => [Cita]) citas_hoy: Cita[];
  @Field(() => [RegistroToma]) tomas_hoy: RegistroToma[];
}

@Resolver(() => Usuario)
export class UsuariosResolver {
  constructor(private readonly usuariosService: UsuariosService) {}

  // El registro NO lleva Guard porque el usuario aún no tiene token
  @Mutation(() => Usuario, { name: 'registrarUsuario' })
  async registrarUsuario(@Args('input') input: CreateUsuarioInput): Promise<Usuario> {
    return this.usuariosService.registrarUsuario(input);
  }

  @Query(() => Usuario, { name: 'obtenerUsuario' })
  @UseGuards(GqlAuthGuard) // Protegido
  async obtenerUsuario(@Args('usuario_id', { type: () => ID }) usuario_id: string): Promise<Usuario> {
    return this.usuariosService.obtenerUsuario(usuario_id);
  }

  @Mutation(() => Usuario, { name: 'agregarContactoEmergencia' })
  @UseGuards(GqlAuthGuard) // Protegido
  async agregarContactoEmergencia(@Args('input') input: AgregarContactoInput): Promise<Usuario> {
    return this.usuariosService.agregarContactoEmergencia(input);
  }

  // NUEVA MUTACIÓN: Generar PIN
  @Mutation(() => String, { name: 'generarPinVinculacion' })
  @UseGuards(GqlAuthGuard) // Protegido
  async generarPinVinculacion(@Args('usuario_id', { type: () => ID }) usuario_id: string): Promise<string> {
    return this.usuariosService.generarPinVinculacion(usuario_id);
  }

  @Mutation(() => Usuario, { name: 'vincularAdultoMayor' })
  @UseGuards(GqlAuthGuard) // Protegido
  async vincularAdultoMayor(
    @Args('cuidador_id', { type: () => ID }) cuidador_id: string,
    @Args('pin') pin: string, // Cambiado de correo a PIN
  ): Promise<Usuario> {
    return this.usuariosService.vincularAdultoMayor(cuidador_id, pin);
  }

  @Query(() => [ResumenAdultoVinculado], { name: 'obtenerAdultosVinculados' })
  @UseGuards(GqlAuthGuard) // Protegido
  async obtenerAdultosVinculados(@Args('cuidador_id', { type: () => ID }) cuidador_id: string): Promise<ResumenAdultoVinculado[]> {
    return this.usuariosService.obtenerAdultosVinculados(cuidador_id);
  }
}