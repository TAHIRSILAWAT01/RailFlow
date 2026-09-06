'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ViewToggle } from './ViewToggle';

export default function Header({ title, showBack = true, actions = null }) {
  const router = useRouter();

  return (
    <div>
      <div className="disclosure-banner">
        Prototype only — Railway/IRCTC/PRS/CRIS/HHT integrations are simulated.
      </div>
      <div className="rf-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {showBack && (
            <button
              onClick={() => router.back()}
              style={{
                background: 'rgba(255,255,255,0.15)',
                border: 'none',
                color: 'white',
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px'
              }}
            >
              ←
            </button>
          )}
          <Link href="/search" style={{ textDecoration: 'none' }}>
            <span style={{ fontWeight: '900', fontSize: '20px', color: 'white', letterSpacing: '-0.5px' }}>
              RAIL<span style={{ color: '#e85d04' }}>FLOW</span>
            </span>
          </Link>
          {title && (
            <>
              <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>›</span>
              <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px' }}>{title}</span>
            </>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {actions}
          <ViewToggle />
          <Link href="/trips" style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px', textDecoration: 'none' }}>My Trips</Link>
          <Link href="/tte" style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px', textDecoration: 'none' }}>TTE</Link>
          <Link href="/operations" style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px', textDecoration: 'none' }}>Ops</Link>
        </div>
      </div>
    </div>
  );
}
