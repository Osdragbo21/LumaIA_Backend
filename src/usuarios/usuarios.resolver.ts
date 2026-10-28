// [BACKEND] Ruta: src/usuarios/usuarios.resolver.ts

import { Resolver, Query, Mutation, Args, ID, ObjectType, Field } from '@nestjs/graphql';
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

  // --- RESTAURADO: Obtener el perfil del usuario ---
  @Query(() => Usuario, { name: 'obtenerUsuario' })
  async obtenerUsuario(
    @Args('usuario_id', { type: () => ID }) usuario_id: string,
  ): Promise<Usuario> {
    return this.usuariosService.obtenerUsuario(usuario_id);
  }

  // --- RESTAURADO: Agregar contacto de emergencia ---
  @Mutation(() => Usuario, { name: 'agregarContactoEmergencia' })
  async agregarContactoEmergencia(
    @Args('input') input: AgregarContactoInput,
  ): Promise<Usuario> {
    return this.usuariosService.agregarContactoEmergencia(input);
  }

  @Mutation(() => Usuario, { name: 'registrarUsuario' })
  async registrarUsuario(
    @Args('input') input: CreateUsuarioInput,
  ): Promise<Usuario> {
    return this.usuariosService.registrarUsuario(input);
  }

  @Mutation(() => Usuario, { name: 'vincularAdultoMayor' })
  async vincularAdultoMayor(
    @Args('cuidador_id', { type: () => ID }) cuidador_id: string,
    @Args('correo_adulto') correo_adulto: string,
  ): Promise<Usuario> {
    return this.usuariosService.vincularAdultoMayor(cuidador_id, correo_adulto);
  }

  @Query(() => [ResumenAdultoVinculado], { name: 'obtenerAdultosVinculados' })
  async obtenerAdultosVinculados(
    @Args('cuidador_id', { type: () => ID }) cuidador_id: string,
  ): Promise<ResumenAdultoVinculado[]> {
    return this.usuariosService.obtenerAdultosVinculados(cuidador_id);
  }
}