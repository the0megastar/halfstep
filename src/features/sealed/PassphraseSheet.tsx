import { useEffect, useState, type FormEvent } from 'react';
import { AppSheet } from '../../components/ui/AppSheet';
import { linkSealedStore, refreshSealedStore } from './sealedBridge';
import {
  clearPassphraseMarker,
  isPassphraseSaved,
  savePassphraseMarker,
} from './sealedPassphrase';
import {
  clearSealedPassphrase,
  readSealedPassphrase,
  rememberSealedPassphrase,
} from './sealedSession';
import { isSealedSyncConfigured } from './sealedSync';

export interface PassphraseSheetProps {
  open: boolean;
  onClose: () => void;
  onSavedChange: (saved: boolean) => void;
}

type SheetMode = 'edit' | 'linked' | 'remove-confirm' | 'unlock';

const FORM_ID = 'sealed-passphrase-form';
const UNLOCK_FORM_ID = 'sealed-passphrase-unlock-form';

export function PassphraseSheet({ open, onClose, onSavedChange }: PassphraseSheetProps) {
  const [mode, setMode] = useState<SheetMode>('edit');
  const [passphrase, setPassphrase] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [refreshNote, setRefreshNote] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    setMode(isPassphraseSaved() ? 'linked' : 'edit');
    setPassphrase('');
    setConfirm('');
    setError(null);
    setRefreshNote(null);
    setBusy(false);
  }, [open]);

  const handleSave = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    if (!passphrase.trim() || passphrase.trim() !== confirm.trim()) {
      setError('Passphrases do not match.');
      return;
    }
    if (!isSealedSyncConfigured()) {
      // Local feel-test: remember on this device only; do not touch Supabase.
      savePassphraseMarker(passphrase.trim());
      rememberSealedPassphrase(passphrase.trim());
      onSavedChange(true);
      setMode('linked');
      setPassphrase('');
      setConfirm('');
      setRefreshNote('Saved on this device only · cloud sync is off.');
      return;
    }
    setBusy(true);
    try {
      const result = await linkSealedStore(passphrase);
      onSavedChange(true);
      setMode('linked');
      setPassphrase('');
      setConfirm('');
      setRefreshNote(
        result.action === 'joined'
          ? `Joined sealed copy · ${result.count} entries on this device.`
          : `Sealed copy created · ${result.count} entries uploaded.`,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not reach the sealed store.');
    } finally {
      setBusy(false);
    }
  };

  const handleRemove = () => {
    clearPassphraseMarker();
    clearSealedPassphrase();
    onSavedChange(false);
    setMode('edit');
    setPassphrase('');
    setConfirm('');
    setError(null);
    setRefreshNote(null);
  };

  const runRefresh = async (phrase: string) => {
    if (!isSealedSyncConfigured()) {
      setError('Cloud sync is off for this build.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const result = await refreshSealedStore(phrase);
      setRefreshNote(`Sealed copy refreshed · ${result.count} entries on this device.`);
      setMode('linked');
      setPassphrase('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not refresh the sealed store.');
    } finally {
      setBusy(false);
    }
  };

  const handleRefresh = () => {
    setError(null);
    const session = readSealedPassphrase();
    if (session) {
      void runRefresh(session);
      return;
    }
    setPassphrase('');
    setRefreshNote(null);
    setMode('unlock');
  };

  const handleUnlock = async (event: FormEvent) => {
    event.preventDefault();
    if (!passphrase.trim()) {
      setError('Enter the passphrase to refresh.');
      return;
    }
    await runRefresh(passphrase);
  };

  const title =
    mode === 'remove-confirm'
      ? 'Remove passphrase?'
      : mode === 'unlock'
        ? 'Refresh sealed copy'
        : 'Passphrase';

  const actions =
    mode === 'edit'
      ? [
          {
            label: busy ? 'Saving…' : 'Save passphrase',
            tone: 'primary' as const,
            type: 'submit' as const,
            form: FORM_ID,
            disabled: busy,
          },
          { label: 'Cancel', tone: 'ghost' as const, onClick: onClose, disabled: busy },
        ]
      : mode === 'linked'
        ? [
            {
              label: 'Remove passphrase',
              tone: 'destructive' as const,
              disabled: busy,
              onClick: () => {
                setError(null);
                setMode('remove-confirm');
              },
            },
            {
              label: busy ? 'Refreshing…' : 'Refresh',
              tone: 'ghost' as const,
              onClick: handleRefresh,
              disabled: busy,
            },
          ]
        : mode === 'unlock'
          ? [
              {
                label: busy ? 'Refreshing…' : 'Refresh',
                tone: 'primary' as const,
                type: 'submit' as const,
                form: UNLOCK_FORM_ID,
                disabled: busy,
              },
              {
                label: 'Cancel',
                tone: 'ghost' as const,
                disabled: busy,
                onClick: () => {
                  setError(null);
                  setPassphrase('');
                  setMode('linked');
                },
              },
            ]
          : [
              { label: 'Remove', tone: 'destructive' as const, onClick: handleRemove, disabled: busy },
              {
                label: 'Cancel',
                tone: 'ghost' as const,
                disabled: busy,
                onClick: () => setMode('linked'),
              },
            ];

  return (
    <AppSheet open={open} title={title} onClose={onClose} className="passphrase-sheet" actions={actions}>
      {mode === 'edit' && (
        <form id={FORM_ID} className="passphrase-sheet-body" onSubmit={handleSave}>
          <p className="text-copy-13 passphrase-sheet-copy">
            A passphrase seals a copy of the injection store. Matching phrases open the same sealed
            copy.
          </p>

          <div className="history-field">
            <div className="history-field-header">
              <label htmlFor="sealed-passphrase" className="history-field-label">
                Passphrase
              </label>
            </div>
            <input
              id="sealed-passphrase"
              type="password"
              autoComplete="new-password"
              className="history-text-input"
              value={passphrase}
              onChange={(event) => setPassphrase(event.target.value)}
              required
              disabled={busy}
            />
          </div>

          <div className="history-field">
            <div className="history-field-header">
              <label htmlFor="sealed-passphrase-confirm" className="history-field-label">
                Confirm passphrase
              </label>
            </div>
            <input
              id="sealed-passphrase-confirm"
              type="password"
              autoComplete="new-password"
              className="history-text-input"
              value={confirm}
              onChange={(event) => setConfirm(event.target.value)}
              required
              disabled={busy}
            />
          </div>

          {error && (
            <p role="alert" className="passphrase-sheet-error text-copy-13">
              {error}
            </p>
          )}
        </form>
      )}

      {mode === 'unlock' && (
        <form id={UNLOCK_FORM_ID} className="passphrase-sheet-body" onSubmit={handleUnlock}>
          <p className="text-copy-13 passphrase-sheet-copy">
            Enter the passphrase again to pull the sealed copy onto this device.
          </p>
          <div className="history-field">
            <div className="history-field-header">
              <label htmlFor="sealed-passphrase-unlock" className="history-field-label">
                Passphrase
              </label>
            </div>
            <input
              id="sealed-passphrase-unlock"
              type="password"
              autoComplete="current-password"
              className="history-text-input"
              value={passphrase}
              onChange={(event) => setPassphrase(event.target.value)}
              required
              disabled={busy}
            />
          </div>
          {error && (
            <p role="alert" className="passphrase-sheet-error text-copy-13">
              {error}
            </p>
          )}
        </form>
      )}

      {mode === 'linked' && (
        <div className="passphrase-sheet-body">
          <div className="passphrase-sheet-lead">
            <p role="status" className="text-heading-14 passphrase-sheet-status">
              Passphrase saved on this device.
            </p>
            <p className="text-copy-13 passphrase-sheet-muted">
              Matching phrases keep sealed copies aligned.
            </p>
            {refreshNote && (
              <p role="status" className="text-copy-13 passphrase-sheet-muted">
                {refreshNote}
              </p>
            )}
            {error && (
              <p role="alert" className="passphrase-sheet-error text-copy-13">
                {error}
              </p>
            )}
          </div>
        </div>
      )}

      {mode === 'remove-confirm' && (
        <div className="passphrase-sheet-body">
          <p className="text-copy-13 passphrase-sheet-copy">
            Clears the passphrase from this device. Entries already here stay. The sealed copy in the
            cloud is left alone.
          </p>
        </div>
      )}
    </AppSheet>
  );
}
