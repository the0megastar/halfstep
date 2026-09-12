import { useState, useEffect, useRef, useCallback } from 'react';
import { loadInjections, saveInjection } from '../../../lib/storage';
import type { Injection } from '../../../lib/injections';

const BROADCAST_CHANNEL_NAME = 'halfstep-injections';

export function useInjectionRecords() {
  const [records, setRecords] = useState<Injection[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshError, setRefreshError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchSeqRef = useRef(0);
  const busyRef = useRef(false);
  const channelRef = useRef<BroadcastChannel | null>(null);

  const refresh = useCallback(async () => {
    const seq = ++fetchSeqRef.current;
    setLoading(true);
    setRefreshError(null);
    try {
      const data = await loadInjections();
      // Ensure responses are not applied if a newer fetch was initiated
      if (seq === fetchSeqRef.current) {
        // Validate array format to prevent corrupted state
        if (Array.isArray(data)) {
          setRecords(data);
          setLoaded(true);
        } else {
          setLoaded(false);
          setRefreshError('Stored injection data format was unexpected.');
        }
      }
    } catch (e) {
      if (seq === fetchSeqRef.current) {
        setLoaded(false);
        setRefreshError((e as Error).message || 'Failed to load injection history.');
      }
    } finally {
      if (seq === fetchSeqRef.current) {
        setLoading(false);
      }
    }
  }, []);

  const saveRecord = useCallback(async (record: Injection, expectedRevision?: number) => {
    if (busyRef.current) return;
    busyRef.current = true;
    setSaving(true);
    setSaveError(null);

    try {
      await saveInjection(record, expectedRevision);
      setRecords((prev) => [...prev.filter((item) => item.id !== record.id), record]);
      setNotice(record.status === 'voided' ? 'Entry voided. Original details preserved.' : 'Saved on this device.');

      // Broadcast update to other open tabs on this origin
      if (channelRef.current) {
        try {
          channelRef.current.postMessage({ type: 'injections-updated' });
        } catch {
          // broadcast failure ignored
        }
      }
    } catch (e) {
      setSaveError((e as Error).message || 'Failed to save injection.');
      throw e;
    } finally {
      busyRef.current = false;
      setSaving(false);
    }
  }, []);

  const clearErrors = useCallback(() => {
    setRefreshError(null);
    setSaveError(null);
  }, []);

  const clearNotice = useCallback(() => {
    setNotice(null);
  }, []);

  // Initial load, BroadcastChannel, and focus sync
  useEffect(() => {
    void refresh();

    // Set up BroadcastChannel if supported
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        const channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
        channelRef.current = channel;
        channel.onmessage = (event) => {
          if (event.data?.type === 'injections-updated' && !busyRef.current) {
            void refresh();
          }
        };
      } catch {
        // BroadcastChannel unavailable
      }
    }

    const onFocus = () => {
      if (!busyRef.current) {
        void refresh();
      }
    };

    window.addEventListener('focus', onFocus);
    return () => {
      window.removeEventListener('focus', onFocus);
      if (channelRef.current) {
        channelRef.current.close();
        channelRef.current = null;
      }
    };
  }, [refresh]);

  return {
    records,
    loaded,
    loading,
    refreshError,
    saveError,
    notice,
    saving,
    refresh,
    saveRecord,
    clearErrors,
    clearNotice,
    setNotice,
  };
}
