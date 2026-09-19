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
