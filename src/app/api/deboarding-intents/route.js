import { NextResponse } from 'next/server';
import { createDeboardingIntent, getValidDeboardingStations } from '@/lib/intentService';
import { getStore } from '@/lib/store';

export async function POST(request) {
  try {
    const body = await request.json();
    const { bookingId, deboardingStation } = body;

    if (!bookingId) return NextResponse.json({ success: false, error: 'Booking ID required' }, { status: 400 });
    if (!deboardingStation) return NextResponse.json({ success: false, error: 'Deboarding station required' }, { status: 400 });

    const intent = createDeboardingIntent(bookingId, deboardingStation);
    const store = getStore();
    const vacancy = store.vacancies.find(v => v.bookingId === bookingId);

    return NextResponse.json({
      success: true,
      data: { intent, vacancy },
      message: 'Deboarding intent declared. Intent created before payment.'
    }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('bookingId');
    const trainId = searchParams.get('trainId');
    const origin = searchParams.get('origin');
    const destination = searchParams.get('destination');

    // Get valid deboarding stations
    if (trainId && origin && destination) {
      const stations = getValidDeboardingStations(trainId, origin, destination);
      return NextResponse.json({ success: true, data: stations });
    }

    const store = getStore();
    let intents = store.deboardingIntents;
    if (bookingId) {
      intents = intents.filter(i => i.bookingId === bookingId);
    }

    return NextResponse.json({ success: true, data: intents });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
