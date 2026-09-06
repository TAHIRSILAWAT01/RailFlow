import { NextResponse } from 'next/server';
import { getStore } from '@/lib/store';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const trainId = searchParams.get('trainId');
    const fromStation = searchParams.get('fromStation');
    const toStation = searchParams.get('toStation');
    const cls = searchParams.get('class');

    const store = getStore();
    let candidates = [...store.racCandidates, ...store.waitlistCandidates];

    if (trainId) candidates = candidates.filter(c => c.trainId === trainId);
    if (fromStation) candidates = candidates.filter(c => c.fromStation === fromStation);
    if (toStation) candidates = candidates.filter(c => c.toStation === toStation);
    if (cls) candidates = candidates.filter(c => c.class === cls);

    return NextResponse.json({ success: true, data: candidates });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
