'use client';

import { useState, useEffect, createContext, useContext } from 'react';

const ViewContext = createContext({
  view: 'desktop',
  setView: () => {}
});

export function ViewProvider({ children }) {
  const [view, setView] = useState('desktop');

  useEffect(() => {
    setView('desktop');
    localStorage.setItem('rf_view', 'desktop');
  }, []);

  const handleSetView = (value) => {
    setView(value);
    localStorage.setItem('rf_view', value);
  };

  return (
    <ViewContext.Provider value={{ view, setView: handleSetView }}>
      {children}
    </ViewContext.Provider>
  );
}

export function useView() {
  return useContext(ViewContext);
}

export function ViewToggle() {
  const { view, setView } = useView();

  return (
    <div className="view-toggle">
      <button
        className={view === 'mobile' ? 'active' : ''}
        onClick={() => setView('mobile')}
        title="Mobile view"
      >
        📱 Mobile
      </button>

      <button
        className={view === 'desktop' ? 'active' : ''}
        onClick={() => setView('desktop')}
        title="Desktop view"
      >
        🖥️ Desktop
      </button>
    </div>
  );
}

export function AppShell({ children }) {
  const { view } = useView();

  if (view === 'mobile') {
    return (
      <div
        style={{
          background: '#e2e8f0',
          minHeight: '100vh',
          display: 'flex',
          justifyContent: 'center',
          padding: '20px 0'
        }}
      >
        <div className="mobile-container fade-in">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="desktop-container">
      {children}
    </div>
  );
}