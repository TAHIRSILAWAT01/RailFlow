import { NextResponse } from 'next/server';
import { getStore } from '@/lib/store';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const trainId = searchParams.get('trainId');

    const store = getStore();

    // Get all bookings with deboarding intents for this train
    let bookings = store.bookings.filter(b =>
      b.status === 'CONFIRMED' && b.deboardingIntentId
    );

    if (trainId) {
      bookings = bookings.filter(b => b.trainId === trainId);
    }

    const enriched = bookings.map(booking => {
      const intent = store.deboardingIntents.find(i => i.id === booking.deboardingIntentId);
      const vacancy = store.vacancies.find(v => v.bookingId === booking.id);
      const deboardStation = intent
        ? store.stations.find(s => s.code === intent.deboardingStation)
        : null;
      const originStation = store.stations.find(s => s.code === booking.origin);
      const destStation = store.stations.find(s => s.code === booking.destination);
      const allocation = vacancy ? store.allocations.find(a => a.vacancyId === vacancy.id) : null;

      return {
        bookingId: booking.id,
        pnr: booking.pnr,
        trainId: booking.trainId,
        trainNumber: booking.trainNumber,
        passenger: booking.passenger,
        origin: booking.origin,
        originName: originStation?.name || booking.origin,
        destination: booking.destination,
        destinationName: destStation?.name || booking.destination,
        coach: booking.coach,
        berth: booking.berth,
        class: booking.class,
        journeyDate: booking.journeyDate,
        intent: intent ? {
          id: intent.id,
          deboardingStation: intent.deboardingStation,
          deboardingStationName: deboardStation?.name || intent.deboardingStation,
          status: intent.status,
          confidence: intent.confidence,
          declaredAt: intent.declaredAt,
          lockedAt: intent.lockedAt
        } : null,
        vacancy: vacancy ? {
          id: vacancy.id,
          status: vacancy.status,
          confidence: vacancy.confidence,
          fromStation: vacancy.fromStation,
          toStation: vacancy.toStation
        } : null,
        allocation: allocation || null
      };
    });

    return NextResponse.json({ success: true, data: enriched });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
