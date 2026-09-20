import { NextResponse } from 'next/server';
import { advanceStation } from '@/lib/trainProgressService';
import { initializeStore, persistStore } from '@/lib/store';

export async function POST(request) {
  try {
    const body = await request.json();
    const { trainId } = body;

    if (!trainId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Train ID required'
        },
        { status: 400 }
      );
    }

    // Load latest persistent RailFlow state
    await initializeStore();

    // Advance train by one station
    //
    // This can also:
    // - update trainProgress
    // - change locked intents to DEBOARDING_DUE
    // - update vacancies
    // - create TTE notifications
    const progress = advanceStation(trainId);

    // Persist ALL changes made by advanceStation()
    await persistStore();

    return NextResponse.json({
      success: true,
      data: progress
    });
  } catch (err) {
    console.error('Advance train progress error:', err);

    return NextResponse.json(
      {
        success: false,
        error: err.message
      },
      { status: 400 }
    );
  }
}