import { NextResponse } from 'next/server';
import { getProgress, getAllProgress } from '@/lib/trainProgressService';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const trainId = searchParams.get('trainId');

    if (trainId) {
      const progress = getProgress(trainId);
      if (!progress) {
        return NextResponse.json({ success: false, error: 'Train not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: progress });
    }

    const all = getAllProgress();
    return NextResponse.json({ success: true, data: all });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
