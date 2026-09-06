import { NextResponse } from 'next/server';
import { searchTrains, getSmartAlternates } from '@/lib/trainSearchService';
import { getStore } from '@/lib/store';

export async function POST(request) {
  try {
    const body = await request.json();
    const { from, to, date, class: cls, passengers = 1 } = body;

    // Validation
    if (!from) return NextResponse.json({ success: false, error: 'Origin station required' }, { status: 400 });
    if (!to) return NextResponse.json({ success: false, error: 'Destination station required' }, { status: 400 });
    if (from === to) return NextResponse.json({ success: false, error: 'Origin and destination cannot be the same' }, { status: 400 });
    if (!date) return NextResponse.json({ success: false, error: 'Journey date required' }, { status: 400 });
    if (!cls) return NextResponse.json({ success: false, error: 'Class required' }, { status: 400 });

    const store = getStore();
    const validCodes = store.stations.map(s => s.code);
    if (!validCodes.includes(from)) return NextResponse.json({ success: false, error: 'Invalid origin station' }, { status: 400 });
    if (!validCodes.includes(to)) return NextResponse.json({ success: false, error: 'Invalid destination station' }, { status: 400 });

    const trains = searchTrains(from, to, date, cls, passengers);

    // For each train result, also get smart alternates if not confirmed
    const results = trains.map(t => {
      let smartAlternates = [];
      if (t.availability.status !== 'CONFIRMED' || t.availability.count === 0) {
        smartAlternates = getSmartAlternates(from, to, cls, date, t.trainId);
      }
      return { ...t, smartAlternates };
    });

    // Global smart alternates across all trains
    const globalSmartAlternates = getSmartAlternates(from, to, cls, date, null);

    return NextResponse.json({
      success: true,
      data: {
        trains: results,
        searchParams: { from, to, date, class: cls, passengers },
        smartAlternates: globalSmartAlternates,
        totalResults: results.length
      }
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
