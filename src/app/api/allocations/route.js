import { NextResponse } from 'next/server';
import { initializeStore } from '@/lib/store';

export async function GET() {
  try {
    // Load latest persistent RailFlow state
    const store = await initializeStore();

    return NextResponse.json({
      success: true,
      data: store.allocations
    });
  } catch (err) {
    console.error('Get allocations error:', err);

    return NextResponse.json(
      {
        success: false,
        error: err.message
      },
      { status: 500 }
    );
  }
}