import { NextResponse } from 'next/server';
import { tteConfirmIntent } from '@/lib/intentService';

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const { tteId } = body;

    const intent = tteConfirmIntent(id, tteId);
    return NextResponse.json({
      success: true,
      data: { intent },
      message: 'Intent confirmed and locked. Passenger cannot modify deboarding station.'
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
