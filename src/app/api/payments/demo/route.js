import { NextResponse } from 'next/server';
import { getOrCreateSessionId } from '@/lib/session';
import { runWithSessionStore } from '@/lib/requestStoreContext';
import { processPayment } from '@/lib/paymentService';
import { initializeStore, persistStore } from '@/lib/store';

export async function POST(request) {
  try {
    const body = await request.json();

    const {
      bookingId,
      method,
      amount,
      paymentDetails
    } = body;

    if (!bookingId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Booking ID required'
        },
        { status: 400 }
      );
    }

    if (!method) {
      return NextResponse.json(
        {
          success: false,
          error: 'Payment method required'
        },
        { status: 400 }
      );
    }

    if (!amount || amount <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Valid amount required'
        },
        { status: 400 }
      );
    }

    const sessionId = await getOrCreateSessionId();

    return await runWithSessionStore(sessionId, async () => {
      // Load persistent RailFlow state for this browser session
      await initializeStore(sessionId);

      // Process payment
      const payment = processPayment({
        bookingId,
        method,
        amount,
        paymentDetails
      });

      // If payment failed, persist any state changes made by
      // processPayment before returning.
      if (payment.status === 'FAILED') {
        await persistStore(sessionId);

        return NextResponse.json(
          {
            success: false,
            error: payment.failureReason || 'Payment failed',
            data: { payment },
            disclaimer: 'Demo payment — no real money is charged.'
          },
          { status: 402 }
        );
      }

      // Persist successful payment + booking confirmation
      await persistStore(sessionId);

      return NextResponse.json(
        {
          success: true,
          data: { payment },
          message: 'Payment successful. Booking confirmed.',
          disclaimer: 'Demo payment — no real money is charged.'
        }
      );
    });
  } catch (err) {
    console.error('Demo payment error:', err);

    return NextResponse.json(
      {
        success: false,
        error: err.message
      },
      { status: 500 }
    );
  }
}