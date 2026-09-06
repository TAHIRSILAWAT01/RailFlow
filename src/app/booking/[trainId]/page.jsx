'use client';

import { useEffect, useState, Suspense, use } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { ViewProvider, AppShell } from '@/components/ViewToggle';

const STEPS = ['Passenger', 'Early Deboarding', 'Review', 'Payment'];

function StepIndicator({ current }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', padding: '16px 20px', background: 'white', borderBottom: '1px solid #e2e8f0' }}>
      {STEPS.map((step, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{
              width: '24px', height: '24px', borderRadius: '50%',
              background: i < current ? '#059669' : i === current ? '#1a3a5c' : '#e2e8f0',
              color: i <= current ? 'white' : '#a0aec0',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '11px', fontWeight: '700', flexShrink: 0
            }}>
              {i < current ? '✓' : i + 1}
            </div>
            <span style={{
              fontSize: '11px',
              fontWeight: i === current ? '700' : '500',
              color: i === current ? '#1a3a5c' : i < current ? '#059669' : '#a0aec0',
              display: i !== current ? 'none' : 'block'
            }}>
              {step}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div style={{ flex: 1, height: '2px', background: i < current ? '#059669' : '#e2e8f0', margin: '0 8px' }} />
          )}
        </div>
      ))}
    </div>
  );
}

function PassengerStep({ form, onChange, errors }) {
  return (
    <div style={{ padding: '24px 20px' }}>
      <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1a3a5c', marginBottom: '20px' }}>
        Passenger Details
      </h2>

      <div style={{ display: 'grid', gap: '16px' }}>
        <div>
          <label className="rf-label">FULL NAME *</label>
          <input
            className="rf-input"
            value={form.name}
            onChange={e => onChange('name', e.target.value)}
            placeholder="As per ID card"
          />
          {errors.name && <div style={{ color: '#c1121f', fontSize: '12px', marginTop: '4px' }}>{errors.name}</div>}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label className="rf-label">AGE *</label>
            <input
              className="rf-input"
              type="number"
              value={form.age}
              onChange={e => onChange('age', e.target.value)}
              placeholder="Age"
              min="1"
              max="120"
            />
            {errors.age && <div style={{ color: '#c1121f', fontSize: '12px', marginTop: '4px' }}>{errors.age}</div>}
          </div>
          <div>
            <label className="rf-label">GENDER *</label>
            <select className="rf-select" value={form.gender} onChange={e => onChange('gender', e.target.value)}>
              <option value="">Select</option>
              <option value="M">Male</option>
              <option value="F">Female</option>
              <option value="O">Other</option>
            </select>
            {errors.gender && <div style={{ color: '#c1121f', fontSize: '12px', marginTop: '4px' }}>{errors.gender}</div>}
          </div>
        </div>

        <div>
          <label className="rf-label">MOBILE NUMBER *</label>
          <input
            className="rf-input"
            type="tel"
            value={form.mobile}
            onChange={e => onChange('mobile', e.target.value.replace(/\D/g, '').slice(0, 10))}
            placeholder="10-digit mobile"
          />
          {errors.mobile && <div style={{ color: '#c1121f', fontSize: '12px', marginTop: '4px' }}>{errors.mobile}</div>}
        </div>

        <div>
          <label className="rf-label">EMAIL (Optional)</label>
          <input
            className="rf-input"
            type="email"
            value={form.email}
            onChange={e => onChange('email', e.target.value)}
            placeholder="email@example.com"
          />
        </div>

        <div>
          <label className="rf-label">BERTH PREFERENCE</label>
          <select className="rf-select" value={form.berthPreference} onChange={e => onChange('berthPreference', e.target.value)}>
            <option value="LB">Lower Berth</option>
            <option value="MB">Middle Berth</option>
            <option value="UB">Upper Berth</option>
            <option value="SL">Side Lower</option>
            <option value="SU">Side Upper</option>
          </select>
        </div>
      </div>
    </div>
  );
}

