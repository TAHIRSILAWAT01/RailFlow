import { NextResponse } from 'next/server';
import { getOrCreateSessionId } from '@/lib/session';
import { runWithSessionStore } from '@/lib/requestStoreContext';
import { initializeStore } from '@/lib/store';

export async function GET() {
  try {
    // Load latest persistent RailFlow state for this browser session
    const sessionId = await getOrCreateSessionId();

    return await runWithSessionStore(sessionId, async () => {
      const store = await initializeStore(sessionId);

      return NextResponse.json({
        success: true,
        data: store.allocations
      });
    });
  } catch (err) {
    console.error('Get allocations error:', err);

    return NextResponse.json(
      {
        success: false,
        error: err.message
      },
      { status: 500 }
    );
  }
}