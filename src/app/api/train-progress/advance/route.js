import { NextResponse } from 'next/server';
import { advanceStation } from '@/lib/trainProgressService';

export async function POST(request) {
  try {
    const body = await request.json();
    const { trainId } = body;

    if (!trainId) return NextResponse.json({ success: false, error: 'Train ID required' }, { status: 400 });

    const progress = advanceStation(trainId);
    return NextResponse.json({ success: true, data: progress });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
