import { NextResponse } from 'next/server';
import { updateIntent } from '@/lib/intentService';
import { getStore } from '@/lib/store';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const store = getStore();
    const intent = store.deboardingIntents.find(i => i.id === id);
    if (!intent) {
      return NextResponse.json({ success: false, error: 'Intent not found' }, { status: 404 });
    }

    const vacancy = store.vacancies.find(v => v.intentId === id);
    return NextResponse.json({ success: true, data: { intent, vacancy } });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { deboardingStation, bookingId } = body;

    if (!deboardingStation) return NextResponse.json({ success: false, error: 'Deboarding station required' }, { status: 400 });
    if (!bookingId) return NextResponse.json({ success: false, error: 'Booking ID required' }, { status: 400 });

    const intent = updateIntent(id, deboardingStation, bookingId);
    return NextResponse.json({ success: true, data: { intent } });
  } catch (err) {
    const status = err.message.includes('locked') ? 423 : 400;
    return NextResponse.json({ success: false, error: err.message }, { status });
  }
}
