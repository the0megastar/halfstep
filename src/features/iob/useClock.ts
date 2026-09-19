import { useState, useEffect } from 'react';

export interface UseClockOptions {
  intervalMs?: number;
}

export function useClock({ intervalMs = 1000 }: UseClockOptions = {}) {
  const [now, setNow] = useState<number>(Date.now());

  useEffect(() => {
    const tick = () => setNow(Date.now());
    const interval = window.setInterval(tick, intervalMs);

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        tick();
      }
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('focus', tick);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('focus', tick);
    };
  }, [intervalMs]);

  return now;
}
