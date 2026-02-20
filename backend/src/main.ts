import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  console.log('🚀 Starting NestJS application...');
  
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bodyParser: true,
    logger: ['log', 'error', 'warn', 'debug', 'verbose'],
  });

  app.set('trust proxy', 1);

  // Increase payload size limit for logo uploads (10MB)
  app.use(require('express').json({ limit: '10mb' }));
  app.use(require('express').urlencoded({ limit: '10mb', extended: true }));

  // Serve public files from uploads/public directory
  app.useStaticAssets(join(process.cwd(), 'uploads', 'public'), {
    prefix: '/uploads/',
  });

  // Legacy public attachments (backward compatibility)
  app.useStaticAssets(join(process.cwd(), 'uploads', 'message-attachments'), {
    prefix: '/uploads/message-attachments/',
  });

  // Security headers
  app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
  }));

  // Enable CORS for frontend
  const corsOrigins = (process.env.CORS_ORIGINS || 'http://localhost:3000')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || corsOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: true,
  });

  console.log('⚙️ Configuring validation...');

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties that don't have decorators
      transform: true, // Transform payloads to DTO instances
      transformOptions: {
        enableImplicitConversion: true, // Automatically convert types
      },
    }),
  );

  const port = process.env.PORT ?? 8080;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
