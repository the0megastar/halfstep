import type { ReactNode } from 'react';
import { Utensils, Droplet, CheckCircle2 } from 'lucide-react';
import { displayCompactUnits, type CalculationResult } from '../../../lib/dose';
import { PATIENT } from '../../../lib/patient';

export interface DoseBreakdownProps {
  result: CalculationResult;
  carbRatio: number;
}

export function DoseBreakdown({ result, carbRatio }: DoseBreakdownProps) {
  const foodFormula =
    result.carbs !== null ? (
      <>
        <span className="breakdown-formula-text formula-full text-copy-13">
          {result.carbs}g ÷ {carbRatio}
        </span>
        <span className="breakdown-formula-text formula-compact text-copy-13">
          {result.carbs}g ÷ {carbRatio}
        </span>
      </>
    ) : (
      <>
        <span className="breakdown-formula-text formula-full text-copy-13 dim">Carbs ÷ {carbRatio}</span>
        <span className="breakdown-formula-text formula-compact text-copy-13 dim">Carbs ÷ {carbRatio}</span>
      </>
    );

  // Low / over-max: keep formulas for checking, but do not present unit amounts like a dose
  const suppressPartUnits = result.isLowGlucose || result.exceedsMaxDose;

  const foodValue = suppressPartUnits ? (
    <span className="breakdown-value text-label-14 dim">—</span>
  ) : result.carbs !== null ? (
    <span className="breakdown-value text-label-14">{displayCompactUnits(result.food)}</span>
  ) : (
    <span className="breakdown-value text-label-14 dim">—</span>
  );

  let correctionFormula: ReactNode;
  let correctionValue: ReactNode;

  if (result.glucose === null) {
    correctionFormula = (
      <>
        <span className="breakdown-formula-text formula-full text-copy-13 dim">(BG − 150) ÷ {PATIENT.isf}</span>
        <span className="breakdown-formula-text formula-compact text-copy-13 dim">(BG−150) ÷ {PATIENT.isf}</span>
      </>
    );
    correctionValue = <span className="breakdown-value text-label-14 dim">—</span>;
  } else if (result.isLowGlucose) {
    correctionFormula = (
      <>
        <span className="breakdown-formula-text formula-full text-copy-13 text-low">Low (&lt; 70)</span>
        <span className="breakdown-formula-text formula-compact text-copy-13 text-low">Low</span>
      </>
    );
    correctionValue = <span className="breakdown-value text-label-14 text-low">0u</span>;
  } else if (result.belowTarget) {
    correctionFormula = (
      <>
        <span className="breakdown-formula-text formula-full text-copy-13">Below target (&lt; 150)</span>
        <span className="breakdown-formula-text formula-compact text-copy-13">No corr.</span>
      </>
    );
    correctionValue = <span className="breakdown-value text-label-14">0u</span>;
  } else {
    const delta = result.glucose - 150;
    correctionFormula = (
      <>
        <span className="breakdown-formula-text formula-full text-copy-13">
          ({result.glucose} − 150) ÷ {PATIENT.isf}
        </span>
        <span className="breakdown-formula-text formula-compact text-copy-13">
          {delta} ÷ {PATIENT.isf}
        </span>
      </>
    );
    correctionValue = (
      <span className="breakdown-value text-label-14">{displayCompactUnits(result.correction)}</span>
    );
  }

  if (result.exceedsMaxDose) {
    correctionValue = <span className="breakdown-value text-label-14 dim">—</span>;
  }

  return (
    <>
      <div className="breakdown-grid" role="list">
        <div className="breakdown-card" role="listitem">
          <div className="breakdown-row-top">
            <div className="breakdown-title text-heading-14">
              <Utensils size={14} aria-hidden="true" />
              <span className="label-full">Food Coverage</span>
              <span className="label-compact">Food</span>
            </div>
            {foodValue}
          </div>
          <div className="breakdown-row-bottom">{foodFormula}</div>
          <p className="breakdown-note text-copy-13">1 unit per {carbRatio} grams</p>
        </div>

        <div className="breakdown-card" role="listitem">
          <div className="breakdown-row-top">
            <div className="breakdown-title text-heading-14">
              <Droplet size={14} aria-hidden="true" />
              <span className="label-full">Correction Bolus</span>
              <span className="label-compact">Correction</span>
            </div>
            {correctionValue}
          </div>
          <div className="breakdown-row-bottom">{correctionFormula}</div>
          <p className="breakdown-note text-copy-13">
            {result.belowTarget ? 'No correction below 150' : `1 unit drops glucose ${PATIENT.isf}`}
          </p>
        </div>
      </div>


      {(result.glucose !== null || result.carbs !== null) && (
        <div className="teaching-box" aria-live="polite">
          <div className="teaching-header text-heading-14">
            <CheckCircle2 size={16} aria-hidden="true" />
            <span>How the Math Works</span>
          </div>
          <p className="teaching-sentence text-copy-13">{result.casualSentence}</p>
        </div>
      )}
    </>
  );
}
