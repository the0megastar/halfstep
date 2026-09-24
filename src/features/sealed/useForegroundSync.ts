import { useEffect, useRef } from 'react';
import { refreshSealedStore } from './sealedBridge';
import { isPassphraseSaved } from './sealedPassphrase';
import { readSealedPassphrase } from './sealedSession';
import { isSealedSyncConfigured } from './sealedSync';

const DEBOUNCE_MS = 5000; // Skip pulls within 5 seconds of the last one

/**
 * Quiet background pull when Halfstep comes to the foreground.
 * Only runs when all gates pass:
 * 1. Sealed cloud sync is configured for this build
 * 2. Passphrase marker is saved locally (unlock icon / linked state)
 * 3. Session passphrase is present in memory for this tab (unlocked this session)
 */
export function useForegroundSync(): void {
  const lastPullRef = useRef<number>(0);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState !== 'visible') return;

      // Gate 1: Sealed cloud sync configured
      if (!isSealedSyncConfigured()) return;

      // Gate 2: Passphrase marker saved locally
      if (!isPassphraseSaved()) return;

      // Gate 3: Session passphrase present in memory
      const passphrase = readSealedPassphrase();
      if (!passphrase) return;

      // Debounce: skip if a pull ran recently
      const now = Date.now();
      if (now - lastPullRef.current < DEBOUNCE_MS) return;
      lastPullRef.current = now;

      // Fire-and-forget: pull quietly in the background
      void refreshSealedStore(passphrase).catch((error) => {
        // Swallow errors quietly; same spirit as post-save push
        if (import.meta.env.DEV) {
          console.debug('[foreground-sync] Quiet pull failed:', error);
        }
      });
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Also listen to focus/pageshow for bfcache and tab restore
    window.addEventListener('focus', handleVisibilityChange);
    window.addEventListener('pageshow', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
      window.removeEventListener('pageshow', handleVisibilityChange);
    };
  }, []);
}
