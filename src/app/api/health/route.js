import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    app: 'RAILFLOW',
    tagline: 'Predict the seat before it becomes empty.',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    disclaimer: 'Prototype only — Railway/IRCTC/PRS/CRIS/HHT integrations are simulated.'
  });
}
