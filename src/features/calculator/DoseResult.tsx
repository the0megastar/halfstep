import type { ReactNode } from 'react';
import { ClipboardPen } from 'lucide-react';
import { formatTeachingAmount, unitWord, type CalculationResult } from '../../../lib/dose';
import { estimateGlucoseAfterDose, formatEstimatedGlucose } from '../../../lib/estimate';
import { PATIENT } from '../../../lib/patient';

export interface DoseResultProps {
  result: CalculationResult;
  onRecordDose?: (dose: number) => void;
  children?: ReactNode;
  carbRatio?: number;
}

export function DoseResult({ result, onRecordDose, children, carbRatio }: DoseResultProps) {
  const isDoseAvailable =
    result.total !== null && result.rounding !== null && !result.exceedsMaxDose;
  const canRecord =
    isDoseAvailable && !result.isLowGlucose && !result.exceedsMaxDose && result.rounding!.rounded > 0;
  const doseUnits =
    isDoseAvailable && !result.isLowGlucose && !result.exceedsMaxDose
      ? result.rounding!.rounded
      : null;
  const estimate = estimateGlucoseAfterDose({
    glucose: result.glucose,
    carbs: result.carbs,
    doseUnits,
    carbRatio,
  });

  const handleRecord = () => {
    if (canRecord && onRecordDose) {
      onRecordDose(result.rounding!.rounded);
    }
  };

  return (
    <section className="card-surface result-panel" aria-labelledby="result-heading">
      <div className="card-header">
        <div>
          <span className="step-tag text-label-12">Step 2</span>
          <h2 id="result-heading" className="text-heading-20">
            Calculated Dose
          </h2>
        </div>
        <button
          type="button"
          className={`icon-badge-btn ${canRecord ? 'active' : ''}`}
          disabled={!canRecord}
          aria-disabled={!canRecord}
          onClick={handleRecord}
          title={
            canRecord
              ? `Log ${result.rounding!.rounded} ${unitWord(result.rounding!.rounded)} given`
              : 'Calculate a dose to log'
          }
          aria-label={
            canRecord
              ? `Log ${result.rounding!.rounded} ${unitWord(result.rounding!.rounded)} given`
              : 'Calculate a dose to log'
          }
        >
          <ClipboardPen size={18} strokeWidth={canRecord ? 2.25 : 1.75} />
        </button>
      </div>

      <div className="hero-dose-container">
        {result.isLowGlucose ? (
          <div className="dose-callout dose-low">
            <div className="hero-dose-number text-low">NO DOSE</div>
            <div className="dose-sublabel text-copy-14">
              Low glucose · Follow your hypoglycemia plan
            </div>
          </div>
        ) : result.exceedsMaxDose ? (
          <div className="dose-callout is-empty">
            <div className="hero-dose-number">—</div>
            <div className="dose-sublabel text-copy-14">
              Above locked maximum · Confirm the glucose and carb numbers
            </div>
          </div>
        ) : isDoseAvailable ? (
          <div className="dose-callout">
            <div className="dose-number-row">
              <span className="hero-dose-number">{result.rounding!.rounded.toFixed(1)}</span>
              <span className="hero-dose-unit text-heading-20">
                {unitWord(result.rounding!.rounded)}
              </span>
            </div>
            <div className="dose-meta-row">
              <span className="exact-text text-copy-13">
                Before rounding: <strong>{formatTeachingAmount(result.total)}</strong>
              </span>
            </div>
          </div>
        ) : (
          <div className="dose-callout is-empty">
            <div className="hero-dose-number">—</div>
            <div className="dose-sublabel text-copy-14">Glucose and carbs produce a dose here</div>
          </div>
        )}
      </div>

      {children}

      <div className="estimate-panel" aria-live="polite">
        <div className="estimate-main">
          <div className="estimate-label text-heading-14">Estimated Glucose After Dose</div>
          <div className="estimate-value text-heading-20">
            {estimate.complete ? (
              <>
                <strong>{formatEstimatedGlucose(estimate.estimatedGlucose)}</strong>
                <span className="estimate-unit text-label-12">mg/dL</span>
              </>
            ) : (
              <strong className="dim">—</strong>
            )}
          </div>
        </div>
        <p className="estimate-note text-copy-13">
          Uses carb ratio and ISF only. Does not include active IOB, absorption timing, or
          exercise.
        </p>
      </div>
    </section>
  );
}
