import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'bbapp-admin-ui',
    version: process.env.VERSION || 'development',
    environment: process.env.ENVIRONMENT || process.env.NODE_ENV || 'development',
    buildDate: process.env.BUILD_DATE || 'unknown',
    gitCommit: process.env.GIT_COMMIT || 'unknown',
    uptime: process.uptime(),
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
    }
  });
}
