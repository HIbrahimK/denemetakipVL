import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        // Try REDIS_URL first (DigitalOcean managed Redis)
        const redisUrl = configService.get('REDIS_URL');
        let redisConfig: any;

        if (redisUrl) {
          try {
            const url = new URL(redisUrl);
            redisConfig = {
              host: url.hostname,
              port: parseInt(url.port) || 6379,
              maxRetriesPerRequest: null, // BullMQ requirement
              enableReadyCheck: false,
              lazyConnect: false,
            };

            if (url.username) redisConfig.username = url.username;
            if (url.password) redisConfig.password = url.password;

            // Enable TLS for rediss:// protocol
            if (url.protocol === 'rediss:') {
              redisConfig.tls = {};
            }

            console.log('Redis config from REDIS_URL:', {
              host: redisConfig.host,
              port: redisConfig.port,
              protocol: url.protocol,
              hasAuth: !!(redisConfig.username && redisConfig.password),
              hasTLS: !!redisConfig.tls,
            });
          } catch (e) {
            console.error('Failed to parse REDIS_URL:', e.message);
            throw e;
          }
        } else {
          // Fallback to individual environment variables
          redisConfig = {
            host: configService.get('REDIS_HOST', 'localhost'),
            port: parseInt(configService.get('REDIS_PORT', '6379'), 10),
            maxRetriesPerRequest: null, // BullMQ requirement
            enableReadyCheck: false,
            lazyConnect: false,
          };

          const redisUsername = configService.get('REDIS_USERNAME');
          const redisPassword = configService.get('REDIS_PASSWORD');

          if (redisUsername && redisPassword) {
            redisConfig.username = redisUsername;
            redisConfig.password = redisPassword;
          }

          // Enable TLS for managed Redis services in production
          if (configService.get('NODE_ENV') === 'production') {
            redisConfig.tls = {};
          }

          console.log('Redis config from env vars:', {
            host: redisConfig.host,
            port: redisConfig.port,
            hasAuth: !!(redisUsername && redisPassword),
            hasTLS: !!redisConfig.tls,
          });
        }

        return { connection: redisConfig };
      },
      inject: [ConfigService],
    }),
  ],
})
export class QueueModule {}
