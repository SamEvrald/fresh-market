// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express'; // Import NestExpressApplication
import { join } from 'path'; // Import join
(global as any).crypto = require('crypto');


async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule); // Use NestExpressApplication for static assets
  const configService = app.get(ConfigService);

  // Global Prefix for API
  app.setGlobalPrefix('api/v1');

  // CORS Configuration
  app.enableCors({
    origin: '*', // For development, allow all origins. In production, specify your frontend URL(s).
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Global Validation Pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Serve static files (product images)
  // Ensure 'uploads' directory exists in your project root
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
  prefix: '/uploads/',
});


  const port = configService.get<number>('port');
  await app.listen(port);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();