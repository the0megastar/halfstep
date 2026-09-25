import { useEffect, useRef } from 'react';
import { refreshSealedStore } from './sealedBridge';
import { isPassphraseSaved, restoreRememberedPassphrase } from './sealedPassphrase';
import { readSealedPassphrase } from './sealedSession';
import { isSealedSyncConfigured } from './sealedSync';

const DEBOUNCE_MS = 5000; // Skip pulls within 5 seconds of the last one

/**
 * Quiet background pull when Halfstep comes to the foreground.
 * Only runs when all gates pass:
 * 1. Sealed cloud sync is configured for this build
 * 2. Passphrase marker is saved locally (unlock icon / linked state)
 * 3. Device-local encrypted unlock can be restored for this tab
 */
export function useForegroundSync(): void {
  const lastPullRef = useRef<number>(0);

  useEffect(() => {
    let disposed = false;
    let inFlight = false;
    const handleVisibilityChange = () => {
      if (document.visibilityState !== 'visible') return;

      // Gate 1: Sealed cloud sync configured
      if (!isSealedSyncConfigured()) return;

      // Gate 2: Passphrase marker saved locally
      if (!isPassphraseSaved()) return;

      if (inFlight) return;

      // Debounce: skip if a pull ran recently
      const now = Date.now();
      if (now - lastPullRef.current < DEBOUNCE_MS) return;
      lastPullRef.current = now;
      inFlight = true;
      void (async () => {
        try {
          // Restore the device unlock when this tab has no session passphrase.
          const passphrase = readSealedPassphrase() ?? await restoreRememberedPassphrase();
          if (disposed || !passphrase) return;
          await refreshSealedStore(passphrase);
        } catch (error) {
          if (import.meta.env.DEV) console.debug('[foreground-sync] Quiet pull failed:', error);
        } finally {
          inFlight = false;
        }
      })();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Also listen to focus/pageshow for bfcache and tab restore
    window.addEventListener('focus', handleVisibilityChange);
    window.addEventListener('pageshow', handleVisibilityChange);
    // Cold launch from an installed PWA can start already visible without a visibilitychange.
    handleVisibilityChange();

    return () => {
      disposed = true;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
      window.removeEventListener('pageshow', handleVisibilityChange);
    };
  }, []);
}
