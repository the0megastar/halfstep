import type { ReactNode } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { displayUnits, type CalculationResult } from '../../../lib/dose';

export interface DoseResultProps {
  result: CalculationResult;
  onRecordDose?: (dose: number) => void;
  children?: ReactNode;
}

export function DoseResult({ result, onRecordDose, children }: DoseResultProps) {
  const isDoseAvailable = result.total !== null && result.rounding !== null;
  const canRecord = isDoseAvailable && !result.isLowGlucose && result.rounding!.rounded > 0;

  const handleRecord = () => {
    if (canRecord && onRecordDose) {
      onRecordDose(result.rounding!.rounded);
    }
  };

  return (
    <section className="card-surface result-panel" aria-labelledby="result-heading">
      <div className="card-header">
        <div>
          <span className="step-tag">STEP 02</span>
          <h2 id="result-heading">Calculated Dose</h2>
        </div>
        <button
          type="button"
          className={`icon-badge-btn ${canRecord ? 'active' : ''}`}
          disabled={!canRecord}
          onClick={handleRecord}
          title={
            canRecord
              ? `Record ${result.rounding!.rounded} units administered`
              : 'Calculate a dose to record an injection'
          }
          aria-label={
            canRecord
              ? `Record ${result.rounding!.rounded} units administered`
              : 'Calculate a dose to record an injection'
          }
        >
          <ArrowUpRight size={18} />
        </button>
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

      {children}
    </section>
  );
}
