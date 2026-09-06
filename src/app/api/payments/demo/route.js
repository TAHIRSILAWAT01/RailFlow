import { NextResponse } from 'next/server';
import { processPayment } from '@/lib/paymentService';

export async function POST(request) {
  try {
    const body = await request.json();
    const { bookingId, method, amount, paymentDetails } = body;

    if (!bookingId) return NextResponse.json({ success: false, error: 'Booking ID required' }, { status: 400 });
    if (!method) return NextResponse.json({ success: false, error: 'Payment method required' }, { status: 400 });
    if (!amount || amount <= 0) return NextResponse.json({ success: false, error: 'Valid amount required' }, { status: 400 });

    const payment = processPayment({ bookingId, method, amount, paymentDetails });

    if (payment.status === 'FAILED') {
      return NextResponse.json({
        success: false,
        error: payment.failureReason || 'Payment failed',
        data: { payment },
        disclaimer: 'Demo payment — no real money is charged.'
      }, { status: 402 });
    }

    return NextResponse.json({
      success: true,
      data: { payment },
      message: 'Payment successful. Booking confirmed.',
      disclaimer: 'Demo payment — no real money is charged.'
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
