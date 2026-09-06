'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { ViewProvider, AppShell } from '@/components/ViewToggle';

function IntentStatusBar({ status, confidence }) {
  const steps = [
    { key: 'DECLARED', label: 'Declared', icon: '📝' },
    { key: 'LOCKED', label: 'Locked', icon: '🔒' },
    { key: 'DEBOARDING_DUE', label: 'Deboarding Due', icon: '🚉' },
    { key: 'VERIFIED', label: 'Verified', icon: '✅' }
  ];
  const currentIdx = steps.findIndex(s => s.key === status);

  return (
    <div style={{ marginTop: '10px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
        {steps.map((s, i) => (
          <div key={s.key} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '50%',
              background: i <= currentIdx ? (i === currentIdx ? '#e85d04' : '#059669') : '#e2e8f0',
              color: i <= currentIdx ? 'white' : '#a0aec0',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '12px', flexShrink: 0
            }}>
              {i < currentIdx ? '✓' : s.icon}
            </div>
            {i < steps.length - 1 && (
              <div style={{ flex: 1, height: '2px', background: i < currentIdx ? '#059669' : '#e2e8f0' }} />
            )}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
        {steps.map((s, i) => (
          <div key={s.key} style={{
            fontSize: '9px', color: i <= currentIdx ? '#1a202c' : '#a0aec0',
            fontWeight: i === currentIdx ? '700' : '400',
            flex: 1, textAlign: i === 0 ? 'left' : i === steps.length - 1 ? 'right' : 'center'
          }}>
            {s.label}
          </div>
        ))}
      </div>
      {confidence && (
        <div style={{ marginTop: '6px', fontSize: '11px', color: '#718096' }}>
          Confidence: {confidence}% · Prototype score — not a production ML prediction
        </div>
      )}
    </div>
  );
}

export default function TripsPage() {
  const router = useRouter();
  const [bookingId, setBookingId] = useState(null);
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [allBookings, setAllBookings] = useState([]);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('rf_booking_id');
    setBookingId(saved);
    loadAll();
  }, []);

  async function loadAll() {
    try {
      const res = await fetch('/api/bookings');
      const data = await res.json();
      if (data.success) {
        setAllBookings(data.data.filter(b => b.status === 'CONFIRMED'));
      }
    } catch { }
    finally { setLoading(false); }
  }

  async function loadBooking(id) {
    try {
      const res = await fetch(`/api/bookings/${id}`);
      const data = await res.json();
      if (data.success) setBooking(data.data);
      else setError(data.error);
    } catch {
      setError('Failed to load booking');
    }
  }

  useEffect(() => {
    if (bookingId) loadBooking(bookingId);
  }, [bookingId]);

  const isLocked = booking?.intent?.status === 'LOCKED' || booking?.intent?.status === 'DEBOARDING_DUE';
  const deboardSt = booking?.deboardStation;

  return (
    <ViewProvider>
      <AppShell>
        <Header title="My Trips" showBack={false} />

        <div style={{ padding: '20px', maxWidth: '700px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#1a3a5c', marginBottom: '4px' }}>My Trips</h1>
          <p style={{ fontSize: '13px', color: '#718096', marginBottom: '20px' }}>
            Bookings are stored on the backend — persists across browser refresh.
          </p>

          {loading && (
            <div style={{ textAlign: 'center', padding: '60px' }}>
              <div className="spinner" style={{ width: '32px', height: '32px', margin: '0 auto 16px' }} />
            </div>
          )}

          {/* Current demo booking */}
          {booking && (
            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#718096', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>
                Current Demo Booking
              </div>
              <div className="rf-card">
                <div style={{ background: '#1a3a5c', padding: '14px 16px', color: 'white' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '16px' }}>{booking.trainNumber} — {booking.trainName}</div>
                      <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', marginTop: '2px' }}>PNR: {booking.pnr}</div>
                    </div>
                    <span className="badge badge-confirmed">Confirmed</span>
                  </div>
                </div>
                <div style={{ padding: '16px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                    <div>
                      <div style={{ fontSize: '11px', color: '#718096', fontWeight: '600' }}>FROM</div>
                      <div style={{ fontSize: '14px', fontWeight: '700' }}>{booking.originStation?.name || booking.origin}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', color: '#718096', fontWeight: '600' }}>BOOKED TO</div>
                      <div style={{ fontSize: '14px', fontWeight: '700', color: '#e85d04' }}>{booking.destStation?.name || booking.destination}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', color: '#718096', fontWeight: '600' }}>COACH / BERTH</div>
                      <div style={{ fontSize: '14px', fontWeight: '700' }}>{booking.coach} — Berth {booking.berth}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', color: '#718096', fontWeight: '600' }}>DATE</div>
                      <div style={{ fontSize: '14px', fontWeight: '700' }}>{booking.journeyDate}</div>
                    </div>
                  </div>

                  {/* Early deboarding section */}
                  {booking.intent && (
                    <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <div style={{ fontWeight: '700', color: '#ea580c', fontSize: '13px' }}>⚡ Early Deboarding Intent</div>
                        {isLocked && (
                          <span style={{ background: '#fce7f3', color: '#9d174d', fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '4px' }}>
                            🔒 LOCKED
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
                        <div>
                          <div style={{ fontSize: '11px', color: '#718096', fontWeight: '600' }}>DECLARED DEBOARDING</div>
                          <div style={{ fontSize: '14px', fontWeight: '700', color: '#059669' }}>
                            {deboardSt?.name || booking.intent.deboardingStation}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '11px', color: '#718096', fontWeight: '600' }}>INTENT STATUS</div>
                          <div style={{ fontSize: '14px', fontWeight: '700' }}>{booking.intent.status}</div>
                        </div>
                      </div>
                      {booking.vacancy && (
                        <div style={{
                          background: '#f0fdf4', border: '1px solid #86efac',
                          borderRadius: '8px', padding: '10px', marginBottom: '10px'
                        }}>
                          <div style={{ fontSize: '11px', color: '#718096', fontWeight: '600', marginBottom: '4px' }}>EXPECTED VACANCY</div>
                          <div style={{ fontSize: '14px', fontWeight: '700', color: '#15803d' }}>
                            {deboardSt?.name || booking.intent.deboardingStation} → {booking.destStation?.name || booking.destination}
                          </div>
                          <div style={{ fontSize: '11px', color: '#059669', marginTop: '2px' }}>
                            Status: {booking.vacancy.status} · Confidence: {booking.vacancy.confidence}%
                          </div>
                        </div>
                      )}
                      <IntentStatusBar status={booking.intent.status} confidence={booking.intent.confidence} />
                      {isLocked && (
                        <div style={{ marginTop: '10px', fontSize: '12px', color: '#9a3412', background: '#fef2f2', padding: '8px 10px', borderRadius: '6px' }}>
                          🔒 Early deboarding station is locked. Cannot be modified.
                        </div>
                      )}
                    </div>
                  )}

                  {/* Allocation */}
                  {booking.allocation && (
                    <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '14px', marginTop: '14px' }}>
                      <div style={{ fontWeight: '700', color: '#059669', marginBottom: '8px', fontSize: '13px' }}>
                        📋 Allocation Recommendation
                      </div>
                      <div style={{ fontSize: '13px', color: '#166534' }}>
                        {booking.allocation.recommendedCandidate?.name} ({booking.allocation.recommendedCandidate?.type}) — {booking.allocation.recommendedCandidate?.pnr}
                      </div>
                      <div style={{ fontSize: '11px', color: '#718096', marginTop: '4px' }}>
                        {booking.allocation.disclaimer}
                      </div>
                    </div>
                  )}
                </div>
                <div style={{ padding: '12px 16px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '8px' }}>
                  <button className="btn-ghost" style={{ flex: 1 }} onClick={() => router.push(`/confirmation/${booking.id}`)}>
                    View Ticket
                  </button>
                  <button className="btn-ghost" style={{ flex: 1 }} onClick={() => router.push('/tte')}>
                    TTE View
                  </button>
                </div>
              </div>
            </div>
          )}

          {!bookingId && !loading && (
            <div className="empty-state">
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>🎫</div>
              <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>No booking found</div>
              <div style={{ fontSize: '13px', color: '#a0aec0', marginBottom: '20px' }}>
                Complete the demo booking to see your trip here.
              </div>
              <button className="btn-primary" onClick={() => router.push('/search')}>Search Trains</button>
            </div>
          )}

          {/* All confirmed bookings */}
          {allBookings.length > 0 && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ fontSize: '12px', fontWeight: '700', color: '#718096', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  All Demo Bookings ({allBookings.length})
                </div>
                <button className="btn-ghost" style={{ fontSize: '12px' }} onClick={() => setShowAll(!showAll)}>
                  {showAll ? 'Hide' : 'Show all'}
                </button>
              </div>
              {showAll && allBookings.map(b => (
                <div key={b.id} className="rf-card" style={{ marginBottom: '8px', padding: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '14px' }}>{b.trainNumber}</div>
                      <div style={{ fontSize: '12px', color: '#718096' }}>{b.origin} → {b.destination} · {b.journeyDate}</div>
                      <div style={{ fontSize: '12px', color: '#718096' }}>PNR: {b.pnr} · {b.passenger?.name}</div>
                    </div>
                    <button className="btn-ghost" style={{ fontSize: '12px' }} onClick={() => {
                      localStorage.setItem('rf_booking_id', b.id);
                      setBookingId(b.id);
                      loadBooking(b.id);
                    }}>Set Current</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </AppShell>
    </ViewProvider>
  );
}
