'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { ViewProvider, AppShell } from '@/components/ViewToggle';

function AvailBadge({ status, count }) {
  const map = {
    CONFIRMED: { label: `CNF · ${count} left`, cls: 'badge-confirmed' },
    RAC: { label: `RAC · ${count}`, cls: 'badge-rac' },
    WL: { label: `WL #${count}`, cls: 'badge-wl' },
    NOT_AVAILABLE: { label: 'Not Available', cls: 'badge-na' }
  };
  const b = map[status] || { label: status, cls: 'badge-na' };
  return <span className={`badge ${b.cls}`}>{b.label}</span>;
}

function TrainCard({ train, params, stations, onSelect }) {
  const origin = stations.find(s => s.code === train.origin);
  const dest = stations.find(s => s.code === train.destination);
  const isConfirmed = train.availability?.status === 'CONFIRMED' && train.availability?.count > 0;

  return (
    <div className="rf-card fade-in" style={{ marginBottom: '12px', overflow: 'hidden' }}>
      {/* Train header */}
      <div style={{
        background: '#f8f9fa',
        borderBottom: '1px solid #e2e8f0',
        padding: '12px 16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <span style={{ fontWeight: '700', color: '#1a3a5c', fontSize: '13px' }}>{train.trainNumber}</span>
          <span style={{ color: '#718096', fontSize: '12px', marginLeft: '8px' }}>{train.trainName}</span>
        </div>
        <span style={{ fontSize: '11px', color: '#718096', background: '#e2e8f0', padding: '2px 8px', borderRadius: '4px' }}>
          {train.class}
        </span>
      </div>

      {/* Route + Times */}
      <div style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '22px', fontWeight: '700', color: '#1a3a5c' }}>{train.departureTime}</div>
          <div style={{ fontSize: '12px', color: '#718096', fontWeight: '600' }}>{origin?.name || train.origin}</div>
          <div style={{ fontSize: '11px', color: '#a0aec0' }}>{origin?.code}</div>
        </div>

        <div style={{ flex: 1, textAlign: 'center', padding: '0 12px' }}>
          <div style={{ fontSize: '11px', color: '#718096', marginBottom: '4px' }}>{train.duration}</div>
          <div style={{ height: '2px', background: '#e2e8f0', position: 'relative' }}>
            <div style={{
              position: 'absolute', left: '0', top: '-4px',
              width: '8px', height: '8px', borderRadius: '50%', background: '#1a3a5c'
            }} />
            <div style={{
              position: 'absolute', right: '0', top: '-4px',
              width: '8px', height: '8px', borderRadius: '50%', background: '#e85d04'
            }} />
          </div>
          <div style={{ fontSize: '10px', color: '#a0aec0', marginTop: '4px' }}>
            via {(train.via || []).slice(0, 2).join(', ')}
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '22px', fontWeight: '700', color: '#1a3a5c' }}>{train.arrivalTime}</div>
          <div style={{ fontSize: '12px', color: '#718096', fontWeight: '600' }}>{dest?.name || train.destination}</div>
          <div style={{ fontSize: '11px', color: '#a0aec0' }}>{dest?.code}</div>
        </div>
      </div>

      {/* Availability + Fare + Action */}
      <div style={{
        padding: '12px 16px',
        borderTop: '1px solid #f1f5f9',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <AvailBadge status={train.availability?.status} count={train.availability?.count} />
          <span style={{ fontSize: '16px', fontWeight: '700', color: '#1a3a5c' }}>
            ₹{train.fare?.toLocaleString()}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className="btn-ghost"
            onClick={() => onSelect(train, 'details')}
          >
            View Route
          </button>
          <button
            className={isConfirmed ? 'btn-primary' : 'btn-outline'}
            onClick={() => onSelect(train, 'book')}
          >
            {isConfirmed ? 'Book Now' : 'Book →'}
          </button>
        </div>
      </div>
    </div>
  );
}

