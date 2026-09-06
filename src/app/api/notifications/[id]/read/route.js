import { NextResponse } from 'next/server';
import { getStore } from '@/lib/store';

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const store = getStore();
    const notif = store.notifications.find(n => n.id === id);
    if (!notif) {
      return NextResponse.json({ success: false, error: 'Notification not found' }, { status: 404 });
    }
    notif.status = 'READ';
    return NextResponse.json({ success: true, data: notif });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
