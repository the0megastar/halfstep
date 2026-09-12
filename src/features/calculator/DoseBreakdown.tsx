import React from 'react';
import { Utensils, Droplet, CheckCircle2 } from 'lucide-react';
import { displayUnits, type CalculationResult } from '../../../lib/dose';

function displayBreakdownUnits(value: number | null): string {
  const formatted = displayUnits(value);
  return value === null || formatted.startsWith('≈') ? formatted : `= ${formatted}`;
}

export interface DoseBreakdownProps {
  result: CalculationResult;
}

export function DoseBreakdown({ result }: DoseBreakdownProps) {
  return (
    <>
      {/* Step-by-Step Breakdown Cards */}
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
                <strong>{displayBreakdownUnits(result.food)} <small>u</small></strong>
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
                <strong className="text-low">= 0 <small>u</small></strong>
              </>
            ) : result.belowTarget ? (
              <>
                <span>Below target (&lt; 150)</span>
                <strong>= 0 <small>u</small></strong>
              </>
            ) : (
              <>
                <span>({result.glucose} &minus; 150) &divide; 135</span>
                <strong>{displayBreakdownUnits(result.correction)} <small>u</small></strong>
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

      {/* Dynamic Conversational Explanation Sentence */}
      <div className="teaching-box" aria-live="polite">
        <div className="teaching-header">
          <CheckCircle2 size={16} />
          <span>How the math works</span>
        </div>
        <p className="teaching-sentence">{result.casualSentence}</p>
      </div>
    </>
  );
}
