import { NextResponse } from 'next/server';
import { getOperationsDashboard } from '@/lib/vacancyService';
import { getStore } from '@/lib/store';

export async function GET() {
  try {
    const dashboard = getOperationsDashboard();
    const store = getStore();

    // Enrich rows with station names
    const enrichedRows = dashboard.rows.map(row => {
      const train = store.trains.find(t => t.id === row.trainId);
      const fromStation = store.stations.find(s => s.code === row.declaredDeboarding);
      const booking = store.bookings.find(b => b.pnr === row.pnr);
      const originSt = booking ? store.stations.find(s => s.code === booking.origin) : null;
      const destSt = booking ? store.stations.find(s => s.code === booking.destination) : null;

      return {
        ...row,
        trainName: train?.name || row.trainNumber,
        declaredDeboardingName: fromStation?.name || row.declaredDeboarding,
        bookedJourneyNames: booking
          ? `${originSt?.name || booking.origin} → ${destSt?.name || booking.destination}`
          : row.bookedJourney
      };
    });

    return NextResponse.json({
      success: true,
      data: { ...dashboard, rows: enrichedRows }
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
