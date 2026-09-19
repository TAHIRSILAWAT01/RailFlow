import { NextResponse } from 'next/server';
import {
  getProgress,
  getAllProgress,
  resetProgress
} from '@/lib/trainProgressService';

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
export async function POST(request) {
  try {
    const body = await request.json();
    const { trainId, action } = body;

    if (!trainId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Train ID required'
        },
        { status: 400 }
      );
    }

    if (action !== 'reset') {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid action'
        },
        { status: 400 }
      );
    }

    const progress = resetProgress(trainId);

    if (!progress) {
      return NextResponse.json(
        {
          success: false,
          error: 'Train not found'
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: progress
    });

  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: err.message || 'Failed to reset train progress'
      },
      { status: 500 }
    );
  }
}