import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
    imports: [
        BullModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => {
                const redisConfig: any = {
                    host: configService.get('REDIS_HOST', 'localhost'),
                    port: parseInt(configService.get('REDIS_PORT', '6379'), 10),
                    maxRetriesPerRequest: 3,
                    retryDelayOnFailover: 100,
                    enableReadyCheck: false,
                    lazyConnect: true,
                };
                
                // Add authentication for production Redis
                const redisUsername = configService.get('REDIS_USERNAME');
                const redisPassword = configService.get('REDIS_PASSWORD');
                
                if (redisUsername && redisPassword) {
                    redisConfig.username = redisUsername;
                    redisConfig.password = redisPassword;
                }
                
                // Enable TLS for managed Redis services
                if (configService.get('NODE_ENV') === 'production') {
                    redisConfig.tls = {};
                }
                
                console.log('Redis config:', { 
                    host: redisConfig.host, 
                    port: redisConfig.port, 
                    hasAuth: !!(redisUsername && redisPassword),
                    hasTLS: !!redisConfig.tls 
                });
                
                return { connection: redisConfig };
            },
            inject: [ConfigService],
        }),
    ],
})
export class QueueModule { }
