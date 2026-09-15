import { useState, useEffect, useCallback } from 'react';

export type AppView = 'calculator' | 'history' | 'settings' | 'typography';

function getInitialView(): AppView {
  if (typeof window !== 'undefined') {
    try {
      const params = new URLSearchParams(window.location.search);
      const view = params.get('view');
      if (view === 'typography') return 'typography';
      if (view === 'history') return 'history';
      if (view === 'settings') return 'settings';
    } catch {
      // ignore
    }
  }
  return 'calculator';
}

export function useAppView() {
  const [view, setView] = useState<AppView>(getInitialView);

  const switchView = useCallback((nextView: AppView) => {
    setView(nextView);
    if (typeof window !== 'undefined') {
      try {
        const url = new URL(window.location.href);
        if (nextView === 'calculator') {
          url.searchParams.delete('view');
        } else {
          url.searchParams.set('view', nextView);
        }
        window.history.pushState({}, '', url.toString());
      } catch {
        // ignore
      }
    }
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const view = params.get('view');
        if (view === 'typography') setView('typography');
        else if (view === 'history') setView('history');
        else if (view === 'settings') setView('settings');
        else setView('calculator');
      } catch {
        // ignore
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return { view, switchView };
}
