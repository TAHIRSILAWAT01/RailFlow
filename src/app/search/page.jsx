'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { ViewProvider, AppShell } from '@/components/ViewToggle';

const CLASSES = [
  { code: 'SL', name: 'Sleeper (SL)' },
  { code: '3E', name: 'Third AC Economy (3E)' },
  { code: '3A', name: 'Third AC (3A)' },
  { code: '2A', name: 'Second AC (2A)' },
  { code: '1A', name: 'First AC (1A)' }
];

function StationSelect({ value, onChange, stations, placeholder, label }) {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (value && stations.length) {
      const st = stations.find(s => s.code === value);
      if (st) {
        setSelected(st);
        setSearch(st.name);
      }
    }
  }, [value, stations]);

  const filtered = stations.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.code.toLowerCase().includes(search.toLowerCase()) ||
    s.city.toLowerCase().includes(search.toLowerCase())
  ).slice(0, 8);

  return (
    <div style={{ position: 'relative' }}>
      <label className="rf-label">{label}</label>
      <div style={{ position: 'relative' }}>
        <input
          className="rf-input"
          value={search}
          placeholder={placeholder}
          onChange={e => {
            setSearch(e.target.value);
            setOpen(true);
            if (!e.target.value) {
              setSelected(null);
              onChange('');
            }
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 200)}
          autoComplete="off"
        />
        {selected && (
          <span style={{
            position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
            fontSize: '11px', color: '#718096', fontWeight: '600', background: '#f1f5f9',
            padding: '2px 6px', borderRadius: '4px'
          }}>
            {selected.code}
          </span>
        )}
      </div>

      {open && filtered.length > 0 && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 200,
          background: 'white', border: '1.5px solid #e2e8f0', borderRadius: '8px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)', marginTop: '4px',
          maxHeight: '240px', overflowY: 'auto'
        }}>
          {filtered.map(s => (
            <div
              key={s.code}
              onClick={() => {
                setSelected(s);
                setSearch(s.name);
                onChange(s.code);
                setOpen(false);
              }}
              style={{
                padding: '10px 14px',
                cursor: 'pointer',
                borderBottom: '1px solid #f1f5f9',
                transition: 'background 0.15s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#f8f9fa'}
              onMouseLeave={e => e.currentTarget.style.background = 'white'}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#1a202c' }}>{s.name}</div>
                  <div style={{ fontSize: '11px', color: '#718096' }}>{s.city}, {s.state}</div>
                </div>
                <span style={{
                  fontSize: '11px', fontWeight: '700', color: '#1a3a5c',
                  background: '#eff6ff', padding: '2px 8px', borderRadius: '4px'
                }}>{s.code}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function QuickFill({ label, from, to, cls, onFill }) {
  return (
    <button
      onClick={onFill}
      style={{
        background: 'white', border: '1.5px solid #e2e8f0', borderRadius: '8px',
        padding: '8px 12px', cursor: 'pointer', textAlign: 'left',
        fontSize: '12px', color: '#1a3a5c', width: '100%',
        transition: 'border-color 0.2s, background 0.2s'
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = '#1a3a5c'; e.currentTarget.style.background = '#eff6ff'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = 'white'; }}
    >
      <div style={{ fontWeight: '700' }}>{label}</div>
      <div style={{ color: '#718096', marginTop: '2px' }}>{from} → {to} · {cls}</div>
    </button>
  );
}

export default function SearchPage() {
  const router = useRouter();
  const [stations, setStations] = useState([]);
  const [form, setForm] = useState({
    from: '',
    to: '',
    date: '',
    class: '3A',
    passengers: 1
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Set default date to day after tomorrow
  useEffect(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    setForm(f => ({ ...f, date: d.toISOString().split('T')[0] }));
    fetchStations();
  }, []);

  async function fetchStations() {
    try {
      const res = await fetch('/api/stations');
      const data = await res.json();
      if (data.success) setStations(data.data);
    } catch (e) {
      console.error('Failed to fetch stations', e);
    }
  }

  function validate() {
    const errs = {};
    if (!form.from) errs.from = 'Select origin';
    if (!form.to) errs.to = 'Select destination';
    if (form.from && form.to && form.from === form.to) errs.to = 'Origin and destination cannot be the same';
    if (!form.date) errs.date = 'Select journey date';
    if (!form.class) errs.class = 'Select class';
    return errs;
  }

  async function handleSearch(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setLoading(true);
    const params = new URLSearchParams({
      from: form.from,
      to: form.to,
      date: form.date,
      class: form.class,
      passengers: form.passengers
    });
    router.push(`/results?${params.toString()}`);
  }

  function quickFill(from, to, cls) {
    setForm(f => ({ ...f, from, to, class: cls }));
    setErrors({});
  }

  const today = new Date().toISOString().split('T')[0];

  return (
    <ViewProvider>
      <AppShell>
        <Header title="Search Trains" showBack={false} />

        <div style={{ padding: '24px 20px', maxWidth: '800px', margin: '0 auto' }}>
          {/* Hero */}
          <div style={{ marginBottom: '24px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#1a3a5c', lineHeight: 1.2, marginBottom: '4px' }}>
              Find Your Train
            </h1>
            <p style={{ color: '#718096', fontSize: '14px' }}>
              Declare your actual travel intent and help create predictive vacancies for railway operations.
            </p>
          </div>

          {/* Search Form */}
          <div className="rf-card" style={{ padding: '24px', marginBottom: '20px' }}>
            <form onSubmit={handleSearch}>
              <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: '1fr 1fr' }}>
                <div style={{ gridColumn: '1/2' }}>
                  <StationSelect
                    label="FROM"
                    value={form.from}
                    onChange={v => { setForm(f => ({ ...f, from: v })); setErrors(e => ({ ...e, from: '' })); }}
                    stations={stations}
                    placeholder="Origin station"
                  />
                  {errors.from && <div style={{ color: '#c1121f', fontSize: '12px', marginTop: '4px' }}>{errors.from}</div>}
                </div>

                <div>
                  <StationSelect
                    label="TO"
                    value={form.to}
                    onChange={v => { setForm(f => ({ ...f, to: v })); setErrors(e => ({ ...e, to: '' })); }}
                    stations={stations}
                    placeholder="Destination station"
                  />
                  {errors.to && <div style={{ color: '#c1121f', fontSize: '12px', marginTop: '4px' }}>{errors.to}</div>}
                </div>

                <div>
                  <label className="rf-label">JOURNEY DATE</label>
                  <input
                    type="date"
                    className="rf-input"
                    value={form.date}
                    min={today}
                    onChange={e => { setForm(f => ({ ...f, date: e.target.value })); setErrors(e2 => ({ ...e2, date: '' })); }}
                  />
                  {errors.date && <div style={{ color: '#c1121f', fontSize: '12px', marginTop: '4px' }}>{errors.date}</div>}
                </div>

                <div>
                  <label className="rf-label">CLASS</label>
                  <select
                    className="rf-select"
                    value={form.class}
                    onChange={e => setForm(f => ({ ...f, class: e.target.value }))}
                  >
                    {CLASSES.map(c => (
                      <option key={c.code} value={c.code}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ marginTop: '20px' }}>
                <button type="submit" className="btn-primary" style={{ width: '100%', padding: '14px' }} disabled={loading}>
                  {loading ? (
                    <><div className="spinner" style={{ borderTopColor: 'white' }} /> Searching...</>
                  ) : (
                    '🔍 Search Trains'
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Quick Demo Searches */}
          <div style={{ marginBottom: '16px' }}>
            <p style={{ fontSize: '12px', fontWeight: '600', color: '#718096', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>
              Quick Demo Searches
            </p>
            <div style={{ display: 'grid', gap: '8px', gridTemplateColumns: '1fr 1fr' }}>
              <QuickFill
                label="Main Demo 🌟"
                from="KSR Bengaluru City"
                to="Mumbai Central"
                cls="3A"
                onFill={() => quickFill('SBC', 'MMCT', '3A')}
              />
              <QuickFill
                label="Scenario A"
                from="Pune"
                to="Ahmedabad"
                cls="3A"
                onFill={() => quickFill('PUNE', 'ADI', '3A')}
              />
              <QuickFill
                label="Scenario B"
                from="Thane"
                to="Surat"
                cls="3A"
                onFill={() => quickFill('TNA', 'ST', '3A')}
              />
              <QuickFill
                label="Kerala Route"
                from="Chennai"
                to="Thiruvananthapuram"
                cls="3A"
                onFill={() => quickFill('MAS', 'TVC', '3A')}
              />
              <QuickFill
                label="Hyderabad → Mumbai"
                from="Hyderabad"
                to="Mumbai"
                cls="3A"
                onFill={() => quickFill('HYB', 'MMCT', '3A')}
              />
              <QuickFill
                label="Chennai → Delhi"
                from="Chennai"
                to="New Delhi"
                cls="3A"
                onFill={() => quickFill('MAS', 'NDLS', '3A')}
              />
            </div>
          </div>

          {/* Feature highlight */}
          <div style={{
            background: 'linear-gradient(135deg, #1a3a5c 0%, #2d4a6c 100%)',
            borderRadius: '12px',
            padding: '20px',
            color: 'white'
          }}>
            <div style={{ fontSize: '16px', fontWeight: '700', marginBottom: '8px' }}>
              ✨ Smart Alternate Technology
            </div>
            <p style={{ fontSize: '13px', lineHeight: 1.6, color: 'rgba(255,255,255,0.8)' }}>
              When your destination has no confirmed berth, RailFlow finds confirmed berths to later stations on the same train.
              Declare your actual intent — help predict seat vacancies before they happen.
            </p>
          </div>
        </div>
      </AppShell>
    </ViewProvider>
  );
}
