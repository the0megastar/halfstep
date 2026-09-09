import React, { useState, useEffect, useRef } from 'react';
import {
  Droplet,
  Utensils,
  RotateCcw,
  AlertTriangle,
  AlertCircle,
  SlidersHorizontal,
  ArrowUpRight,
  Info,
  CheckCircle2,
  Sun,
  Moon,
  Lock,
} from 'lucide-react';
import {
  calculate,
  displayUnits,
  ROMAN,
  type CalculationResult,
} from '../lib/dose';

export default function App() {
  const [colorMode, setColorMode] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('halfstep-theme');
      if (saved === 'light' || saved === 'dark') return saved;
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    }
    return 'light';
  });

  const [glucose, setGlucose] = useState('');
  const [carbs, setCarbs] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', colorMode);
    localStorage.setItem('halfstep-theme', colorMode);
  }, [colorMode]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setIsSettingsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsSettingsOpen(false);
      }
    };
    if (isSettingsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSettingsOpen]);

  const toggleColorMode = () => {
    setColorMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const result: CalculationResult = calculate(glucose, carbs);
  const glucoseError = glucose.trim() !== '' && result.glucose === null;
  const carbsError = carbs.trim() !== '' && result.carbs === null;

  const handleClear = () => {
    setGlucose('');
    setCarbs('');
  };

  const isDoseAvailable = result.total !== null && result.rounding !== null;

  return (
    <div className="site glyph">
      {/* Top navigation bar */}
      <header className="topbar" role="banner">
        <div className="topbar-inner">
          <div className="brand">
            <span className="brand-mark" aria-hidden="true">½</span>
            <span className="brand-name">
              halfstep<span className="brand-dot">.</span>
            </span>
          </div>

          <div className="nav-actions">
            {/* Prescribed Settings Dropdown */}
            <div className="settings-dropdown-wrapper" ref={settingsRef}>
              <button
                type="button"
                className={`nav-btn settings-toggle-btn ${isSettingsOpen ? 'active' : ''}`}
                onClick={() => setIsSettingsOpen((prev) => !prev)}
                title="Prescribed clinical settings (Locked)"
                aria-label="Prescribed clinical settings (Locked)"
                aria-expanded={isSettingsOpen}
                aria-haspopup="dialog"
              >
                <SlidersHorizontal size={18} />
              </button>

              {isSettingsOpen && (
                <div
                  className="settings-dropdown-panel"
                  role="dialog"
                  aria-label="Prescribed Clinical Settings"
                >
                  <div className="dropdown-header">
                    <div className="dropdown-header-main">
                      <span className="dropdown-title">Prescribed Settings</span>
                      <span className="chip chip-locked">Locked</span>
                    </div>
                    <span className="dropdown-subtitle">Roman’s Physician-Signed Orders</span>
                  </div>

                  <div className="dropdown-metric-list">
                    <div className="dropdown-metric-row">
                      <div className="dropdown-metric-text">
                        <span className="dropdown-metric-name">Carb Ratio</span>
                        <span className="dropdown-metric-caption">1 unit per 35g carbs</span>
                      </div>
                      <span className="dropdown-metric-val">1 u : 35 g</span>
                    </div>

                    <div className="dropdown-metric-row">
                      <div className="dropdown-metric-text">
                        <span className="dropdown-metric-name">Sensitivity (ISF)</span>
                        <span className="dropdown-metric-caption">1 unit drops 135 mg/dL</span>
                      </div>
                      <span className="dropdown-metric-val">135 mg/dL</span>
                    </div>

                    <div className="dropdown-metric-row">
                      <div className="dropdown-metric-text">
                        <span className="dropdown-metric-name">Target Glucose</span>
                        <span className="dropdown-metric-caption">Correct if &ge; 150 mg/dL</span>
                      </div>
                      <span className="dropdown-metric-val">150 mg/dL</span>
                    </div>

                    <div className="dropdown-metric-row">
                      <div className="dropdown-metric-text">
                        <span className="dropdown-metric-name">Dosing Increment</span>
                        <span className="dropdown-metric-caption">Half-unit rounding</span>
                      </div>
                      <span className="dropdown-metric-val">0.5 unit</span>
                    </div>
                  </div>

                  <div className="dropdown-footer">
                    <Lock size={12} className="dropdown-lock-icon" />
                    <span>Parameters are locked to physician orders</span>
                  </div>
                </div>
              )}
            </div>

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
          </div>
        </div>
      </header>

      {/* Main content container */}
      <main className="workspace">
        {/* Page title area */}
        <section className="page-heading">
          <div className="heading-text">
            <h1>Roman<span>.</span></h1>
            <p className="eyebrow">PEDIATRIC MDI ARITHMETIC</p>
            <p className="intro">
              Double-check insulin calculations with step-by-step math.
            </p>
          </div>
        </section>

        {/* Clinical alerts if triggered */}
        {result.isLowGlucose && (
          <div className="alert-banner alert-critical" role="alert">
            <AlertCircle size={22} />
            <div>
              <h4>Hold on — Blood Sugar is Low ({result.glucose} mg/dL)</h4>
              <p>
                I wouldn't recommend dosing on a low reading (under 70). Give fast-acting carbs
                first (like 4 oz juice or glucose tabs) and follow Roman’s school hypoglycemia plan!
              </p>
            </div>
          </div>
        )}

        {result.isHighGlucose && (
          <div className="alert-banner alert-warning" role="alert">
            <AlertTriangle size={22} />
            <div>
              <h4>Unusually High Glucose ({result.glucose} mg/dL)</h4>
              <p>
                Whoa, double-check that meter reading. If Roman is really over 400, follow his
                high-glucose school orders and check for urine/blood ketones.
              </p>
            </div>
          </div>
        )}

        {result.isHighCarbs && (
          <div className="alert-banner alert-caution" role="alert">
            <Info size={22} />
            <div>
              <h4>High Carb Count ({result.carbs} grams)</h4>
              <p>
                That’s over 100g of carbs! Are you sure about this count? Take a quick second look
                at his lunchbox, tray, or food label.
              </p>
            </div>
          </div>
        )}

        {/* Two-column responsive calculator layout */}
        <div className="calculator-layout">
          {/* Column 1: Input Panel */}
          <section className="card-surface entry-panel" aria-labelledby="inputs-heading">
            <div className="card-header">
              <div>
                <span className="step-tag">STEP 01</span>
                <h2 id="inputs-heading">Enter the numbers</h2>
              </div>
              {(glucose !== '' || carbs !== '') && (
                <button
                  type="button"
                  className="btn btn-primary btn-clear"
                  onClick={handleClear}
                  aria-label="Clear all inputs"
                >
                  <RotateCcw size={14} />
                  <span>Clear</span>
                </button>
              )}
            </div>

            <div className="input-fields">
              {/* Glucose Field */}
              <div className="field-group">
                <label htmlFor="input-glucose">
                  <Droplet size={17} className="field-icon" />
                  <span className="label-full">Current Glucose</span>
                  <span className="label-compact">Glucose</span>
                </label>
                <div className={`input-container ${glucoseError ? 'has-error' : ''}`}>
                  <input
                    id="input-glucose"
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck={false}
                    value={glucose}
                    onChange={(e) => setGlucose(e.target.value)}
                    placeholder="e.g. 185"
                    aria-invalid={glucoseError}
                  />
                  <span className="unit-pill">mg/dL</span>
                </div>
                {glucoseError && (
                  <p className="field-error">Enter a valid positive glucose reading.</p>
                )}
              </div>

              {/* Carbs Field */}
              <div className="field-group">
                <label htmlFor="input-carbs">
                  <Utensils size={17} className="field-icon" />
                  <span className="label-full">Total Carbohydrates</span>
                  <span className="label-compact">Carbs</span>
                </label>
                <div className={`input-container ${carbsError ? 'has-error' : ''}`}>
                  <input
                    id="input-carbs"
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck={false}
                    value={carbs}
                    onChange={(e) => setCarbs(e.target.value)}
                    placeholder="e.g. 45"
                    aria-invalid={carbsError}
                  />
                  <span className="unit-pill">
                    <span className="unit-full">grams</span>
                    <span className="unit-compact">g</span>
                  </span>
                </div>
                {carbsError && (
                  <p className="field-error">Enter zero or a positive number of grams.</p>
                )}
              </div>
            </div>

            <div className="quick-help">
              <p>
                💡 <strong>Tip:</strong> Enter glucose &amp; carbs. Updates instantly.
              </p>
            </div>
          </section>

          {/* Column 2: Results & Dosage Panel */}
          <section className="card-surface result-panel" aria-labelledby="result-heading">
            <div className="card-header">
              <div>
                <span className="step-tag">STEP 02</span>
                <h2 id="result-heading">Calculated Dose</h2>
              </div>
              <span className="icon-badge">
                <ArrowUpRight size={18} />
              </span>
            </div>

            {/* Main Dose Display */}
            <div className="hero-dose-container">
              {result.isLowGlucose ? (
                <div className="dose-callout dose-low">
                  <div className="hero-dose-number text-low">NO DOSE</div>
                  <div className="dose-sublabel">Hypoglycemia alert · Treat low blood sugar</div>
                </div>
              ) : isDoseAvailable ? (
                <div className="dose-callout">
                  <div className="dose-number-row">
                    <span className="hero-dose-number">
                      {result.rounding!.rounded.toFixed(1)}
                    </span>
                    <span className="hero-dose-unit">units</span>
                  </div>

                  <div className="dose-meta-row">
                    <span className="exact-text">
                      Exact math: <strong>{displayUnits(result.total)} units</strong>
                    </span>
                  </div>
                </div>
              ) : (
                <div className="dose-callout is-empty">
                  <div className="hero-dose-number">—</div>
                  <div className="dose-sublabel">Enter glucose & carbs to calculate dose</div>
                </div>
              )}
            </div>

            {/* Step-by-Step Breakdown Cards - Critical numbers directly under dose */}
            <div className="breakdown-grid">
              {/* Food Bolus Breakdown */}
              <div className="breakdown-card">
                <div className="breakdown-title">
                  <Utensils size={14} />
                  <span>Food Coverage</span>
                </div>
                <div className="breakdown-formula">
                  {result.carbs !== null ? (
                    <>
                      <span>{result.carbs}g &divide; 35</span>
                      <strong>{displayUnits(result.food)} <small>u</small></strong>
                    </>
                  ) : (
                    <>
                      <span className="dim">Carbs &divide; 35</span>
                      <strong className="dim">—</strong>
                    </>
                  )}
                </div>
                <small className="breakdown-note">1 unit per 35 grams</small>
              </div>

              {/* Correction Bolus Breakdown */}
              <div className="breakdown-card">
                <div className="breakdown-title">
                  <Droplet size={14} />
                  <span>Correction Bolus</span>
                </div>
                <div className="breakdown-formula">
                  {result.glucose === null ? (
                    <>
                      <span className="dim">(BG &minus; 150) &divide; 135</span>
                      <strong className="dim">—</strong>
                    </>
                  ) : result.isLowGlucose ? (
                    <>
                      <span className="text-low">Low (&lt; 70)</span>
                      <strong className="text-low">0 <small>u</small></strong>
                    </>
                  ) : result.belowTarget ? (
                    <>
                      <span>Below target (&lt; 150)</span>
                      <strong>0 <small>u</small></strong>
                    </>
                  ) : (
                    <>
                      <span>({result.glucose} &minus; 150) &divide; 135</span>
                      <strong>{displayUnits(result.correction)} <small>u</small></strong>
                    </>
                  )}
                </div>
                <small className="breakdown-note">
                  {result.belowTarget
                    ? 'No correction below 150'
                    : '1 unit drops glucose 135'}
                </small>
              </div>
            </div>

            {/* Dynamic Conversational Explanation Sentence - Under breakdown */}
            <div className="teaching-box" aria-live="polite">
              <div className="teaching-header">
                <CheckCircle2 size={16} />
                <span>How the math works</span>
              </div>
              <p className="teaching-sentence">{result.casualSentence}</p>
            </div>
          </section>
        </div>

        {/* Educational Formula Strip - Rendered like LaTeX math */}
        <section className="formula-section" aria-label="Clinical formula in mathematical notation">
          <div className="formula-label">
            <span className="eyebrow">THE CLINICAL FORMULA</span>
            <h3>Simple, predictable math.</h3>
          </div>

          <div className="latex-formula-card">
            <div className="latex-math" role="math" aria-label="Dose equals Carbs over 35 plus Glucose minus 150 over 135">
              <span className="math-var">Dose</span>
              <span className="math-op">=</span>

              <div className="math-fraction">
                <span className="math-num">Carbs</span>
                <span className="math-den">35</span>
              </div>

              <span className="math-op">+</span>

              <div className="math-fraction">
                <span className="math-num">Glucose &minus; 150</span>
                <span className="math-den">135</span>
              </div>
            </div>

            <p className="math-annotation">
              Calculate total exact sum first &middot; Round to nearest 0.5 unit
            </p>
          </div>
        </section>

        {/* Half-unit rounding guide reference */}
        <section className="rounding-reference" aria-label="Half-unit rounding rule explanation">
          <div className="ref-header">
            <h4>Roman’s Half-Unit Rounding Guide</h4>
            <p>Always complete all arithmetic first before applying half-unit rounding.</p>
          </div>
          <div className="ref-rules">
            <div className={`ref-item ${result.rounding?.ruleCategory === 'round-down' ? 'is-active' : ''}`}>
              <div className="ref-tag">.1 to .3</div>
              <div className="ref-desc">
                <strong>Round Down</strong> to whole unit (e.g. 1.2 &rarr; 1.0u)
              </div>
            </div>
            <div className={`ref-item ${result.rounding?.ruleCategory === 'round-half' ? 'is-active' : ''}`}>
              <div className="ref-tag">.4 to .7</div>
              <div className="ref-desc">
                <strong>Round to Half</strong> unit (e.g. 1.5 &rarr; 1.5u, 1.4 &rarr; 1.5u)
              </div>
            </div>
            <div className={`ref-item ${result.rounding?.ruleCategory === 'round-up' ? 'is-active' : ''}`}>
              <div className="ref-tag">.8 to .9</div>
              <div className="ref-desc">
                <strong>Round Up</strong> to next whole unit (e.g. 1.8 &rarr; 2.0u)
              </div>
            </div>
          </div>
        </section>

        {/* Footnote & Safety Plan Guidance */}
        <footer className="footer-disclaimer">
          <p>
            <strong>Safety Notice:</strong> This tool is an arithmetic teaching aid and
            math double-checker. Always follow physician-signed school diabetes medical
            management plan (DMMP) or 504 plan. Active insulin on board (IOB), exercise, illness,
            or ketones must be evaluated per his doctor’s written orders.
          </p>
          <p>
            No external tracking. Calculations are done 100% locally in your browser and work
            without an internet connection.
          </p>
        </footer>
      </main>
    </div>
  );
}
