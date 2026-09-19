import { useRef, useEffect } from 'react';
import {
  InjectionHistoryPanel,
  type InjectionHistoryPanelProps,
} from './InjectionHistoryPanel';

/** Legacy modal wrapper. Prefer the History tab page for primary navigation. */
export function InjectionHistoryDialog({
  isOpen,
  onClose,
  ...panelProps
}: { isOpen: boolean; onClose: () => void } & Omit<InjectionHistoryPanelProps, 'variant' | 'onClose'>) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen) {
      if (!dialog.open) dialog.showModal();
    } else if (dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  return (
    <dialog
      ref={dialogRef}
      className="injection-dialog"
      onCancel={(e) => {
        if (panelProps.recordsState.saving) e.preventDefault();
        else onClose();
      }}
    >
      <InjectionHistoryPanel {...panelProps} variant="dialog" onClose={onClose} />
    </dialog>
  );
}
