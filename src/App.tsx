import React, { Suspense, useEffect, useRef, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from './app/useTheme';
import { useAppView } from './app/useAppView';
import { useAppSettings } from './app/useAppSettings';
import { AppShell } from './app/AppShell';
import { BottomTabBar, isMainTab, type MainTab } from './app/BottomTabBar';
import { useOverlayManager } from './hooks/useOverlayManager';
import { CalculatorPage } from './pages/CalculatorPage';
import { SettingsPage } from './pages/SettingsPage';
import InjectionHistory, { type InjectionHistoryHandle } from './components/InjectionHistory';
import type { CalculationResult } from '../lib/dose';

const DesignSystemPage = React.lazy(() => import('./pages/DesignSystemPage'));

export default function App() {
  const { colorMode, toggleColorMode } = useTheme();
  const { view, switchView } = useAppView();
  const { settings, setMaxDoseWarningUnits } = useAppSettings();
  const overlayManager = useOverlayManager();
  const injectionHistoryRef = useRef<InjectionHistoryHandle>(null);
  const [currentResult, setCurrentResult] = useState<CalculationResult | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);

  const suggestedDose =
    currentResult &&
    currentResult.total !== null &&
    currentResult.rounding !== null &&
    !currentResult.isLowGlucose &&
    currentResult.rounding.rounded > 0
      ? currentResult.rounding.rounded
      : undefined;

  useEffect(() => {
    if (view === 'history') {
      injectionHistoryRef.current?.openHistory();
      setHistoryOpen(true);
    } else {
      setHistoryOpen(false);
    }
  }, [view]);

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

  const activeTab: MainTab = isMainTab(view) ? view : 'calculator';

  const navActions = (
    <>
      <InjectionHistory
        ref={injectionHistoryRef}
        suggestedDose={suggestedDose}
        isIobOpen={overlayManager.isIobOpen}
        onToggleIob={overlayManager.toggleIob}
        onCloseIob={overlayManager.closeOverlay}
        hideHistoryButton
        forceOpen={historyOpen}
        onDialogClose={() => {
          setHistoryOpen(false);
          if (view === 'history') switchView('calculator');
        }}
      />

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
    <AppShell navActions={navActions} withBottomTabs>
      {activeTab === 'calculator' && (
        <CalculatorPage
          onRecordDose={(dose) => injectionHistoryRef.current?.recordDose(dose)}
          onResultChange={setCurrentResult}
        />
      )}

      {activeTab === 'settings' && (
        <SettingsPage
          settings={settings}
          onMaxDoseChange={setMaxDoseWarningUnits}
          colorMode={colorMode}
          onToggleTheme={toggleColorMode}
          onOpenTypography={() => switchView('typography')}
        />
      )}

      {activeTab === 'history' && (
        <section className="history-page-shell" aria-label="Injection history">
          <header className="page-heading">
            <div className="heading-text">
              <h1>History</h1>
              <p className="eyebrow">RECORDED NOVOLOG</p>
              <p className="intro">Review, correct, or void entries on this device.</p>
            </div>
          </header>
        </section>
      )}

      <BottomTabBar
        active={activeTab}
        onChange={(tab) => {
          overlayManager.closeOverlay();
          switchView(tab);
        }}
      />
    </AppShell>
  );
}
