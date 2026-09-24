import { NextResponse } from 'next/server';
import { getOrCreateSessionId } from '@/lib/session';
import { runWithSessionStore } from '@/lib/requestStoreContext';
import {
  createDeboardingIntent,
  getValidDeboardingStations
} from '@/lib/intentService';
import { initializeStore } from '@/lib/store';

export async function POST(request) {
  try {
    const body = await request.json();
    const { bookingId, deboardingStation } = body;

    if (!bookingId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Booking ID required'
        },
        { status: 400 }
      );
    }

    if (!deboardingStation) {
      return NextResponse.json(
        {
          success: false,
          error: 'Deboarding station required'
        },
        { status: 400 }
      );
    }

    const sessionId = await getOrCreateSessionId();

    return await runWithSessionStore(sessionId, async () => {
      const store = await initializeStore(sessionId);

      const intent = createDeboardingIntent(
        bookingId,
        deboardingStation
      );

      const vacancy = store.vacancies.find(
        v => v.bookingId === bookingId
      );

      return NextResponse.json(
        {
          success: true,
          data: { intent, vacancy },
          message:
            'Deboarding intent declared. Intent created before payment.'
        },
        { status: 201 }
      );
    });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: err.message
      },
      { status: 400 }
    );
  }
}
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('bookingId');
    const trainId = searchParams.get('trainId');
    const origin = searchParams.get('origin');
    const destination = searchParams.get('destination');

    const sessionId = await getOrCreateSessionId();

    return await runWithSessionStore(sessionId, async () => {
      const store = await initializeStore(sessionId);

      // Get valid deboarding stations
      if (trainId && origin && destination) {
        const stations = getValidDeboardingStations(
          trainId,
          origin,
          destination
        );

        return NextResponse.json({
          success: true,
          data: stations
        });
      }

      let intents = store.deboardingIntents;

      if (bookingId) {
        intents = intents.filter(
          i => i.bookingId === bookingId
        );
      }

      return NextResponse.json({
        success: true,
        data: intents
      });
    });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: err.message
      },
      { status: 500 }
    );
  }
}