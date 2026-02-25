import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'CI/CD Pipeline Test - Build working! 🚀',
    timestamp: new Date().toISOString(),
    version: process.env.VERSION || 'dev',
    buildtime: process.env.BUILDTIME || 'unknown',
    commit: process.env.NEXT_PUBLIC_COMMIT_SHA || 'unknown',
    environment: 'development',
    pipeline: 'github-actions',
    test_build: 'v2-org-wide-auth'
  });
}
