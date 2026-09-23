import { useEffect, useId, type ReactNode } from 'react';
import { X } from 'lucide-react';

export type AppSheetActionTone = 'primary' | 'ghost' | 'destructive';

export interface AppSheetAction {
  label: string;
  tone: AppSheetActionTone;
  onClick?: () => void;
  type?: 'button' | 'submit';
  disabled?: boolean;
  form?: string;
}

export interface AppSheetProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  /** Stacked footer: array order = visual order top → bottom. Omit when actions live in children. */
  actions?: AppSheetAction[];
  /** Extra class on the card (e.g. passphrase-sheet). */
  className?: string;
  /** Override generated title id for aria-labelledby. */
  titleId?: string;
  /** Show the in-toolbar close control. Default true. */
  showClose?: boolean;
}

function toneClass(tone: AppSheetActionTone): string {
  if (tone === 'ghost') return 'btn-ghost';
  if (tone === 'destructive') return 'btn-destructive-solid';
  return 'btn-primary';
}

/**
 * Shared modal sheet chrome: scrim, centered card, in-toolbar title + close,
 * body slot, optional stacked action footer (Confirm-Entry style).
 */
export function AppSheet({
  open,
  title,
  onClose,
  children,
  actions,
  className = '',
  titleId: titleIdProp,
  showClose = true,
}: AppSheetProps) {
  const generatedId = useId();
  const titleId = titleIdProp ?? generatedId;

  useEffect(() => {
    if (!open) return;
    document.body.classList.add('history-sheet-open');
    return () => document.body.classList.remove('history-sheet-open');
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const cardClass = ['history-sheet', 'card-surface', className].filter(Boolean).join(' ');

  return (
    <div
      className="history-sheet-backdrop"
      role="presentation"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className={cardClass} role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <header className="log-form-toolbar">
          {showClose ? (
            <button
              type="button"
              className="icon-badge-btn active log-form-close"
              onClick={onClose}
              aria-label="Close"
              title="Close"
            >
              <X size={18} strokeWidth={2.25} aria-hidden="true" />
            </button>
          ) : (
            <span className="log-form-toolbar-end" aria-hidden="true" />
          )}
          <h2 id={titleId} className="log-form-title text-heading-16">
            {title}
          </h2>
          <span className="log-form-toolbar-end" aria-hidden="true" />
        </header>

        {children}

        {actions && actions.length > 0 && (
          <div className="history-actions">
            {actions.map((action) => (
              <button
                key={action.label}
                type={action.type ?? 'button'}
                className={toneClass(action.tone)}
                onClick={action.onClick}
                disabled={action.disabled}
                form={action.form}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
