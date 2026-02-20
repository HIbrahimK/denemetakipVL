import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    const datasourceUrl = PrismaService.withPoolDefaults(process.env.DATABASE_URL);
    super(
      datasourceUrl
        ? {
            datasources: {
              db: {
                url: datasourceUrl,
              },
            },
          }
        : undefined,
    );
  }

  private static withPoolDefaults(databaseUrl?: string) {
    if (!databaseUrl) {
      return undefined;
    }

    try {
      const parsed = new URL(databaseUrl);
      if (!parsed.searchParams.has('connection_limit')) {
        parsed.searchParams.set(
          'connection_limit',
          process.env.PRISMA_CONNECTION_LIMIT || '5',
        );
      }

      if (!parsed.searchParams.has('pool_timeout')) {
        parsed.searchParams.set(
          'pool_timeout',
          process.env.PRISMA_POOL_TIMEOUT || '20',
        );
      }

      return parsed.toString();
    } catch {
      return databaseUrl;
    }
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
