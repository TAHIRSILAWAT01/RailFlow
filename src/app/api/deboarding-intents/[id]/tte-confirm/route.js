import { NextResponse } from 'next/server';
import { getOrCreateSessionId } from '@/lib/session';
import { runWithSessionStore } from '@/lib/requestStoreContext';
import { tteConfirmIntent } from '@/lib/intentService';
import { initializeStore, persistStore } from '@/lib/store';

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const { tteId } = body;

    // Load the latest persistent RailFlow state for this browser session
    const sessionId = await getOrCreateSessionId();

    return await runWithSessionStore(sessionId, async () => {
      await initializeStore(sessionId);

      // Confirm and lock the deboarding intent
      const intent = tteConfirmIntent(id, tteId);

      // Persist:
      // - intent status
      // - vacancy status
      // - notification created by tteConfirmIntent()
      await persistStore(sessionId);

      return NextResponse.json({
        success: true,
        data: { intent },
        message:
          'Intent confirmed and locked. Passenger cannot modify deboarding station.'
      });
    });
  } catch (err) {
    console.error('TTE intent confirmation error:', err);

    return NextResponse.json(
      {
        success: false,
        error: err.message
      },
      { status: 400 }
    );
  }
}