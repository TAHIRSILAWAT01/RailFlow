import { NextResponse } from 'next/server';
import { verifyDeboarding } from '@/lib/vacancyService';

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { tteId, passengerDeboarded } = body;

    if (typeof passengerDeboarded !== 'boolean') {
      return NextResponse.json({ success: false, error: 'passengerDeboarded (boolean) required' }, { status: 400 });
    }

    const result = verifyDeboarding(id, tteId, passengerDeboarded);

    return NextResponse.json({
      success: true,
      data: result,
      message: passengerDeboarded
        ? 'Verified vacancy created. Allocation recommendation generated.'
        : 'Passenger continued. No vacancy created.',
      disclaimer: 'Recommendation only — final allocation follows Railway rules.'
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
