import React, { Suspense, useRef, useState } from 'react';
import { Moon, Sun, Type } from 'lucide-react';
import { useTheme } from './app/useTheme';
import { useAppView } from './app/useAppView';
import { AppShell } from './app/AppShell';
import { useOverlayManager } from './hooks/useOverlayManager';
import { SettingsPopover } from './features/settings/SettingsPopover';
import { CalculatorPage } from './pages/CalculatorPage';
import InjectionHistory, { type InjectionHistoryHandle } from './components/InjectionHistory';
import type { CalculationResult } from '../lib/dose';

const DesignSystemPage = React.lazy(() => import('./pages/DesignSystemPage'));

export default function App() {
  const { colorMode, toggleColorMode } = useTheme();
  const { view, switchView } = useAppView();
  const overlayManager = useOverlayManager();
  const injectionHistoryRef = useRef<InjectionHistoryHandle>(null);
  const [currentResult, setCurrentResult] = useState<CalculationResult | null>(null);

  const suggestedDose =
    currentResult &&
    currentResult.total !== null &&
    currentResult.rounding !== null &&
    !currentResult.isLowGlucose &&
    currentResult.rounding.rounded > 0
      ? currentResult.rounding.rounded
      : undefined;

  if (view === 'typography') {
    return (
      <Suspense fallback={null}>
        <DesignSystemPage
          onBack={() => switchView('calculator')}
          colorMode={colorMode}
          onToggleTheme={toggleColorMode}
        />
      </Suspense>
    );
  }

  const navActions = (
    <>
      <InjectionHistory
        ref={injectionHistoryRef}
        suggestedDose={suggestedDose}
        isIobOpen={overlayManager.isIobOpen}
        onToggleIob={overlayManager.toggleIob}
        onCloseIob={overlayManager.closeOverlay}
      />

      {/* Prescribed Settings Dropdown */}
      <SettingsPopover
        isOpen={overlayManager.isSettingsOpen}
        onToggle={overlayManager.toggleSettings}
        onClose={overlayManager.closeOverlay}
      />

      {/* Typography Specimen Link */}
      <button
        type="button"
        className="nav-btn type-specimen-btn"
        onClick={() => switchView('typography')}
        title="Halfstep Typography Scale (25 Tiers)"
        aria-label="Halfstep Typography Scale (25 Tiers)"
      >
        <Type size={18} />
      </button>

      {/* Light / Dark Mode Toggle */}
      <button
        type="button"
        className="theme-toggle-btn nav-btn"
        onClick={toggleColorMode}
        title={colorMode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
        aria-label={colorMode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
      >
        {colorMode === 'light' ? (
          <Moon size={19} className="moon-icon" />
        ) : (
          <Sun size={19} className="sun-icon" />
        )}
      </button>
    </>
  );

  return (
    <AppShell navActions={navActions}>
      <CalculatorPage
        onRecordDose={(dose) => injectionHistoryRef.current?.recordDose(dose)}
        onSwitchToTypography={() => switchView('typography')}
        onResultChange={setCurrentResult}
      />
    </AppShell>
  );
}
