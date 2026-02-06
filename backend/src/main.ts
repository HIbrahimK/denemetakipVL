import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bodyParser: true,
  });

  // Increase payload size limit for uploads (10MB)
  app.use(require('express').json({ limit: '10mb' }));
  app.use(require('express').urlencoded({ limit: '10mb', extended: true }));

  // Serve static files
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  });

  // Security headers
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

  /**
   * ✅ TypeScript-safe CORS origins
   * (explicit string[] — no undefined)
   */
  const allowedOrigins: string[] = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://192.168.1.14:3000',
  ];

  if (process.env.FRONTEND_URL) {
    allowedOrigins.push(process.env.FRONTEND_URL);
  }

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const port = Number(process.env.PORT) || 8080;

  // ✅ DigitalOcean health check fix
  await app.listen(port, '0.0.0.0');

  console.log(`🚀 Application running on http://0.0.0.0:${port}`);
}

bootstrap();
