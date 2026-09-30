// Ruta: src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Habilitar CORS para que el frontend React se conecte sin problemas
  app.enableCors();
  
  // CRÍTICO: Activar validación global basada en DTOs
  app.useGlobalPipes(new ValidationPipe());
  
  await app.listen(3000);
}
bootstrap();