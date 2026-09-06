import { NextResponse } from 'next/server';
import { getStore } from '@/lib/store';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // predicted | verified | all

    const store = getStore();
    let vacancies = store.vacancies;

    if (type === 'predicted') {
      vacancies = vacancies.filter(v => ['EXPECTED', 'CONFIRMED_INTENT'].includes(v.status));
    } else if (type === 'verified') {
      vacancies = vacancies.filter(v => ['VERIFIED_VACANCY', 'ALLOCATION_RECOMMENDED'].includes(v.status));
    }

    // Enrich with booking info
    const enriched = vacancies.map(v => {
      const booking = store.bookings.find(b => b.id === v.bookingId);
      const intent = store.deboardingIntents.find(i => i.id === v.intentId);
      const fromStation = store.stations.find(s => s.code === v.fromStation);
      const toStation = store.stations.find(s => s.code === v.toStation);
      return {
        ...v,
        passenger: booking?.passenger?.name || 'N/A',
        pnr: booking?.pnr || 'N/A',
        intentStatus: intent?.status || 'N/A',
        fromStationName: fromStation?.name || v.fromStation,
        toStationName: toStation?.name || v.toStation
      };
    });

    return NextResponse.json({ success: true, data: enriched });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