function DeboardingStep({ trainId, origin, destination, form, onChange, stations }) {
  const [validStations, setValidStations] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      if (!trainId || !origin || !destination) return;
      setLoading(true);
      try {
        const res = await fetch(`/api/deboarding-intents?trainId=${trainId}&origin=${origin}&destination=${destination}`);
        const data = await res.json();
        if (data.success) setValidStations(data.data);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    }
    load();
  }, [trainId, origin, destination]);

  const originStation = stations.find(s => s.code === origin);
  const destStation = stations.find(s => s.code === destination);
  const selectedStation = validStations.find(s => s.code === form.deboardingStation);

  return (
    <div style={{ padding: '24px 20px' }}>
      <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1a3a5c', marginBottom: '8px' }}>
        Early Deboarding Intent
      </h2>
      <p style={{ fontSize: '13px', color: '#718096', marginBottom: '20px', lineHeight: 1.5 }}>
        <strong>This is the core RailFlow feature.</strong> If you plan to get off before your booked destination, declare it here.
        Your declaration helps railway operations create a predictive vacancy — a potential signal for earlier seat availability planning.
      </p>

      {/* Journey summary */}
      <div style={{
        background: '#f8f9fa', borderRadius: '10px', padding: '14px', marginBottom: '20px',
        display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: '8px'
      }}>
        <div>
          <div style={{ fontSize: '11px', color: '#718096', fontWeight: '600' }}>BOARDING</div>
          <div style={{ fontSize: '14px', fontWeight: '700', color: '#1a3a5c' }}>{originStation?.name || origin}</div>
        </div>
        <div style={{ fontSize: '20px', color: '#e2e8f0' }}>→</div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '11px', color: '#718096', fontWeight: '600' }}>BOOKED DESTINATION</div>
          <div style={{ fontSize: '14px', fontWeight: '700', color: '#e85d04' }}>{destStation?.name || destination}</div>
        </div>
      </div>

      {/* Option selection */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
        <label style={{
          display: 'flex', gap: '12px', alignItems: 'flex-start', cursor: 'pointer',
          padding: '14px', borderRadius: '10px',
          border: `2px solid ${form.earlyDeboarding === false ? '#1a3a5c' : '#e2e8f0'}`,
          background: form.earlyDeboarding === false ? '#eff6ff' : 'white'
        }}>
          <input
            type="radio"
            name="earlyDeboarding"
            checked={form.earlyDeboarding === false}
            onChange={() => onChange('earlyDeboarding', false)}
            style={{ marginTop: '2px' }}
          />
          <div>
            <div style={{ fontWeight: '600', color: '#1a3a5c', fontSize: '14px' }}>
              No, I will travel to my booked destination
            </div>
            <div style={{ fontSize: '12px', color: '#718096', marginTop: '2px' }}>
              Full journey: {originStation?.name || origin} → {destStation?.name || destination}
            </div>
          </div>
        </label>

        <label style={{
          display: 'flex', gap: '12px', alignItems: 'flex-start', cursor: 'pointer',
          padding: '14px', borderRadius: '10px',
          border: `2px solid ${form.earlyDeboarding === true ? '#e85d04' : '#e2e8f0'}`,
          background: form.earlyDeboarding === true ? '#fff7ed' : 'white'
        }}>
          <input
            type="radio"
            name="earlyDeboarding"
            checked={form.earlyDeboarding === true}
            onChange={() => onChange('earlyDeboarding', true)}
            style={{ marginTop: '2px' }}
          />
          <div>
            <div style={{ fontWeight: '600', color: '#e85d04', fontSize: '14px' }}>
              Yes, I plan to get off earlier
            </div>
            <div style={{ fontSize: '12px', color: '#718096', marginTop: '2px' }}>
              Declare your actual intended deboarding station
            </div>
          </div>
        </label>
      </div>

      {/* Station selector */}
      {form.earlyDeboarding === true && (
        <div className="fade-in">
          <label className="rf-label">WHERE WILL YOU ACTUALLY GET OFF?</label>
          {loading ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#718096' }}>
              <div className="spinner" style={{ margin: '0 auto 8px' }} />
              Loading stations...
            </div>
          ) : validStations.length === 0 ? (
            <div style={{ padding: '16px', background: '#fff7ed', borderRadius: '8px', color: '#9a3412', fontSize: '13px' }}>
              No intermediate stations available. The destination must have at least one station between origin and booked destination.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {validStations.map(st => (
                <label key={st.code} style={{
                  display: 'flex', gap: '10px', alignItems: 'center', cursor: 'pointer',
                  padding: '12px 14px', borderRadius: '8px',
                  border: `1.5px solid ${form.deboardingStation === st.code ? '#059669' : '#e2e8f0'}`,
                  background: form.deboardingStation === st.code ? '#f0fdf4' : 'white'
                }}>
                  <input
                    type="radio"
                    name="deboardingStation"
                    value={st.code}
                    checked={form.deboardingStation === st.code}
                    onChange={() => onChange('deboardingStation', st.code)}
                  />
                  <div style={{ flex: 1 }}>
                    <span style={{ fontWeight: '600', fontSize: '14px', color: '#1a202c' }}>{st.name}</span>
                    <span style={{ marginLeft: '8px', fontSize: '11px', color: '#718096' }}>{st.code}</span>
                  </div>
                  {form.deboardingStation === st.code && (
                    <span style={{ color: '#059669', fontSize: '16px' }}>✓</span>
                  )}
                </label>
              ))}
            </div>
          )}

          {/* Intent preview */}
          {form.deboardingStation && selectedStation && (
            <div style={{
              marginTop: '16px',
              background: '#eff6ff',
              border: '1.5px solid #93c5fd',
              borderRadius: '10px',
              padding: '14px'
            }}>
              <div style={{ fontWeight: '700', color: '#1e40af', marginBottom: '10px', fontSize: '13px' }}>
                📋 INTENT PREVIEW
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                <div style={{ background: 'white', padding: '10px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '11px', color: '#718096', fontWeight: '600' }}>BOOKED DESTINATION</div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#e85d04', marginTop: '4px' }}>{destStation?.name}</div>
                </div>
                <div style={{ background: 'white', padding: '10px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '11px', color: '#718096', fontWeight: '600' }}>INTENDED DEBOARDING</div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#059669', marginTop: '4px' }}>{selectedStation.name}</div>
                </div>
              </div>
              <div style={{
                background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '8px', padding: '10px',
                fontSize: '13px', color: '#15803d', fontWeight: '600'
              }}>
                Expected Vacancy: {selectedStation.name} → {destStation?.name}
              </div>
              <div style={{ fontSize: '12px', color: '#4b5563', marginTop: '8px', lineHeight: 1.5 }}>
                ℹ️ This is your travel intention, not a confirmed vacancy. The TTE must verify your actual deboarding.
                Your declaration helps Railway operations identify a potential future vacancy earlier.
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ReviewStep({ bookingData, passenger, earlyDeboarding, deboardingStation, stations, fare, cls, trainId, origin, destination, date }) {
  const originSt = stations.find(s => s.code === origin);
  const destSt = stations.find(s => s.code === destination);
  const deboardSt = stations.find(s => s.code === deboardingStation);

  return (
    <div style={{ padding: '24px 20px' }}>
      <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1a3a5c', marginBottom: '20px' }}>Review Booking</h2>

      <div className="rf-card" style={{ marginBottom: '16px' }}>
        <div style={{ padding: '14px 16px', borderBottom: '1px solid #f1f5f9', fontWeight: '700', fontSize: '13px', color: '#1a3a5c' }}>
          Journey Details
        </div>
        <div style={{ padding: '16px', display: 'grid', gap: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#718096', fontSize: '13px' }}>Train</span>
            <span style={{ fontWeight: '600', fontSize: '13px' }}>{trainId}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#718096', fontSize: '13px' }}>From</span>
            <span style={{ fontWeight: '600', fontSize: '13px' }}>{originSt?.name || origin}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#718096', fontSize: '13px' }}>Booked To</span>
            <span style={{ fontWeight: '600', fontSize: '13px' }}>{destSt?.name || destination}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#718096', fontSize: '13px' }}>Date</span>
            <span style={{ fontWeight: '600', fontSize: '13px' }}>{date}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#718096', fontSize: '13px' }}>Class</span>
            <span style={{ fontWeight: '600', fontSize: '13px' }}>{cls}</span>
          </div>
        </div>
      </div>

      <div className="rf-card" style={{ marginBottom: '16px' }}>
        <div style={{ padding: '14px 16px', borderBottom: '1px solid #f1f5f9', fontWeight: '700', fontSize: '13px', color: '#1a3a5c' }}>
          Passenger
        </div>
        <div style={{ padding: '16px', display: 'grid', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#718096', fontSize: '13px' }}>Name</span>
            <span style={{ fontWeight: '600', fontSize: '13px' }}>{passenger.name}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#718096', fontSize: '13px' }}>Age / Gender</span>
            <span style={{ fontWeight: '600', fontSize: '13px' }}>{passenger.age} / {passenger.gender}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#718096', fontSize: '13px' }}>Mobile</span>
            <span style={{ fontWeight: '600', fontSize: '13px' }}>{passenger.mobile}</span>
          </div>
        </div>
      </div>

      {earlyDeboarding && deboardingStation && (
        <div style={{
          background: '#fff7ed',
          border: '2px solid #f97316',
          borderRadius: '10px',
          padding: '16px',
          marginBottom: '16px'
        }}>
          <div style={{ fontWeight: '700', color: '#ea580c', marginBottom: '10px', fontSize: '14px' }}>
            ⚡ Early Deboarding Intent
          </div>
          <div style={{ display: 'grid', gap: '8px', marginBottom: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#9a3412', fontSize: '13px' }}>Declared deboarding</span>
              <span style={{ fontWeight: '700', color: '#ea580c', fontSize: '13px' }}>{deboardSt?.name || deboardingStation}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#9a3412', fontSize: '13px' }}>Expected vacancy</span>
              <span style={{ fontWeight: '700', color: '#059669', fontSize: '13px' }}>
                {deboardSt?.name || deboardingStation} → {destSt?.name || destination}
              </span>
            </div>
          </div>
          <div style={{ fontSize: '12px', color: '#9a3412', lineHeight: 1.5 }}>
            ⚠️ Intent will be created <strong>before payment</strong>. TTE must verify actual deboarding.
            This is not a guaranteed vacancy.
          </div>
        </div>
      )}

      <div style={{ borderTop: '2px dashed #e2e8f0', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontWeight: '700', fontSize: '16px', color: '#1a202c' }}>Total Fare</span>
        <span style={{ fontWeight: '800', fontSize: '24px', color: '#1a3a5c' }}>₹{parseInt(fare || 0).toLocaleString()}</span>
      </div>
      <div style={{ fontSize: '11px', color: '#718096', marginTop: '4px' }}>
        Demo booking — Railway ticket issuance is simulated.
      </div>
    </div>
  );
}

function PaymentStep({ amount, onSuccess, onFailure, loading }) {
  const [method, setMethod] = useState('UPI');
  const [upiId, setUpiId] = useState('demo@upi');
  const [cardNum, setCardNum] = useState('4111 1111 1111 1111');
  const [cardName, setCardName] = useState('');
  const [expiry, setExpiry] = useState('12/26');
  const [cvv, setCvv] = useState('');
  const [bank, setBank] = useState('SBI');
  const [wallet, setWallet] = useState('Paytm');

  const BANKS = ['SBI', 'HDFC', 'ICICI', 'Axis', 'Kotak', 'PNB'];
  const WALLETS = ['Paytm', 'PhonePe', 'Google Pay', 'Amazon Pay'];

  function handlePay() {
    const details = method === 'UPI' ? { upiId }
      : method === 'CARD' ? { cardNumber: cardNum, cardName, expiry }
      : method === 'NET_BANKING' ? { bank }
      : { wallet };
    onSuccess(method, details);
  }

  return (
    <div style={{ padding: '24px 20px' }}>
      <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1a3a5c', marginBottom: '4px' }}>Payment</h2>
      <div style={{ fontSize: '12px', color: '#718096', marginBottom: '20px' }}>
        Demo payment — no real money is charged.
      </div>

      <div style={{
        background: '#eff6ff', borderRadius: '10px', padding: '14px',
        marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <span style={{ color: '#1e40af', fontWeight: '600' }}>Amount to Pay</span>
        <span style={{ fontSize: '22px', fontWeight: '800', color: '#1a3a5c' }}>₹{parseInt(amount).toLocaleString()}</span>
      </div>

      {/* Method selection */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '20px' }}>
        {['UPI', 'CARD', 'NET_BANKING', 'WALLET'].map(m => (
          <button
            key={m}
            onClick={() => setMethod(m)}
            style={{
              padding: '12px', borderRadius: '8px', border: `2px solid ${method === m ? '#1a3a5c' : '#e2e8f0'}`,
              background: method === m ? '#eff6ff' : 'white',
              cursor: 'pointer', fontWeight: '600', fontSize: '13px',
              color: method === m ? '#1a3a5c' : '#718096'
            }}
          >
            {m === 'UPI' ? '📱 UPI' : m === 'CARD' ? '💳 Card' : m === 'NET_BANKING' ? '🏦 Net Banking' : '👛 Wallet'}
          </button>
        ))}
      </div>

      {/* Method-specific fields */}
      {method === 'UPI' && (
        <div>
          <label className="rf-label">UPI ID</label>
          <input className="rf-input" value={upiId} onChange={e => setUpiId(e.target.value)} placeholder="yourname@upi" />
          <div style={{ fontSize: '11px', color: '#718096', marginTop: '4px' }}>Use "fail@upi" to simulate payment failure</div>
        </div>
      )}

      {method === 'CARD' && (
        <div style={{ display: 'grid', gap: '12px' }}>
          <div>
            <label className="rf-label">CARD NUMBER</label>
            <input className="rf-input" value={cardNum} onChange={e => setCardNum(e.target.value)} placeholder="1234 5678 9012 3456" />
            <div style={{ fontSize: '11px', color: '#718096', marginTop: '4px' }}>Use "0000 0000 0000 0000" for failure</div>
          </div>
          <div>
            <label className="rf-label">NAME ON CARD</label>
            <input className="rf-input" value={cardName} onChange={e => setCardName(e.target.value)} placeholder="Full name" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label className="rf-label">EXPIRY</label>
              <input className="rf-input" value={expiry} onChange={e => setExpiry(e.target.value)} placeholder="MM/YY" />
            </div>
            <div>
              <label className="rf-label">CVV</label>
              <input className="rf-input" type="password" value={cvv} onChange={e => setCvv(e.target.value)} placeholder="***" maxLength="4" />
            </div>
          </div>
        </div>
      )}

      {method === 'NET_BANKING' && (
        <div>
          <label className="rf-label">SELECT BANK</label>
          <select className="rf-select" value={bank} onChange={e => setBank(e.target.value)}>
            {BANKS.map(b => <option key={b} value={b}>{b} Bank</option>)}
          </select>
        </div>
      )}

      {method === 'WALLET' && (
        <div>
          <label className="rf-label">SELECT WALLET</label>
          <select className="rf-select" value={wallet} onChange={e => setWallet(e.target.value)}>
            {WALLETS.map(w => <option key={w} value={w}>{w}</option>)}
          </select>
        </div>
      )}

      <button
        className="btn-success"
        style={{ width: '100%', marginTop: '24px', padding: '16px', fontSize: '16px' }}
        onClick={handlePay}
        disabled={loading}
      >
        {loading ? (
          <><div className="spinner" style={{ borderTopColor: 'white', borderColor: 'rgba(255,255,255,0.3)' }} /> Processing...</>
        ) : (
          `Pay ₹${parseInt(amount).toLocaleString()}`
        )}
      </button>

      <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '11px', color: '#718096' }}>
        🔒 Demo payment — no real money is charged
      </div>
    </div>
  );
}

function BookingContent({ params }) {
  const { trainId } = use(params);
  const searchParams = useSearchParams();
  const router = useRouter();

  const origin = searchParams.get('origin');
  const destination = searchParams.get('destination');
  const cls = searchParams.get('class');
  const date = searchParams.get('date');
  const fare = searchParams.get('fare') || '0';
  const requestedDest = searchParams.get('requestedDest');
  const isAlternate = searchParams.get('isAlternate') === 'true';

  const [step, setStep] = useState(0);
  const [stations, setStations] = useState([]);
  const [passenger, setPassenger] = useState({ name: '', age: '', gender: '', mobile: '', email: '', berthPreference: 'LB' });
  const [earlyDeboarding, setEarlyDeboarding] = useState(isAlternate ? true : null);
  const [deboardingStation, setDeboardingStation] = useState(isAlternate ? (requestedDest || '') : '');
  const [errors, setErrors] = useState({});
  const [booking, setBooking] = useState(null);
  const [payLoading, setPayLoading] = useState(false);
  const [bookLoading, setBookLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    fetch('/api/stations').then(r => r.json()).then(d => { if (d.success) setStations(d.data); });
  }, []);

  function validatePassenger() {
    const errs = {};
    if (!passenger.name.trim()) errs.name = 'Name required';
    if (!passenger.age || parseInt(passenger.age) < 1 || parseInt(passenger.age) > 120) errs.age = 'Valid age required (1-120)';
    if (!passenger.gender) errs.gender = 'Gender required';
    if (!/^\d{10}$/.test(passenger.mobile)) errs.mobile = 'Valid 10-digit mobile required';
    return errs;
  }

  async function handleNext() {
    setApiError('');
    if (step === 0) {
      const errs = validatePassenger();
      if (Object.keys(errs).length > 0) { setErrors(errs); return; }
      setErrors({});
      setStep(1);
    } else if (step === 1) {
      // Create booking (with intent if applicable) - BEFORE payment
      if (booking) { setStep(2); return; }
      setBookLoading(true);
      try {
        const res = await fetch('/api/bookings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            trainId,
            origin,
            destination,
            class: cls,
            date,
            passenger: {
              name: passenger.name.trim(),
              age: parseInt(passenger.age),
              gender: passenger.gender,
              mobile: passenger.mobile,
              email: passenger.email
            },
            berthPreference: passenger.berthPreference,
            fare: parseInt(fare),
            earlyDeboarding: earlyDeboarding
              ? { enabled: true, station: deboardingStation }
              : { enabled: false }
          })
        });
        const data = await res.json();
        if (!data.success) { setApiError(data.error || 'Booking failed'); return; }
        setBooking(data.data);
        localStorage.setItem('rf_booking_id', data.data.booking.id);
        setStep(2);
      } catch (e) {
        setApiError('Network error. Please try again.');
      } finally {
        setBookLoading(false);
      }
    } else if (step === 2) {
      setStep(3);
    }
  }

  async function handlePayment(method, details) {
    if (!booking) return;
    setPayLoading(true);
    setApiError('');
    try {
      const res = await fetch('/api/payments/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: booking.booking.id,
          method,
          amount: parseInt(fare),
          paymentDetails: details
        })
      });
      const data = await res.json();
      if (!data.success) {
        setApiError(data.error || 'Payment failed. Please try again.');
        return;
      }
      router.push(`/confirmation/${booking.booking.id}`);
    } catch {
      setApiError('Payment network error. Please try again.');
    } finally {
      setPayLoading(false);
    }
  }

  const destStation = stations.find(s => s.code === destination);

  return (
    <ViewProvider>
      <AppShell>
        <Header title={`Book · ${trainId}`} />
        <StepIndicator current={step} />

        {/* Journey summary bar */}
        <div style={{ background: '#1a3a5c', padding: '10px 20px', color: 'white', fontSize: '13px' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            <span>{origin} → {destination} · {cls} · {date}</span>
            <span style={{ color: '#e85d04', fontWeight: '700' }}>₹{parseInt(fare).toLocaleString()}</span>
          </div>
        </div>

        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          {apiError && (
            <div style={{ margin: '16px 20px', background: '#fef2f2', border: '1.5px solid #fca5a5', borderRadius: '8px', padding: '12px', color: '#c1121f', fontSize: '13px' }}>
              ⚠️ {apiError}
            </div>
          )}

          {step === 0 && (
            <PassengerStep form={passenger} onChange={(k, v) => setPassenger(p => ({ ...p, [k]: v }))} errors={errors} />
          )}

          {step === 1 && (
            <DeboardingStep
              trainId={trainId}
              origin={origin}
              destination={destination}
              form={{ earlyDeboarding, deboardingStation }}
              onChange={(k, v) => {
                if (k === 'earlyDeboarding') setEarlyDeboarding(v);
                if (k === 'deboardingStation') setDeboardingStation(v);
              }}
              stations={stations}
            />
          )}

          {step === 2 && (
            <ReviewStep
              bookingData={booking}
              passenger={passenger}
              earlyDeboarding={earlyDeboarding}
              deboardingStation={deboardingStation}
              stations={stations}
              fare={fare}
              cls={cls}
              trainId={trainId}
              origin={origin}
              destination={destination}
              date={date}
            />
          )}

          {step === 3 && (
            <PaymentStep
              amount={fare}
              onSuccess={handlePayment}
              loading={payLoading}
            />
          )}

          {/* Navigation */}
          {step < 3 && (
            <div style={{ padding: '0 20px 24px', display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
              {step > 0 && (
                <button className="btn-outline" onClick={() => setStep(s => s - 1)} style={{ flex: 1 }}>
                  ← Back
                </button>
              )}
              <button
                className="btn-primary"
                style={{ flex: 2 }}
                onClick={handleNext}
                disabled={bookLoading || (step === 1 && earlyDeboarding === true && !deboardingStation)}
              >
                {bookLoading ? (
                  <><div className="spinner" style={{ borderTopColor: 'white' }} /> Creating booking...</>
                ) : step === 2 ? (
                  'Continue to Payment →'
                ) : (
                  'Continue →'
                )}
              </button>
            </div>
          )}
        </div>
      </AppShell>
    </ViewProvider>
  );
}

export default function BookingPage({ params }) {
  return (
    <Suspense fallback={<div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>}>
      <BookingContent params={params} />
    </Suspense>
  );
}
