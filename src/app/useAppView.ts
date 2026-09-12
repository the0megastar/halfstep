import { useState, useEffect, useCallback } from 'react';

export type AppView = 'calculator' | 'typography';

function getInitialView(): AppView {
  if (typeof window !== 'undefined') {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('view') === 'typography') return 'typography';
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
        if (nextView === 'typography') {
          url.searchParams.set('view', 'typography');
        } else {
          url.searchParams.delete('view');
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
        setView(params.get('view') === 'typography' ? 'typography' : 'calculator');
      } catch {
        // ignore
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return { view, switchView };
}
