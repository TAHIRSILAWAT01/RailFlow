import { NextResponse } from 'next/server';
import { getOrCreateSessionId } from '@/lib/session';
import { runWithSessionStore } from '@/lib/requestStoreContext';
import { initializeStore } from '@/lib/store';

export async function GET() {
  try {
    const sessionId = await getOrCreateSessionId();

    return await runWithSessionStore(sessionId, async () => {
      const store = await initializeStore(sessionId);

      return NextResponse.json({
        success: true,
        message: 'RailFlow state initialized successfully',
        counts: {
          trains: store.trains.length,
          stations: store.stations.length,
          racCandidates: store.racCandidates.length,
          waitlistCandidates: store.waitlistCandidates.length,
          bookings: store.bookings.length,
          intents: store.deboardingIntents.length,
          vacancies: store.vacancies.length,
          notifications: store.notifications.length,
        },
      });
    });
  } catch (error) {
    console.error('RailFlow state initialization error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}