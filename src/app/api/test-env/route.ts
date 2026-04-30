import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    GEMINI_API_KEY: process.env.GEMINI_API_KEY
      ? `✅ présente (${process.env.GEMINI_API_KEY.slice(0, 6)}...)`
      : '❌ absente',
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY
      ? `✅ présente`
      : '❌ absente',
  });
}
