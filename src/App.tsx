import React, { Suspense, useRef, useState } from 'react';
import { useTheme } from './app/useTheme';
import { useAppView } from './app/useAppView';
import { AppShell } from './app/AppShell';
import { BottomTabBar, isMainTab, type MainTab } from './app/BottomTabBar';
import { useOverlayManager } from './hooks/useOverlayManager';
import { CalculatorPage } from './pages/CalculatorPage';
import { SettingsPage } from './pages/SettingsPage';
import { HistoryPage, type HistoryPageHandle } from './pages/HistoryPage';
import InjectionHistory from './components/InjectionHistory';
import type { CalculationResult } from '../lib/dose';

/** Dev-only typography specimen; not linked from Settings in v0.2.0. */
const DesignSystemPage = React.lazy(() => import('./pages/DesignSystemPage'));

export default function App() {
  const { colorMode, preference, setThemePreference, toggleColorMode } = useTheme();
  const { view, switchView } = useAppView();
  const overlayManager = useOverlayManager();
  const historyRef = useRef<HistoryPageHandle>(null);
  const [currentResult, setCurrentResult] = useState<CalculationResult | null>(null);
  const [logEpoch, setLogEpoch] = useState(0);

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

  const activeTab: MainTab = isMainTab(view) ? view : 'calculator';

  const navActions = (
    <InjectionHistory
      key={logEpoch}
      isIobOpen={overlayManager.isIobOpen}
      onToggleIob={overlayManager.toggleIob}
      onCloseIob={overlayManager.closeOverlay}
      onOpenHistory={() => {
        overlayManager.closeOverlay();
        switchView('history');
      }}
    />
  );

  return (
    <AppShell
      navActions={navActions}
      withBottomTabs
      onBrandClick={() => {
        overlayManager.closeOverlay();
        switchView('calculator');
      }}
    >
      {activeTab === 'calculator' && (
        <CalculatorPage
          onDoseLogged={() => setLogEpoch((n) => n + 1)}
          onResultChange={setCurrentResult}
        />
      )}

      {activeTab === 'history' && (
        <HistoryPage
          ref={historyRef}
          suggestedDose={suggestedDose}
        />
      )}

      {activeTab === 'settings' && (
        <SettingsPage
          themePreference={preference}
          onThemePreferenceChange={setThemePreference}
        />
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
