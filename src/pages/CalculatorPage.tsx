import React, { useState } from 'react';
import { AlertCircle, AlertTriangle, Info, Type } from 'lucide-react';
import { calculate, type CalculationResult } from '../../lib/dose';
import { CalculatorInputs } from '../features/calculator/CalculatorInputs';
import { DoseResult } from '../features/calculator/DoseResult';
import { DoseBreakdown } from '../features/calculator/DoseBreakdown';
import { ClinicalFormula } from '../features/calculator/ClinicalFormula';

export interface CalculatorPageProps {
  onRecordDose?: (dose: number) => void;
  onSwitchToTypography?: () => void;
  onResultChange?: (result: CalculationResult) => void;
}

export function CalculatorPage({
  onRecordDose,
  onSwitchToTypography,
  onResultChange,
}: CalculatorPageProps) {
  const [glucose, setGlucose] = useState('');
  const [carbs, setCarbs] = useState('');

  const result: CalculationResult = calculate(glucose, carbs);
  const glucoseError = glucose.trim() !== '' && result.glucose === null;
  const carbsError = carbs.trim() !== '' && result.carbs === null;

  const handleClear = () => {
    setGlucose('');
    setCarbs('');
  };

  React.useEffect(() => {
    onResultChange?.(result);
  }, [result.total, result.rounding?.rounded, result.isLowGlucose]);

  return (
    <>
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
        <CalculatorInputs
          glucose={glucose}
          carbs={carbs}
          onGlucoseChange={setGlucose}
          onCarbsChange={setCarbs}
          onClear={handleClear}
          glucoseError={glucoseError}
          carbsError={carbsError}
        />

        {/* Column 2: Results & Dosage Panel with Breakdown */}
        <DoseResult result={result} onRecordDose={onRecordDose}>
          <DoseBreakdown result={result} />
        </DoseResult>
      </div>

      {/* Educational Formula Strip and Rounding Reference */}
      <ClinicalFormula result={result} />

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

        {onSwitchToTypography && (
          <div className="specimen-launch-bar">
            <button
              type="button"
              className="specimen-launch-btn"
              onClick={onSwitchToTypography}
            >
              <Type size={15} />
              <span>Explore Halfstep Typography System (25 Tiers)</span>
            </button>
          </div>
        )}
      </footer>
    </>
  );
}
