'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SplashPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/search');
    }, 2200);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: '#1a3a5c',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden'
    }}>
      {/* Background pattern */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,0.02) 35px, rgba(255,255,255,0.02) 70px)',
        pointerEvents: 'none'
      }} />

      {/* Track lines */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '120px',
        overflow: 'hidden',
        opacity: 0.15
      }}>
        <div style={{ position: 'absolute', bottom: '40px', left: 0, right: 0, height: '3px', background: '#e85d04' }} />
        <div style={{ position: 'absolute', bottom: '50px', left: 0, right: 0, height: '3px', background: '#e85d04' }} />
        {[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19].map(i => (
          <div key={i} style={{
            position: 'absolute',
            bottom: '35px',
            left: `${i * 80}px`,
            width: '40px',
            height: '20px',
            background: '#e85d04',
            borderRadius: '2px'
          }} />
        ))}
      </div>

      <div style={{
        textAlign: 'center',
        animation: 'fadeIn 0.8s ease-out',
        zIndex: 1
      }}>
        {/* Logo mark */}
        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: '18px',
          background: '#e85d04',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 28px',
          boxShadow: '0 8px 32px rgba(232,93,4,0.4)',
          animation: 'slideUp 0.6s ease-out 0.2s both'
        }}>
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <path d="M4 30 L20 8 L36 30" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M10 30 L30 30" stroke="white" strokeWidth="3" strokeLinecap="round"/>
            <circle cx="20" cy="20" r="3" fill="white"/>
          </svg>
        </div>

        {/* Wordmark */}
        <h1 style={{
          fontSize: '56px',
          fontWeight: '900',
          color: 'white',
          letterSpacing: '-2px',
          lineHeight: 1,
          animation: 'slideUp 0.6s ease-out 0.4s both',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
        }}>
          RAIL<span style={{ color: '#e85d04' }}>FLOW</span>
        </h1>

        {/* Loading indicator */}
        <div style={{
          marginTop: '48px',
          display: 'flex',
          gap: '6px',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'fadeIn 0.6s ease-out 1s both'
        }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: '#e85d04',
              animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`
            }} />
          ))}
        </div>
      </div>
    </div>
  );
}
