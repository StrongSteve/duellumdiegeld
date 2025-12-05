import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async check() {
    // Verify database connectivity
    let dbStatus = 'ok';
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      dbStatus = 'error';
    }

    // Determine database type from DATABASE_URL
    const databaseUrl = process.env.DATABASE_URL || '';
    let databaseType = 'Lokal';

    if (databaseUrl.includes('supabase.com') || databaseUrl.includes('supabase.co')) {
      databaseType = 'Supabase';
    } else if (databaseUrl.includes('neon.tech')) {
      databaseType = 'Neon';
    } else if (databaseUrl.includes('railway.app')) {
      databaseType = 'Railway';
    } else if (databaseUrl.includes('render.com')) {
      databaseType = 'Render';
    } else if (
      databaseUrl.includes('127.0.0.1') ||
      databaseUrl.includes('localhost') ||
      databaseUrl.includes('@postgres:')
    ) {
      databaseType = 'Lokal';
    } else if (databaseUrl) {
      databaseType = 'Extern';
    }

    return {
      status: dbStatus === 'ok' ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      database: dbStatus,
      databaseType,
    };
  }
}
