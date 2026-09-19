import { useEffect } from 'react';
import { Calculator, ClipboardList, Settings } from 'lucide-react';
import type { AppView } from './useAppView';

export type MainTab = 'calculator' | 'history' | 'settings';

const TABS: { id: MainTab; label: string; icon: typeof Calculator }[] = [
  { id: 'calculator', label: 'Calculate', icon: Calculator },
  { id: 'history', label: 'History', icon: ClipboardList },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export interface BottomTabBarProps {
  active: MainTab;
  onChange: (tab: MainTab) => void;
}

export function BottomTabBar({ active, onChange }: BottomTabBarProps) {
  useEffect(() => {
    const isField = (el: EventTarget | null) => {
      if (!(el instanceof HTMLElement)) return false;
      return Boolean(el.closest('input, textarea, select, [contenteditable="true"]'));
    };
    const sync = () => {
      const open = isField(document.activeElement);
      document.body.classList.toggle('keyboard-open', open);
    };
    const onFocusIn = () => sync();
    const onFocusOut = () => {
      // Let focus move between fields before clearing
      window.setTimeout(sync, 0);
    };
    document.addEventListener('focusin', onFocusIn);
    document.addEventListener('focusout', onFocusOut);
    return () => {
      document.removeEventListener('focusin', onFocusIn);
      document.removeEventListener('focusout', onFocusOut);
      document.body.classList.remove('keyboard-open');
    };
  }, []);

  return (
    <nav className="bottom-tab-bar" aria-label="Primary">
      {TABS.map(({ id, label, icon: Icon }) => {
        const selected = active === id;
        return (
          <button
            key={id}
            type="button"
            className={`bottom-tab ${selected ? 'is-selected' : ''}`}
            aria-current={selected ? 'page' : undefined}
            aria-label={label}
            onClick={() => onChange(id)}
          >
            <Icon size={22} strokeWidth={selected ? 2.25 : 1.75} aria-hidden="true" />
            <span className="bottom-tab-label text-label-12">{label}</span>
          </button>
        );
      })}
    </nav>
  );
}

export function isMainTab(view: AppView): view is MainTab {
  return view === 'calculator' || view === 'history' || view === 'settings';
}
