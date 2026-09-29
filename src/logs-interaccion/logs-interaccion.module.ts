// Ruta: src/logs-interaccion/logs-interaccion.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LogsInteraccionService } from './logs-interaccion.service';
import { LogsInteraccionResolver } from './logs-interaccion.resolver';
import { LogInteraccion, LogInteraccionSchema } from './entities/log-interaccion.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: LogInteraccion.name, schema: LogInteraccionSchema }]),
  ],
  providers: [LogsInteraccionResolver, LogsInteraccionService],
  exports: [LogsInteraccionService],
})
export class LogsInteraccionModule {}