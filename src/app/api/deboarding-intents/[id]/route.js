import { NextResponse } from 'next/server';
import { updateIntent } from '@/lib/intentService';
import { initializeStore, persistStore } from '@/lib/store';

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    // Load latest persistent state
    const store = await initializeStore();

    const intent = store.deboardingIntents.find(
      i => i.id === id
    );

    if (!intent) {
      return NextResponse.json(
        {
          success: false,
          error: 'Intent not found'
        },
        { status: 404 }
      );
    }

    const vacancy = store.vacancies.find(
      v => v.intentId === id
    );

    return NextResponse.json({
      success: true,
      data: {
        intent,
        vacancy
      }
    });
  } catch (err) {
    console.error('Get intent error:', err);

    return NextResponse.json(
      {
        success: false,
        error: err.message
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const {
      deboardingStation,
      bookingId
    } = body;

    if (!deboardingStation) {
      return NextResponse.json(
        {
          success: false,
          error: 'Deboarding station required'
        },
        { status: 400 }
      );
    }

    if (!bookingId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Booking ID required'
        },
        { status: 400 }
      );
    }

    // Load latest persistent state
    await initializeStore();

    // Update intent + linked vacancy
    const intent = updateIntent(
      id,
      deboardingStation,
      bookingId
    );

    // Persist changes to Supabase
    await persistStore();

    return NextResponse.json({
      success: true,
      data: {
        intent
      }
    });
  } catch (err) {
    console.error('Update intent error:', err);

    const status = err.message.includes('locked')
      ? 423
      : 400;

    return NextResponse.json(
      {
        success: false,
        error: err.message
      },
      { status }
    );
  }
}