'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { ViewProvider, AppShell } from '@/components/ViewToggle';

function StatCard({ label, value, color = '#1a3a5c', bg = '#eff6ff', icon }) {
  return (
    <div style={{ background: bg, borderRadius: '10px', padding: '16px', border: `1px solid ${color}20` }}>
      <div style={{ fontSize: '24px', marginBottom: '4px' }}>{icon}</div>
      <div style={{ fontSize: '28px', fontWeight: '800', color }}>{value}</div>
      <div style={{ fontSize: '12px', color: '#718096', fontWeight: '600', marginTop: '2px' }}>{label}</div>
    </div>
  );
}

function StatusPill({ status }) {
  const map = {
    EXPECTED: { bg: '#fef3c7', color: '#92400e' },
    CONFIRMED_INTENT: { bg: '#dbeafe', color: '#1e40af' },
    DEBOARDING_DUE: { bg: '#fff7ed', color: '#c2410c' },
    VERIFIED_VACANCY: { bg: '#d1fae5', color: '#065f46' },
    ALLOCATION_RECOMMENDED: { bg: '#d1fae5', color: '#065f46' },
    CANCELLED: { bg: '#f1f5f9', color: '#64748b' },
    REJECTED: { bg: '#fee2e2', color: '#991b1b' }
  };
  const style = map[status] || { bg: '#f1f5f9', color: '#64748b' };
  return (
    <span style={{
      background: style.bg, color: style.color,
      padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '700',
      whiteSpace: 'nowrap'
    }}>
      {status?.replace('_', ' ')}
    </span>
  );
}