function SmartAlternateCard({ alt, params, stations, onBook }) {
  const origin = stations.find(s => s.code === alt.origin);
  const bookedDest = stations.find(s => s.code === alt.bookedDestination);
  const requestedDest = stations.find(s => s.code === alt.requestedDestination);

  return (
    <div className="smart-alternate-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <div>
          {alt.isRecommended && (
            <span style={{
              background: '#e85d04', color: 'white', fontSize: '10px', fontWeight: '700',
              padding: '2px 8px', borderRadius: '4px', letterSpacing: '0.5px', marginRight: '8px'
            }}>RECOMMENDED</span>
          )}
          <span style={{ fontWeight: '700', color: '#e85d04', fontSize: '13px' }}>⚡ SMART ALTERNATE</span>
        </div>
        <span style={{ fontSize: '11px', color: '#718096' }}>{alt.trainNumber} · {alt.class}</span>
      </div>

      <div style={{ marginBottom: '12px' }}>
        <div style={{ fontSize: '12px', color: '#718096', marginBottom: '4px' }}>Confirmed berth available to later station:</div>
        <div style={{ fontSize: '16px', fontWeight: '700', color: '#1a3a5c' }}>
          {origin?.name || alt.origin} → {bookedDest?.name || alt.bookedDestination}
        </div>
        <div style={{ fontSize: '12px', color: '#059669', marginTop: '4px' }}>
          ✓ CONFIRMED · ₹{alt.fare?.toLocaleString()}
        </div>
      </div>

      {/* Intent explanation */}
      <div style={{
        background: 'rgba(26,58,92,0.06)',
        borderRadius: '8px',
        padding: '10px 12px',
        marginBottom: '12px',
        fontSize: '12px',
        color: '#4a5568',
        lineHeight: 1.5
      }}>
        <strong>{requestedDest?.name || alt.requestedDestination}</strong> is an intermediate station on this route.
        You can declare your actual deboarding there — RailFlow will create a predicted vacancy for{' '}
        <strong>{requestedDest?.name || alt.requestedDestination} → {bookedDest?.name || alt.bookedDestination}</strong>.
      </div>

      {/* Journey visualization */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0', marginBottom: '14px' }}>
        <div style={{ fontSize: '11px', fontWeight: '600', color: '#1a3a5c', minWidth: '80px' }}>
          {origin?.name?.split(' ')[0] || alt.origin}
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0' }}>
          <div style={{ height: '4px', flex: 1, background: '#1a3a5c', borderRadius: '2px 0 0 2px' }} />
          <div style={{ padding: '2px 6px', background: '#059669', color: 'white', fontSize: '10px', fontWeight: '700', borderRadius: '3px' }}>
            {requestedDest?.name?.split(' ')[0] || alt.requestedDestination}
          </div>
          <div style={{ height: '4px', flex: 0.5, background: '#e85d04', borderRadius: '0 2px 2px 0' }} />
        </div>
        <div style={{ fontSize: '11px', fontWeight: '600', color: '#e85d04', minWidth: '60px', textAlign: 'right' }}>
          {bookedDest?.name?.split(' ')[0] || alt.bookedDestination}
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#718096', marginBottom: '12px' }}>
        <span>Your journey</span>
        <span style={{ color: '#e85d04' }}>Expected vacancy</span>
      </div>

      <button className="btn-accent" style={{ width: '100%' }} onClick={() => onBook(alt)}>
        Book This Alternate — Declare Early Deboarding
      </button>
    </div>
  );
}

function ResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [results, setResults] = useState(null);
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const from = searchParams.get('from');
  const to = searchParams.get('to');
  const date = searchParams.get('date');
  const cls = searchParams.get('class');
  const passengers = searchParams.get('passengers') || 1;

  useEffect(() => {
    async function load() {
      try {
        const [stRes, srRes] = await Promise.all([
          fetch('/api/stations'),
          fetch('/api/trains/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ from, to, date, class: cls, passengers })
          })
        ]);
        const stData = await stRes.json();
        const srData = await srRes.json();
        if (stData.success) setStations(stData.data);
        if (srData.success) setResults(srData.data);
        else setError(srData.error || 'Search failed');
      } catch (e) {
        setError('Failed to load results. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    if (from && to && date && cls) load();
    else { setError('Missing search parameters'); setLoading(false); }
  }, [from, to, date, cls, passengers]);

  function handleSelect(train, action) {
    const p = new URLSearchParams({
      origin: train.origin,
      destination: train.destination,
      class: train.class,
      date: train.date,
      from, to
    });
    if (action === 'details') {
      router.push(`/train/${train.trainId}?${p}`);
    } else {
      router.push(`/booking/${train.trainId}?${p}&fare=${train.fare}`);
    }
  }

  function handleBookAlternate(alt) {
    const p = new URLSearchParams({
      origin: alt.origin,
      destination: alt.bookedDestination,
      requestedDest: alt.requestedDestination,
      class: alt.class,
      date: alt.date,
      fare: alt.fare,
      from, to,
      isAlternate: 'true'
    });
    router.push(`/booking/${alt.trainId}?${p}`);
  }

  const fromStation = stations.find(s => s.code === from);
  const toStation = stations.find(s => s.code === to);

  const confirmedTrains = results?.trains?.filter(t => t.availability?.status === 'CONFIRMED' && t.availability?.count > 0) || [];
  const otherTrains = results?.trains?.filter(t => t.availability?.status !== 'CONFIRMED' || t.availability?.count === 0) || [];
  const hasNoConfirmed = confirmedTrains.length === 0;

  return (
    <ViewProvider>
      <AppShell>
        <Header title="Train Results" />

        {/* Search summary */}
        <div style={{ background: '#1a3a5c', padding: '12px 20px', color: 'white' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <span style={{ fontSize: '16px', fontWeight: '700' }}>
                {fromStation?.name || from} → {toStation?.name || to}
              </span>
              <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', marginLeft: '12px' }}>
                {date} · {cls} · {passengers} pax
              </span>
            </div>
            <button className="btn-ghost" style={{ fontSize: '12px', color: 'white', borderColor: 'rgba(255,255,255,0.3)' }} onClick={() => router.push('/search')}>
              Modify Search
            </button>
          </div>
        </div>

        <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
          {loading && (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div className="spinner" style={{ width: '32px', height: '32px', margin: '0 auto 16px' }} />
              <div style={{ color: '#718096' }}>Searching trains...</div>
            </div>
          )}

          {error && !loading && (
            <div className="error-state">
              <div className="error-icon">⚠️</div>
              <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>{error}</div>
              <button className="btn-outline" onClick={() => router.push('/search')}>Back to Search</button>
            </div>
          )}

          {!loading && !error && results && (
            <>
              {/* Results count */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ fontSize: '14px', color: '#718096' }}>
                  {results.totalResults} train{results.totalResults !== 1 ? 's' : ''} found
                </div>
              </div>

              {/* NO CONFIRMED banner */}
              {hasNoConfirmed && results.totalResults > 0 && (
                <div style={{
                  background: '#fff7ed',
                  border: '1.5px solid #f97316',
                  borderRadius: '10px',
                  padding: '14px 16px',
                  marginBottom: '16px',
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'flex-start'
                }}>
                  <span style={{ fontSize: '20px' }}>⚠️</span>
                  <div>
                    <div style={{ fontWeight: '700', color: '#c2410c', marginBottom: '4px' }}>
                      No Confirmed Berth Available
                    </div>
                    <div style={{ fontSize: '13px', color: '#9a3412' }}>
                      No confirmed berths are currently available for {fromStation?.name || from} → {toStation?.name || to} in {cls} class.
                      {results.smartAlternates?.length > 0 ? ' See Smart Alternates below.' : ' No Smart Alternates found either.'}
                    </div>
                  </div>
                </div>
              )}

              {/* Smart Alternates — shown prominently when no confirmed */}
              {results.smartAlternates?.length > 0 && (
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#718096', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>
                    ⚡ Smart Alternates — Confirmed on Same Train
                  </div>
                  {results.smartAlternates.map((alt, idx) => (
                    <SmartAlternateCard
                      key={idx}
                      alt={alt}
                      params={searchParams}
                      stations={stations}
                      onBook={handleBookAlternate}
                    />
                  ))}
                </div>
              )}

              {/* Confirmed trains */}
              {confirmedTrains.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: '#718096', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>
                    ✓ Confirmed Availability
                  </div>
                  {confirmedTrains.map((t, i) => (
                    <TrainCard key={i} train={t} params={searchParams} stations={stations} onSelect={handleSelect} />
                  ))}
                </div>
              )}

              {/* RAC / WL trains */}
              {otherTrains.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: '#718096', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>
                    RAC / Waitlist / Unavailable
                  </div>
                  {otherTrains.map((t, i) => (
                    <TrainCard key={i} train={t} params={searchParams} stations={stations} onSelect={handleSelect} />
                  ))}
                </div>
              )}

              {results.totalResults === 0 && (
                <div className="empty-state">
                  <div style={{ fontSize: '48px', marginBottom: '12px' }}>🚂</div>
                  <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>No trains found</div>
                  <div style={{ fontSize: '13px', color: '#a0aec0', marginBottom: '20px' }}>
                    No trains connect {from} to {to} for the selected class.
                  </div>
                  <button className="btn-outline" onClick={() => router.push('/search')}>Try Another Search</button>
                </div>
              )}
            </>
          )}
        </div>
      </AppShell>
    </ViewProvider>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>}>
      <ResultsContent />
    </Suspense>
  );
}
