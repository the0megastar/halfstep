import { useState, useCallback, useEffect, useRef } from 'react';

export type ActiveOverlay = 'none' | 'settings' | 'iob';

export function useOverlayManager() {
  const [activeOverlay, setActiveOverlay] = useState<ActiveOverlay>('none');
  const settingsTriggerRef = useRef<HTMLElement | null>(null);
  const iobTriggerRef = useRef<HTMLElement | null>(null);

  const toggleSettings = useCallback(() => {
    setActiveOverlay((prev) => (prev === 'settings' ? 'none' : 'settings'));
  }, []);

  const toggleIob = useCallback(() => {
    setActiveOverlay((prev) => (prev === 'iob' ? 'none' : 'iob'));
  }, []);

  const closeOverlay = useCallback(() => {
    setActiveOverlay('none');
  }, []);

  // Handle Escape key: close topmost popover and restore focus to trigger
  useEffect(() => {
    if (activeOverlay === 'none') return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        const previous = activeOverlay;
        setActiveOverlay('none');
        if (previous === 'settings' && settingsTriggerRef.current) {
          settingsTriggerRef.current.focus();
        } else if (previous === 'iob' && iobTriggerRef.current) {
          iobTriggerRef.current.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeOverlay]);

  return {
    activeOverlay,
    isSettingsOpen: activeOverlay === 'settings',
    isIobOpen: activeOverlay === 'iob',
    toggleSettings,
    toggleIob,
    closeOverlay,
    settingsTriggerRef,
    iobTriggerRef,
  };
}
