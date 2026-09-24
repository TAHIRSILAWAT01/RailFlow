import { NextResponse } from 'next/server';
import { getOrCreateSessionId } from '@/lib/session';
import { runWithSessionStore } from '@/lib/requestStoreContext';
import { initializeStore } from '@/lib/store';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const sessionId = await getOrCreateSessionId();

    return await runWithSessionStore(sessionId, async () => {
      const store = await initializeStore(sessionId);

      const train = store.trains.find(t => t.id === id);

      if (!train) {
        return NextResponse.json(
          {
            success: false,
            error: 'Train not found'
          },
          { status: 404 }
        );
      }

      // Enrich with station names
      const enrichedRoute = train.route.map(code => {
        const station = store.stations.find(s => s.code === code);
        const sched = train.schedule[code];

        return {
          code,
          name: station?.name || code,
          city: station?.city || code,
          arrive: sched?.arrive || null,
          depart: sched?.depart || null,
          day: sched?.day || 1
        };
      });

      return NextResponse.json({
        success: true,
        data: { ...train, enrichedRoute }
      });
    });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: err.message
      },
      { status: 500 }
    );
  }
}