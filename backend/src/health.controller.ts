import { Controller, Get } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Controller()
export class HealthController {
  constructor(private prisma: PrismaService) {}

  @Get()
  getRoot() {
    return { 
      message: 'DeneTakip API is running',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    };
  }

  @Get('health')
  async getHealth() {
    try {
      // Test database connection
      await this.prisma.$queryRaw`SELECT 1`;
      
      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        database: 'connected',
        uptime: process.uptime()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        database: 'disconnected',
        error: error.message
      };
    }
  }

  @Get('ready')
  async getReady() {
    try {
      // More comprehensive readiness check
      await this.prisma.$queryRaw`SELECT 1`;
      
      return {
        status: 'ready',
        timestamp: new Date().toISOString(),
        checks: {
          database: 'ok'
        }
      };
    } catch (error) {
      throw new Error(`Service not ready: ${error.message}`);
    }
  }
}