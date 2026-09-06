import { NextResponse } from 'next/server';
import { getStore } from '@/lib/store';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const origin = searchParams.get('origin');
    const destination = searchParams.get('destination');
    const bookedDest = searchParams.get('bookedDest');
    const cls = searchParams.get('class');

    const store = getStore();
    const train = store.trains.find(t => t.id === id);
    if (!train) {
      return NextResponse.json({ success: false, error: 'Train not found' }, { status: 404 });
    }

    const enrichedRoute = train.route.map((code, idx) => {
      const station = store.stations.find(s => s.code === code);
      const sched = train.schedule[code];
      let role = 'intermediate';
      if (origin && code === origin) role = 'origin';
      else if (bookedDest && code === bookedDest) role = 'booked_destination';
      else if (destination && code === destination) role = 'requested_destination';

      let availKey = null;
      if (origin && destination && cls) {
        availKey = `${id}_${cls}_${origin}_${code}`;
      }
      const avail = availKey ? store.availability[availKey] : null;

      return {
        code,
        name: station?.name || code,
        city: station?.city || code,
        state: station?.state || '',
        arrive: sched?.arrive || null,
        depart: sched?.depart || null,
        day: sched?.day || 1,
        index: idx,
        role,
        availability: avail
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        train: { ...train, enrichedRoute },
        origin,
        destination,
        bookedDest
      }
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
