// Ruta: src/usuarios/usuarios.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsuariosService } from './usuarios.service';
import { UsuariosResolver } from './usuarios.resolver';
import { Usuario, UsuarioSchema } from './entities/usuario.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Usuario.name, schema: UsuarioSchema }]),
  ],
  providers: [UsuariosResolver, UsuariosService],
  exports: [UsuariosService], // Exportado para uso futuro en Auth o Motor IA
})
export class UsuariosModule {}