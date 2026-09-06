'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { ViewProvider, AppShell } from '@/components/ViewToggle';

function StatusBadge({ status }) {
  const map = {
    CONFIRMED: { label: 'Confirmed', cls: 'badge-confirmed' },
    PAYMENT_PENDING: { label: 'Pending', cls: 'badge-pending' },
    DECLARED: { label: 'Declared', cls: 'badge-declared' },
    LOCKED: { label: 'Locked 🔒', cls: 'badge-locked' },
    EXPECTED: { label: 'Expected', cls: 'badge-expected' },
    VERIFIED_VACANCY: { label: 'Verified ✓', cls: 'badge-verified' },
    ALLOCATION_RECOMMENDED: { label: 'Recommended', cls: 'badge-recommended' }
  };
  const b = map[status] || { label: status, cls: 'badge-na' };
  return <span className={`badge ${b.cls}`}>{b.label}</span>;
}

export default function ConfirmationPage({ params }) {
  const { bookingId } = use(params);
  const router = useRouter();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/bookings/${bookingId}`);
        const data = await res.json();
        if (data.success) setBooking(data.data);
        else setError(data.error || 'Booking not found');
      } catch {
        setError('Failed to load booking');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [bookingId]);

  if (loading) return (
    <ViewProvider><AppShell>
      <Header title="Booking Confirmation" />
      <div style={{ textAlign: 'center', padding: '80px' }}>
        <div className="spinner" style={{ width: '32px', height: '32px', margin: '0 auto 16px' }} />
        <div style={{ color: '#718096' }}>Loading your booking...</div>
      </div>
    </AppShell></ViewProvider>
  );

  if (error) return (
    <ViewProvider><AppShell>
      <Header title="Error" />
      <div className="error-state" style={{ padding: '80px 20px' }}>
        <div className="error-icon">⚠️</div>
        <div>{error}</div>
        <button className="btn-primary" style={{ marginTop: '20px' }} onClick={() => router.push('/search')}>Back to Search</button>
      </div>
    </AppShell></ViewProvider>
  );

  const isConfirmed = booking.status === 'CONFIRMED';

  return (
    <ViewProvider>
      <AppShell>
        <Header title="Booking Confirmation" />

        <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
          {/* Success header */}
          {isConfirmed && (
            <div style={{
              textAlign: 'center',
              background: '#f0fdf4',
              border: '2px solid #86efac',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '20px'
            }}>
              <div style={{ fontSize: '36px', marginBottom: '8px' }}>✅</div>
              <div style={{ fontSize: '20px', fontWeight: '700', color: '#15803d' }}>Booking Confirmed!</div>
              <div style={{ fontSize: '13px', color: '#166534', marginTop: '4px' }}>
                Demo booking — Railway ticket issuance is simulated.
              </div>
            </div>
          )}

          {/* Digital Ticket */}
          <div className="ticket-container" style={{ marginBottom: '20px' }}>
            <div className="ticket-header">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: '22px', fontWeight: '900', letterSpacing: '-1px' }}>
                    RAIL<span style={{ color: '#e85d04' }}>FLOW</span>
                  </div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', marginTop: '2px' }}>
                    Prototype only — simulated ticket
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <StatusBadge status={booking.status} />
                </div>
              </div>

              <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>PNR</div>
                  <div style={{ fontSize: '20px', fontWeight: '800', letterSpacing: '2px' }}>{booking.pnr}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>BOOKING ID</div>
                  <div style={{ fontSize: '13px', fontWeight: '700' }}>{booking.id}</div>
                </div>
              </div>
            </div>

            <div className="ticket-perforation" />

            <div className="ticket-body">
              {/* Train info */}
              <div style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px dashed #e2e8f0' }}>
                <div style={{ fontSize: '11px', color: '#718096', fontWeight: '600' }}>TRAIN</div>
                <div style={{ fontSize: '16px', fontWeight: '700', color: '#1a3a5c', marginTop: '2px' }}>
                  {booking.trainNumber} — {booking.trainName}
                </div>
              </div>

              {/* Journey */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px dashed #e2e8f0' }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#718096', fontWeight: '600' }}>FROM</div>
                  <div style={{ fontSize: '14px', fontWeight: '700', marginTop: '2px' }}>
                    {booking.originStation?.name || booking.origin}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#718096', fontWeight: '600' }}>BOOKED TO</div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#e85d04', marginTop: '2px' }}>
                    {booking.destStation?.name || booking.destination}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#718096', fontWeight: '600' }}>DATE</div>
                  <div style={{ fontSize: '14px', fontWeight: '700', marginTop: '2px' }}>{booking.journeyDate}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#718096', fontWeight: '600' }}>CLASS</div>
                  <div style={{ fontSize: '14px', fontWeight: '700', marginTop: '2px' }}>{booking.class}</div>
                </div>
              </div>

              {/* Passenger */}
              <div style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px dashed #e2e8f0' }}>
                <div style={{ fontSize: '11px', color: '#718096', fontWeight: '600' }}>PASSENGER</div>
                <div style={{ fontSize: '16px', fontWeight: '700', marginTop: '4px' }}>{booking.passenger?.name}</div>
                <div style={{ fontSize: '12px', color: '#718096' }}>
                  Age {booking.passenger?.age} · {booking.passenger?.gender === 'M' ? 'Male' : booking.passenger?.gender === 'F' ? 'Female' : 'Other'}
                </div>
              </div>

              {/* Seat — only after payment */}
              {isConfirmed && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px dashed #e2e8f0' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: '#718096', fontWeight: '600' }}>COACH</div>
                    <div style={{ fontSize: '20px', fontWeight: '800', color: '#1a3a5c', marginTop: '2px' }}>{booking.coach}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: '#718096', fontWeight: '600' }}>BERTH</div>
                    <div style={{ fontSize: '20px', fontWeight: '800', color: '#1a3a5c', marginTop: '2px' }}>{booking.berth}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: '#718096', fontWeight: '600' }}>FARE</div>
                    <div style={{ fontSize: '18px', fontWeight: '800', color: '#e85d04', marginTop: '2px' }}>₹{booking.fare?.toLocaleString()}</div>
                  </div>
                </div>
              )}

              {/* Early Deboarding Info */}
              {booking.intent && (
                <div style={{
                  background: '#fff7ed',
                  border: '2px solid #f97316',
                  borderRadius: '10px',
                  padding: '14px'
                }}>
                  <div style={{ fontWeight: '700', color: '#ea580c', marginBottom: '10px', fontSize: '13px' }}>
                    ⚡ Early Deboarding Intent
                  </div>
                  <div style={{ display: 'grid', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '12px', color: '#9a3412' }}>Declared deboarding</span>
                      <span style={{ fontWeight: '700', color: '#ea580c', fontSize: '12px' }}>
                        {booking.deboardStation?.name || booking.intent.deboardingStation}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '12px', color: '#9a3412' }}>Intent status</span>
                      <StatusBadge status={booking.intent.status} />
                    </div>
                    {booking.vacancy && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '12px', color: '#9a3412' }}>Expected vacancy</span>
                        <span style={{ fontWeight: '700', color: '#059669', fontSize: '12px' }}>
                          {booking.intent.deboardingStation} → {booking.destination}
                        </span>
                      </div>
                    )}
                  </div>
                  <div style={{ fontSize: '11px', color: '#9a3412', marginTop: '8px', lineHeight: 1.5 }}>
                    Status: Intent Registered. TTE must verify actual deboarding.
                    Not a guaranteed vacancy.
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button className="btn-primary" onClick={() => router.push('/trips')} style={{ width: '100%', padding: '14px' }}>
              View My Trips →
            </button>
            <button className="btn-outline" onClick={() => router.push('/search')} style={{ width: '100%' }}>
              Book Another Train
            </button>
            <button className="btn-ghost" onClick={() => router.push('/tte')} style={{ width: '100%' }}>
              Open TTE Dashboard
            </button>
          </div>
        </div>
      </AppShell>
    </ViewProvider>
  );
}
