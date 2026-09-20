import { NextResponse } from 'next/server';
import { resetStore } from '@/lib/store';

export async function POST() {
  try {
    const store = await resetStore();

    return NextResponse.json({
      success: true,
      message: 'Demo data reset. All bookings, intents, and vacancies cleared.',
      data: {
        stations: store.stations.length,
        trains: store.trains.length,
        racCandidates: store.racCandidates.length,
        waitlistCandidates: store.waitlistCandidates.length
      }
    });
  } catch (err) {
    console.error('Demo reset error:', err);

    return NextResponse.json(
      {
        success: false,
        error: err.message
      },
      { status: 500 }
    );
  }
}