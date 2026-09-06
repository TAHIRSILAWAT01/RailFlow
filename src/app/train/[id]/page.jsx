'use client';

import { useEffect, useState, Suspense, use } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { ViewProvider, AppShell } from '@/components/ViewToggle';

function RouteTimeline({ stations, originCode, destCode, bookedDestCode, currentCode }) {
  return (
    <div className="route-timeline" style={{ padding: '8px 0' }}>
      {stations.map((st, idx) => {
        let role = '';
        if (st.code === originCode) role = 'origin';
        else if (st.code === destCode && bookedDestCode && destCode !== bookedDestCode) role = 'deboarding';
        else if (st.code === bookedDestCode) role = 'destination';
        else if (st.code === currentCode) role = 'current';

        return (
          <div key={st.code} className={`route-station ${role}`} style={{ paddingBottom: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{
                  fontWeight: role ? '700' : '400',
                  fontSize: role ? '14px' : '13px',
                  color: role === 'origin' ? '#1a3a5c' :
                         role === 'destination' ? '#e85d04' :
                         role === 'deboarding' ? '#059669' :
                         role === 'current' ? '#7c3aed' : '#4a5568'
                }}>
                  {st.name}
                </span>
                {role === 'origin' && <span style={{ marginLeft: '6px', fontSize: '10px', color: '#1a3a5c', fontWeight: '700' }}>● BOARDING</span>}
                {role === 'deboarding' && <span style={{ marginLeft: '6px', fontSize: '10px', color: '#059669', fontWeight: '700' }}>● DEBOARDING</span>}
                {role === 'destination' && <span style={{ marginLeft: '6px', fontSize: '10px', color: '#e85d04', fontWeight: '700' }}>● BOOKED DEST</span>}
              </div>
              <div style={{ textAlign: 'right', fontSize: '12px', color: '#718096' }}>
                {st.arrive && <span>{st.arrive}</span>}
                {st.depart && st.arrive && <span> / </span>}
                {st.depart && <span>{st.depart}</span>}
                {st.day > 1 && <span style={{ marginLeft: '4px', fontSize: '10px', background: '#e2e8f0', padding: '1px 4px', borderRadius: '3px' }}>D+{st.day - 1}</span>}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TrainDetailContent({ params }) {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const router = useRouter();
  const [train, setTrain] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const origin = searchParams.get('origin');
  const destination = searchParams.get('destination');
  const bookedDest = searchParams.get('bookedDest');
  const cls = searchParams.get('class');
  const date = searchParams.get('date');
  const fare = searchParams.get('fare');
  const requestedDest = searchParams.get('requestedDest');

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/trains/${id}/route-detail?origin=${origin || ''}&destination=${destination || ''}&bookedDest=${bookedDest || ''}&class=${cls || ''}`);
        const data = await res.json();
        if (data.success) setTrain(data.data.train);
        else setError(data.error);
      } catch {
        setError('Failed to load train details');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, origin, destination, bookedDest, cls]);

  function handleBook() {
    const p = new URLSearchParams({
      origin: origin || '',
      destination: destination || '',
      class: cls || '',
      date: date || '',
      fare: fare || '',
      ...(requestedDest ? { requestedDest } : {})
    });
    router.push(`/booking/${id}?${p}`);
  }

  const displayDest = bookedDest || destination;
  const isAlternate = !!(requestedDest && bookedDest);

  return (
    <ViewProvider>
      <AppShell>
        <Header title="Train Details" />

        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
          {loading && (
            <div style={{ textAlign: 'center', padding: '60px' }}>
              <div className="spinner" style={{ width: '32px', height: '32px', margin: '0 auto 16px' }} />
              <div style={{ color: '#718096' }}>Loading train details...</div>
            </div>
          )}

          {error && <div style={{ textAlign: 'center', padding: '60px', color: '#c1121f' }}>{error}</div>}

          {!loading && !error && train && (
            <>
              {/* Train header */}
              <div className="rf-card" style={{ marginBottom: '16px' }}>
                <div style={{ background: '#1a3a5c', padding: '20px', color: 'white' }}>
                  <div style={{ fontSize: '24px', fontWeight: '800', letterSpacing: '-0.5px' }}>{train.number}</div>
                  <div style={{ fontSize: '16px', color: 'rgba(255,255,255,0.8)', marginTop: '4px' }}>{train.name}</div>
                </div>
                <div style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: '#718096', fontWeight: '600', textTransform: 'uppercase' }}>Journey</div>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: '#1a3a5c', marginTop: '2px' }}>
                      {origin} → {displayDest}
                    </div>
                    {isAlternate && (
                      <div style={{ fontSize: '12px', color: '#059669', marginTop: '2px' }}>
                        Actual intent: deboard at {requestedDest}
                      </div>
                    )}
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: '#718096', fontWeight: '600', textTransform: 'uppercase' }}>Class</div>
                    <div style={{ fontSize: '14px', fontWeight: '700', marginTop: '2px' }}>{cls}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: '#718096', fontWeight: '600', textTransform: 'uppercase' }}>Date</div>
                    <div style={{ fontSize: '14px', fontWeight: '700', marginTop: '2px' }}>{date}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: '#718096', fontWeight: '600', textTransform: 'uppercase' }}>Fare</div>
                    <div style={{ fontSize: '18px', fontWeight: '800', color: '#e85d04', marginTop: '2px' }}>₹{parseInt(fare || 0).toLocaleString()}</div>
                  </div>
                </div>
              </div>

              {/* Smart alternate info */}
              {isAlternate && (
                <div style={{
                  background: '#f0fdf4',
                  border: '1.5px solid #86efac',
                  borderRadius: '10px',
                  padding: '14px',
                  marginBottom: '16px'
                }}>
                  <div style={{ fontWeight: '700', color: '#15803d', marginBottom: '6px' }}>⚡ Smart Alternate Booking</div>
                  <div style={{ fontSize: '13px', color: '#166534', lineHeight: 1.5 }}>
                    <div>Booked destination: <strong>{displayDest}</strong></div>
                    <div>You plan to deboard at: <strong>{requestedDest}</strong></div>
                    <div style={{ marginTop: '6px', color: '#065f46' }}>
                      After booking, declare your deboarding intent — RailFlow will create a predicted vacancy for {requestedDest} → {displayDest}.
                    </div>
                  </div>
                </div>
              )}

              {/* Full route */}
              <div className="rf-card" style={{ marginBottom: '20px' }}>
                <div style={{ padding: '14px 16px', borderBottom: '1px solid #f1f5f9', fontWeight: '700', fontSize: '13px', color: '#1a3a5c' }}>
                  Full Route — {train.route?.length} Stations
                </div>
                <div style={{ padding: '12px 24px' }}>
                  <RouteTimeline
                    stations={train.enrichedRoute || []}
                    originCode={origin}
                    destCode={requestedDest || destination}
                    bookedDestCode={isAlternate ? displayDest : null}
                    currentCode={null}
                  />
                </div>

                {/* Legend */}
                <div style={{ padding: '12px 16px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#718096' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#1a3a5c' }} />
                    Boarding
                  </div>
                  {isAlternate && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#718096' }}>
                      <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#059669' }} />
                      Intended deboarding
                    </div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#718096' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#e85d04' }} />
                    {isAlternate ? 'Booked destination' : 'Destination'}
                  </div>
                </div>
              </div>

              {/* Book button */}
              <button className="btn-primary" style={{ width: '100%', padding: '16px', fontSize: '16px' }} onClick={handleBook}>
                Continue to Booking →
              </button>
            </>
          )}
        </div>
      </AppShell>
    </ViewProvider>
  );
}

export default function TrainDetailPage({ params }) {
  return (
    <Suspense fallback={<div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>}>
      <TrainDetailContent params={params} />
    </Suspense>
  );
}
