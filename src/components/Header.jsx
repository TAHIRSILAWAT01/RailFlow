'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Header({ title, showBack = true, actions = null }) {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div>
      <div className="disclosure-banner">
        Prototype only — Railway/IRCTC/PRS/CRIS/HHT integrations are simulated.
      </div>

      <div className="rf-header">
        {showBack && (
          <button
            className="rf-desktop-back"
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
              fontSize: '16px',
              flexShrink: 0
            }}
          >
            ←
          </button>
        )}

        <button
          className="rf-mobile-back"
          onClick={() => router.back()}
          aria-label="Go back"
        >
          ←
        </button>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            minWidth: 0
          }}
        >
          <Link href="/search" style={{ textDecoration: 'none' }}>
            <span
              style={{
                fontWeight: '900',
                fontSize: '20px',
                color: 'white',
                letterSpacing: '-0.5px'
              }}
            >
              RAIL<span style={{ color: '#e85d04' }}>FLOW</span>
            </span>
          </Link>

          {title && (
            <>
              <span
                className="rf-header-title"
                style={{
                  color: 'rgba(255,255,255,0.4)',
                  fontSize: '14px'
                }}
              >
                ›
              </span>

              <span
                className="rf-header-title"
                style={{
                  color: 'rgba(255,255,255,0.8)',
                  fontSize: '14px'
                }}
              >
                {title}
              </span>
            </>
          )}
        </div>

        <div
          className="rf-header-desktop-actions"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}
        >
          {actions}

          <Link
            href="/trips"
            style={{
              color: 'rgba(255,255,255,0.8)',
              fontSize: '12px',
              textDecoration: 'none'
            }}
          >
            My Trips
          </Link>

          <Link
            href="/tte"
            style={{
              color: 'rgba(255,255,255,0.8)',
              fontSize: '12px',
              textDecoration: 'none'
            }}
          >
            TTE
          </Link>

          <Link
            href="/operations"
            style={{
              color: 'rgba(255,255,255,0.8)',
              fontSize: '12px',
              textDecoration: 'none'
            }}
          >
            Ops
          </Link>
        </div>

        <button
          className="rf-mobile-menu-button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileMenuOpen}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {mobileMenuOpen && (
        <div
          className="rf-mobile-menu"
          style={{
            background: '#151922',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            padding: '12px',
            position: 'relative',
            zIndex: 100
          }}
        >
          {actions && (
            <div
              style={{
                paddingBottom: '10px',
                marginBottom: '10px',
                borderBottom: '1px solid rgba(255,255,255,0.08)'
              }}
            >
              {actions}
            </div>
          )}

          <Link
            href="/trips"
            onClick={() => setMobileMenuOpen(false)}
            style={{
              display: 'block',
              padding: '12px 8px',
              color: 'rgba(255,255,255,0.85)',
              fontSize: '14px',
              textDecoration: 'none',
              borderRadius: '8px'
            }}
          >
            My Trips
          </Link>

          <Link
            href="/tte"
            onClick={() => setMobileMenuOpen(false)}
            style={{
              display: 'block',
              padding: '12px 8px',
              color: 'rgba(255,255,255,0.85)',
              fontSize: '14px',
              textDecoration: 'none',
              borderRadius: '8px'
            }}
          >
            TTE
          </Link>

          <Link
            href="/operations"
            onClick={() => setMobileMenuOpen(false)}
            style={{
              display: 'block',
              padding: '12px 8px',
              color: 'rgba(255,255,255,0.85)',
              fontSize: '14px',
              textDecoration: 'none',
              borderRadius: '8px'
            }}
          >
            Ops
          </Link>
        </div>
      )}

      <style jsx>{`
        .rf-mobile-back {
          display: none;
        }

        .rf-mobile-menu-button {
          display: none;
        }

        .rf-mobile-menu {
          display: none;
        }

        @media (max-width: 768px) {
          .rf-header {
            min-height: 58px;
            padding: 8px 12px !important;
            gap: 8px;
          }

          .rf-desktop-back {
            display: none !important;
          }

          .rf-mobile-back {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 40px;
            height: 40px;
            padding: 0;
            background: rgba(255, 255, 255, 0.15);
            border: none;
            border-radius: 8px;
            color: white;
            font-size: 20px;
            cursor: pointer;
            flex-shrink: 0;
          }

          .rf-header-desktop-actions {
            display: none !important;
          }

          .rf-mobile-menu-button {
            display: flex;
            width: 40px;
            height: 40px;
            padding: 0;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            gap: 4px;
            background: rgba(255, 255, 255, 0.12);
            border: 1px solid rgba(255, 255, 255, 0.18);
            border-radius: 9px;
            cursor: pointer;
            flex-shrink: 0;
          }

          .rf-mobile-menu-button span {
            display: block;
            width: 18px;
            height: 2px;
            background: white;
            border-radius: 2px;
          }

          .rf-mobile-menu {
            display: block;
          }

          .rf-header-title {
            display: none;
          }

          .rf-header > div:not(.rf-header-desktop-actions) {
            min-width: 0;
          }
        }

        @media (max-width: 420px) {
          .rf-header {
            padding: 8px 10px !important;
          }
        }
      `}</style>
    </div>
  );
}