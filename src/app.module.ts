// Ruta: src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { join } from 'path';
import { AppResolver } from './app.resolver';
import { UsuariosModule } from './usuarios/usuarios.module';
import { MedicamentosModule } from './medicamentos/medicamentos.module';
import { CitasModule } from './citas/citas.module';
import { NotasPersonalesModule } from './notas-personales/notas-personales.module';
import { RegistrosTomaModule } from './registros-toma/registros-toma.module';
import { LogsInteraccionModule } from './logs-interaccion/logs-interaccion.module';
import { AuthModule } from './auth/auth.module';
import { AsistenteModule } from './asistente/asistente.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI') || 'mongodb://localhost:27017/lumaia',
      }),
      inject: [ConfigService],
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      playground: false,
      plugins: [ApolloServerPluginLandingPageLocalDefault() as any], 
    }),
    UsuariosModule,
    MedicamentosModule,
    CitasModule,
    NotasPersonalesModule,
    RegistrosTomaModule,
    LogsInteraccionModule,
    AuthModule,
    AsistenteModule,
  ],
  providers: [AppResolver],
})
export class AppModule {}