import { NextResponse } from 'next/server';
import { getBookingWithDetails } from '@/lib/bookingService';
import { getStore } from '@/lib/store';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const booking = getBookingWithDetails(id);
    if (!booking) {
      return NextResponse.json({ success: false, error: 'Booking not found' }, { status: 404 });
    }

    const store = getStore();
    // Enrich with train and station details
    const train = store.trains.find(t => t.id === booking.trainId);
    const originStation = store.stations.find(s => s.code === booking.origin);
    const destStation = store.stations.find(s => s.code === booking.destination);

    let deboardStation = null;
    if (booking.intent?.deboardingStation) {
      deboardStation = store.stations.find(s => s.code === booking.intent.deboardingStation);
    }

    // Get allocation if any
    const allocation = booking.vacancy
      ? store.allocations.find(a => a.vacancyId === booking.vacancy.id)
      : null;

    return NextResponse.json({
      success: true,
      data: {
        ...booking,
        train: train ? { id: train.id, number: train.number, name: train.name } : null,
        originStation: originStation || { code: booking.origin, name: booking.origin },
        destStation: destStation || { code: booking.destination, name: booking.destination },
        deboardStation,
        allocation
      }
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
