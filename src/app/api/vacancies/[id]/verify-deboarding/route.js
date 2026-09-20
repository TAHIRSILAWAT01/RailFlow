import { NextResponse } from 'next/server';
import { verifyDeboarding } from '@/lib/vacancyService';
import { initializeStore, persistStore } from '@/lib/store';

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { tteId, passengerDeboarded } = body;

    if (typeof passengerDeboarded !== 'boolean') {
      return NextResponse.json(
        {
          success: false,
          error: 'passengerDeboarded (boolean) required'
        },
        { status: 400 }
      );
    }

    // Load latest persistent RailFlow state
    await initializeStore();

    // Verify whether passenger actually deboarded
    //
    // If true:
    //   vacancy → VERIFIED_VACANCY
    //   intent → VERIFIED
    //   verification → created
    //   allocation recommendation → generated
    //
    // If false:
    //   vacancy → REJECTED
    //   intent → PASSENGER_CONTINUED
    const result = verifyDeboarding(
      id,
      tteId,
      passengerDeboarded
    );

    // Persist all changes:
    // vacancy + intent + verification + allocation + notification
    await persistStore();

    return NextResponse.json({
      success: true,
      data: result,
      message: passengerDeboarded
        ? 'Verified vacancy created. Allocation recommendation generated.'
        : 'Passenger continued. No vacancy created.',
      disclaimer:
        'Recommendation only — final allocation follows Railway rules.'
    });
  } catch (err) {
    console.error('Verify deboarding error:', err);

    return NextResponse.json(
      {
        success: false,
        error: err.message
      },
      { status: 400 }
    );
  }
}