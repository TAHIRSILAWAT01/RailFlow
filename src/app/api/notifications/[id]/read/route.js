import { NextResponse } from 'next/server';
import { initializeStore, persistStore } from '@/lib/store';

export async function POST(request, { params }) {
  try {
    const { id } = await params;

    const store = await initializeStore();

    const notif = store.notifications.find(n => n.id === id);

    if (!notif) {
      return NextResponse.json(
        {
          success: false,
          error: 'Notification not found'
        },
        { status: 404 }
      );
    }

    notif.status = 'READ';
    notif.readAt = new Date().toISOString();

    await persistStore();

    return NextResponse.json({
      success: true,
      data: notif
    });
  } catch (err) {
    console.error('Mark notification as read error:', err);

    return NextResponse.json(
      {
        success: false,
        error: err.message
      },
      { status: 500 }
    );
  }
}