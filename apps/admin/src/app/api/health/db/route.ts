import { NextResponse } from 'next/server';
import { prisma } from '@/lib/server/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const envStatus = {
    hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
    hasPostgresUrl: Boolean(process.env.POSTGRES_URL),
    hasPrismaDatabaseUrl: Boolean(process.env.PRISMA_DATABASE_URL),
    hasPostgresPrismaUrl: Boolean(process.env.POSTGRES_PRISMA_URL),
    nodeEnv: process.env.NODE_ENV,
    activeUrlType: process.env.DATABASE_URL
      ? 'DATABASE_URL'
      : process.env.POSTGRES_URL
      ? 'POSTGRES_URL'
      : process.env.PRISMA_DATABASE_URL
      ? 'PRISMA_DATABASE_URL'
      : process.env.POSTGRES_PRISMA_URL
      ? 'POSTGRES_PRISMA_URL'
      : 'NONE_CONFIGURED',
  };

  try {
    const startTime = Date.now();
    // Test raw query
    const result: any = await prisma.$queryRaw`SELECT 1 as connected, NOW() as current_time`;
    const durationMs = Date.now() - startTime;

    // Test counting records
    let vendorCount = 0;
    try {
      vendorCount = await prisma.vendor.count();
    } catch {
      // ignore table count error if table doesn't exist yet
    }

    return NextResponse.json({
      success: true,
      connected: true,
      database: 'PostgreSQL',
      latency: `${durationMs}ms`,
      env: envStatus,
      rawQueryResult: result,
      vendorCount,
      message: 'Prisma is successfully connected to PostgreSQL database!',
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        connected: false,
        env: envStatus,
        error: error.message || 'Database connection error',
        code: error.code || 'CONNECTION_FAILED',
        hint: !envStatus.hasDatabaseUrl && !envStatus.hasPostgresUrl && !envStatus.hasPrismaDatabaseUrl
          ? 'Missing DATABASE_URL / POSTGRES_URL in Vercel Environment Variables. Please add DATABASE_URL in Vercel Project Settings.'
          : 'Check if PostgreSQL database is running, allows incoming connections, and SSL mode is set if required.',
      },
      { status: 500 }
    );
  }
}
