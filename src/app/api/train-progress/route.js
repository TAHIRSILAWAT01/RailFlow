import { NextResponse } from 'next/server';
import { getOrCreateSessionId } from '@/lib/session';
import { runWithSessionStore } from '@/lib/requestStoreContext';
import {
  getProgress,
  getAllProgress,
  resetProgress
} from '@/lib/trainProgressService';
import {
  initializeStore,
  persistStore
} from '@/lib/store';

export async function GET(request) {
  try {
    // Load latest persistent state for this browser session
    const sessionId = await getOrCreateSessionId();

    return await runWithSessionStore(sessionId, async () => {
      await initializeStore(sessionId);

      const { searchParams } = new URL(request.url);
      const trainId = searchParams.get('trainId');

      if (trainId) {
        const progress = getProgress(trainId);

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
      }

      const all = getAllProgress();

      return NextResponse.json({
        success: true,
        data: all
      });
    });
  } catch (err) {
    console.error('Get train progress error:', err);

    return NextResponse.json(
      {
        success: false,
        error: err.message
      },
      { status: 500 }
    );
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

    // Load latest persistent state for this browser session
    const sessionId = await getOrCreateSessionId();

    return await runWithSessionStore(sessionId, async () => {
      await initializeStore(sessionId);

      // Reset train progress
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

      // Persist reset state for this browser session
      await persistStore(sessionId);

      return NextResponse.json({
        success: true,
        data: progress
      });
    });

  } catch (err) {
    console.error('Reset train progress error:', err);

    return NextResponse.json(
      {
        success: false,
        error: err.message || 'Failed to reset train progress'
      },
      { status: 500 }
    );
  }
}