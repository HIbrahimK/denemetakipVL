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
      // Test database connection with timeout
      const dbPromise = this.prisma.$queryRaw`SELECT 1`;
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Database timeout')), 3000)
      );
      
      await Promise.race([dbPromise, timeoutPromise]);
      
      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        database: 'connected',
        uptime: process.uptime()
      };
    } catch (error) {
      console.error('Health check failed:', error.message);
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        database: 'disconnected',
        error: error.message,
        uptime: process.uptime()
      };
    }
  }

  @Get('ready')
  async getReady() {
    try {
      // More comprehensive readiness check with timeout
      const dbPromise = this.prisma.$queryRaw`SELECT 1`;
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Database timeout')), 5000)
      );
      
      await Promise.race([dbPromise, timeoutPromise]);
      
      return {
        status: 'ready',
        timestamp: new Date().toISOString(),
        checks: {
          database: 'ok'
        }
      };
    } catch (error) {
      console.error('Readiness check failed:', error.message);
      throw new Error(`Service not ready: ${error.message}`);
    }
  }

  @Get('alive')
  getLiveness() {
    // Simple liveness check without external dependencies
    return {
      status: 'alive',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage()
    };
  }
}