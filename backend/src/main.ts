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

  console.log('⚙️ Configuring middleware...');

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

  console.log('⚙️ Configuring CORS...');

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

  console.log(`🌐 CORS enabled for origins: ${allowedOrigins.join(', ')}`);

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  console.log('⚙️ Configuring validation...');

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

  console.log(`🔌 Binding to 0.0.0.0:${port}...`);

  // ✅ DigitalOcean health check fix
  await app.listen(port, '0.0.0.0');

  console.log(`✅ Application successfully running on http://0.0.0.0:${port}`);
  console.log(`📊 Health endpoints:`);
  console.log(`   - Liveness: http://0.0.0.0:${port}/alive`);
  console.log(`   - Health: http://0.0.0.0:${port}/health`);
  console.log(`   - Ready: http://0.0.0.0:${port}/ready`);
  console.log('✅ Application startup complete!');
}

bootstrap();