export default function OperationsPage() {
  const router = useRouter();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resetLoading, setResetLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  async function load() {
    try {
      const res = await fetch('/api/operations/dashboard');
      const data = await res.json();
      if (data.success) setDashboard(data.data);
    } catch { }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function handleReset() {
    setResetLoading(true);
    try {
      const res = await fetch('/api/demo/reset', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg('Demo data reset successfully.');
        setTimeout(() => setSuccessMsg(''), 3000);
        await load();
      }
    } catch { } finally { setResetLoading(false); }
  }

  const { summary, rows = [], allocations = [] } = dashboard || {};

  return (
    <ViewProvider>
      <AppShell>
        <Header title="Operations Dashboard" />

        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#1a3a5c', marginBottom: '4px' }}>
                Operations Dashboard
              </h1>
              <p style={{ fontSize: '13px', color: '#718096' }}>
                Real-time view of predicted and verified vacancies. Prototype only — simulated data.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn-ghost" onClick={load}>🔃 Refresh</button>
              <button
                style={{
                  background: '#fef2f2', border: '1.5px solid #fca5a5', color: '#c1121f',
                  padding: '8px 16px', borderRadius: '8px', fontWeight: '600', fontSize: '13px',
                  cursor: 'pointer'
                }}
                onClick={handleReset}
                disabled={resetLoading}
              >
                {resetLoading ? 'Resetting...' : '🔄 Reset Demo'}
              </button>
            </div>
          </div>

          {successMsg && (
            <div style={{ background: '#d1fae5', border: '1px solid #6ee7b7', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', color: '#065f46', fontSize: '13px' }}>
              {successMsg}
            </div>
          )}

          {loading && (
            <div style={{ textAlign: 'center', padding: '60px' }}>
              <div className="spinner" style={{ width: '32px', height: '32px', margin: '0 auto 16px' }} />
              <div style={{ color: '#718096' }}>Loading dashboard...</div>
            </div>
          )}

          {!loading && summary && (
            <>
              {/* Summary stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '24px' }}>
                <StatCard label="Total Vacancies" value={summary.total} icon="📊" />
                <StatCard label="Expected" value={summary.expected} icon="🔮" bg="#fef9c3" color="#92400e" />
                <StatCard label="Confirmed Intent" value={summary.confirmedIntent} icon="📋" bg="#dbeafe" color="#1e40af" />
                <StatCard label="Deboarding Due" value={summary.deboardingDue} icon="⏰" bg="#fff7ed" color="#c2410c" />
                <StatCard label="Verified Vacant" value={summary.verified} icon="✅" bg="#d1fae5" color="#065f46" />
                <StatCard label="Recommended" value={summary.recommended} icon="🎯" bg="#f0fdf4" color="#15803d" />
              </div>

              {/* Vacancy table */}
              <div className="rf-card" style={{ marginBottom: '20px' }}>
                <div style={{ padding: '14px 16px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontWeight: '700', fontSize: '14px', color: '#1a3a5c' }}>
                    Vacancy Intelligence ({rows.length} records)
                  </div>
                </div>

                {rows.length === 0 ? (
                  <div className="empty-state">
                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>📭</div>
                    <div>No vacancies yet. Complete a demo booking with early deboarding.</div>
                    <button className="btn-primary" style={{ marginTop: '12px' }} onClick={() => router.push('/search')}>Go to Search</button>
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                      <thead>
                        <tr style={{ background: '#f8f9fa' }}>
                          {['Train', 'Coach/Berth', 'Passenger', 'Booked Journey', 'Declared Deboarding', 'Predicted Vacancy', 'Confidence', 'Status', 'TTE Verification', 'Recommendation'].map(h => (
                            <th key={h} style={{ padding: '10px 12px', textAlign: 'left', color: '#718096', fontWeight: '700', fontSize: '11px', whiteSpace: 'nowrap', borderBottom: '1px solid #e2e8f0' }}>
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((row, i) => (
                          <tr key={row.vacancyId} style={{ borderBottom: '1px solid #f1f5f9', background: i % 2 === 0 ? 'white' : '#fafafa' }}>
                            <td style={{ padding: '10px 12px', fontWeight: '600', color: '#1a3a5c', whiteSpace: 'nowrap' }}>
                              {row.trainNumber}<br />
                              <span style={{ fontSize: '10px', color: '#a0aec0', fontWeight: '400' }}>{row.trainName?.split(' ').slice(0, 3).join(' ')}</span>
                            </td>
                            <td style={{ padding: '10px 12px', fontWeight: '700', whiteSpace: 'nowrap' }}>
                              {row.coach}-{row.berth}
                              <br /><span style={{ fontSize: '10px', color: '#718096' }}>{row.class}</span>
                            </td>
                            <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                              {row.passenger}<br />
                              <span style={{ fontSize: '10px', color: '#a0aec0' }}>{row.pnr}</span>
                            </td>
                            <td style={{ padding: '10px 12px', fontSize: '11px', whiteSpace: 'nowrap' }}>
                              {row.bookedJourneyNames || row.bookedJourney}
                            </td>
                            <td style={{ padding: '10px 12px', fontWeight: '600', color: '#059669', whiteSpace: 'nowrap' }}>
                              {row.declaredDeboardingName || row.declaredDeboarding}
                            </td>
                            <td style={{ padding: '10px 12px', fontSize: '11px', whiteSpace: 'nowrap' }}>
                              {row.predictedVacancy}
                            </td>
                            <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <div style={{ width: '40px', height: '4px', borderRadius: '2px', background: '#e2e8f0', overflow: 'hidden' }}>
                                  <div style={{ height: '100%', background: row.confidence >= 90 ? '#059669' : row.confidence >= 75 ? '#f97316' : '#94a3b8', width: `${row.confidence}%` }} />
                                </div>
                                <span style={{ fontSize: '11px', fontWeight: '700' }}>{row.confidence}%</span>
                              </div>
                            </td>
                            <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                              <StatusPill status={row.status} />
                            </td>
                            <td style={{ padding: '10px 12px', fontSize: '11px', color: '#718096', whiteSpace: 'nowrap' }}>
                              {row.tteVerification || 'PENDING'}
                            </td>
                            <td style={{ padding: '10px 12px', fontSize: '11px', fontWeight: '600', color: '#059669', whiteSpace: 'nowrap' }}>
                              {row.recommendation || '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Allocations section */}
              {allocations.length > 0 && (
                <div className="rf-card">
                  <div style={{ padding: '14px 16px', borderBottom: '1px solid #e2e8f0', fontWeight: '700', fontSize: '14px', color: '#1a3a5c' }}>
                    Allocation Recommendations ({allocations.length})
                  </div>
                  <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {allocations.map(a => (
                      <div key={a.id} style={{
                        background: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: '10px', padding: '14px'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                          <div>
                            <div style={{ fontWeight: '700', color: '#15803d', fontSize: '14px', marginBottom: '4px' }}>
                              📋 Berth {a.coach}-{a.berth} · {a.fromStation} → {a.toStation} · {a.class}
                            </div>
                            <div style={{ fontSize: '13px', color: '#166534' }}>{a.reasoning}</div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <span style={{ background: '#059669', color: 'white', fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '6px' }}>
                              {a.recommendedCandidate?.type} · {a.recommendedCandidate?.pnr}
                            </span>
                          </div>
                        </div>
                        <div style={{ fontSize: '11px', color: '#718096', marginTop: '8px' }}>
                          ⚠️ {a.disclaimer}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Disclaimer */}
              <div style={{
                marginTop: '20px',
                background: '#fef9c3',
                border: '1px solid #fde68a',
                borderRadius: '8px',
                padding: '12px 14px',
                fontSize: '12px',
                color: '#92400e',
                lineHeight: 1.6
              }}>
                <strong>Prototype Disclaimer:</strong> This dashboard shows simulated vacancy intelligence.
                Actual CRIS/PRS/HHT integration would require authorization, approved interfaces/APIs,
                security review, railway operational approval, and compliance with Railway rules.
                This prototype does not connect to any live railway system.
              </div>
            </>
          )}
        </div>
      </AppShell>
    </ViewProvider>
  );
}
