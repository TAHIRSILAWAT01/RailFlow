import { NextResponse } from 'next/server';
import { getStore } from '@/lib/store';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const unread = searchParams.get('unread');

    const store = getStore();
    let notifs = [...store.notifications].sort((a, b) =>
      new Date(b.createdAt) - new Date(a.createdAt)
    );

    if (role) {
      notifs = notifs.filter(n => n.recipientRole === role || n.recipientRole === 'ALL');
    }
    if (unread === 'true') {
      notifs = notifs.filter(n => n.status === 'UNREAD');
    }

    return NextResponse.json({
      success: true,
      data: notifs,
      unreadCount: notifs.filter(n => n.status === 'UNREAD').length
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
