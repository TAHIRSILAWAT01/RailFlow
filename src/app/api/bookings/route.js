import { getOrCreateSessionId } from '@/lib/session';
import { NextResponse } from 'next/server';
import { runWithSessionStore } from '@/lib/requestStoreContext';
import { createBooking } from '@/lib/bookingService';
import { createDeboardingIntent } from '@/lib/intentService';
import { initializeStore, persistStore } from '@/lib/store';

export async function POST(request) {
  try {
    const body = await request.json();

    const {
      trainId,
      origin,
      destination,
      class: cls,
      date,
      passenger,
      berthPreference,
      fare,
      earlyDeboarding
    } = body;

    // Validation
    if (!trainId) {
      return NextResponse.json(
        { success: false, error: 'Train ID required' },
        { status: 400 }
      );
    }

    if (!origin) {
      return NextResponse.json(
        { success: false, error: 'Origin required' },
        { status: 400 }
      );
    }

    if (!destination) {
      return NextResponse.json(
        { success: false, error: 'Destination required' },
        { status: 400 }
      );
    }

    if (!cls) {
      return NextResponse.json(
        { success: false, error: 'Class required' },
        { status: 400 }
      );
    }

    if (!date) {
      return NextResponse.json(
        { success: false, error: 'Journey date required' },
        { status: 400 }
      );
    }

    if (!passenger?.name) {
      return NextResponse.json(
        { success: false, error: 'Passenger name required' },
        { status: 400 }
      );
    }

    if (
      !passenger?.age ||
      passenger.age < 1 ||
      passenger.age > 120
    ) {
      return NextResponse.json(
        {
          success: false,
          error: 'Valid age required (1-120)'
        },
        { status: 400 }
      );
    }

    if (
      !passenger?.mobile ||
      !/^\d{10}$/.test(passenger.mobile)
    ) {
      return NextResponse.json(
        {
          success: false,
          error: 'Valid 10-digit mobile required'
        },
        { status: 400 }
      );
    }

    if (!passenger?.gender) {
      return NextResponse.json(
        {
          success: false,
          error: 'Gender required'
        },
        { status: 400 }
      );
    }

    // Get this browser's session
    const sessionId = await getOrCreateSessionId();

    // Run all store/service operations inside this session context
    return await runWithSessionStore(sessionId, async () => {
      // Load persistent RailFlow state for this browser session
      const store = await initializeStore(sessionId);

      const train = store.trains.find(
        t => t.id === trainId
      );

      if (!train) {
        return NextResponse.json(
          {
            success: false,
            error: 'Train not found'
          },
          { status: 404 }
        );
      }

      // Validate origin and destination
      const originIdx = train.route.indexOf(origin);
      const destIdx = train.route.indexOf(destination);

      if (originIdx === -1) {
        return NextResponse.json(
          {
            success: false,
            error: 'Origin not on train route'
          },
          { status: 400 }
        );
      }

      if (destIdx === -1) {
        return NextResponse.json(
          {
            success: false,
            error: 'Destination not on train route'
          },
          { status: 400 }
        );
      }

      if (originIdx >= destIdx) {
        return NextResponse.json(
          {
            success: false,
            error: 'Destination must be after origin on route'
          },
          { status: 400 }
        );
      }

      // Create booking
      const booking = createBooking({
        trainId,
        origin,
        destination,
        cls,
        date,
        passenger,
        berthPreference,
        fare: fare || 0
      });

      // Create early-deboarding intent if declared
      let intent = null;
      let vacancy = null;

      if (
        earlyDeboarding?.enabled &&
        earlyDeboarding?.station
      ) {
        try {
          intent = createDeboardingIntent(
            booking.id,
            earlyDeboarding.station
          );

          vacancy = store.vacancies.find(
            v => v.bookingId === booking.id
          );
        } catch (intentErr) {
          // Rollback in-memory booking
          store.bookings = store.bookings.filter(
            b => b.id !== booking.id
          );

          // Persist rollback for this browser session
          await persistStore(sessionId);

          return NextResponse.json(
            {
              success: false,
              error: `Intent error: ${intentErr.message}`
            },
            { status: 400 }
          );
        }
      }

      // Persist booking + intent + vacancy
      await persistStore(sessionId);

      return NextResponse.json(
        {
          success: true,
          data: {
            booking,
            intent,
            vacancy,
            message: 'Booking created. Proceed to payment.'
          }
        },
        { status: 201 }
      );
    });
  } catch (err) {
    console.error('Booking API error:', err);

    return NextResponse.json(
      {
        success: false,
        error: err.message
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Get this browser's session
    const sessionId = await getOrCreateSessionId();

    return await runWithSessionStore(sessionId, async () => {
      // Load persistent state for this browser session
      const store = await initializeStore(sessionId);

      return NextResponse.json({
        success: true,
        data: store.bookings
      });
    });
  } catch (err) {
    console.error('Get bookings error:', err);

    return NextResponse.json(
      {
        success: false,
        error: err.message
      },
      { status: 500 }
    );
  }
}