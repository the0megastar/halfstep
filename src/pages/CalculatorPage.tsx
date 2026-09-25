import React, { useEffect, useState } from 'react';
import { AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { calculate, type CalculationResult } from '../../lib/dose';
import { PATIENT, CARB_RATIOS, type CarbRatioContext } from '../../lib/patient';
import { createInjection, generateUUID } from '../../lib/injections';
import { saveInjection } from '../../lib/storage';
import { CalculatorInputs } from '../features/calculator/CalculatorInputs';
import { DoseResult } from '../features/calculator/DoseResult';
import { DoseBreakdown } from '../features/calculator/DoseBreakdown';
import { ClinicalFormula } from '../features/calculator/ClinicalFormula';
import { PageHeader } from '../components/ui/PageHeader';

export interface CalculatorPageProps {
  /** Fired after a dose is saved on this page (stays on Calculate). */
  onDoseLogged?: () => void;
  onResultChange?: (result: CalculationResult) => void;
}

export function CalculatorPage({ onDoseLogged, onResultChange }: CalculatorPageProps) {
  const [glucose, setGlucose] = useState('');
  const [carbs, setCarbs] = useState('');
  const [carbRatioContext, setCarbRatioContext] = useState<CarbRatioContext>('home');
  const [pendingDose, setPendingDose] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [justLogged, setJustLogged] = useState(false);

  const activeCarbRatio = CARB_RATIOS[carbRatioContext];
  const result: CalculationResult = calculate(glucose, carbs, activeCarbRatio);
  const glucoseError = glucose.trim() !== '' && result.glucose === null;
  const carbsError = carbs.trim() !== '' && result.carbs === null;

  const handleClear = () => {
    setGlucose('');
    setCarbs('');
    setJustLogged(false);
  };

  useEffect(() => {
    onResultChange?.(result);
  }, [result.total, result.rounding?.rounded, result.isLowGlucose]);

  useEffect(() => {
    const open = pendingDose != null;
    document.body.classList.toggle('confirm-dialog-open', open);
    return () => document.body.classList.remove('confirm-dialog-open');
  }, [pendingDose]);

  const requestRecord = (dose: number) => {
    setSaveError(null);
    setJustLogged(false);
    setPendingDose(dose);
  };

  const cancelRecord = () => {
    if (saving) return;
    setPendingDose(null);
    setSaveError(null);
  };

  const confirmRecord = async () => {
    if (pendingDose == null || saving) return;
    setSaving(true);
    setSaveError(null);
    try {
      const glucoseRaw = glucose.trim();
      const carbsRaw = carbs.trim();
      const glucoseMgDl = glucoseRaw === '' ? null : Number(glucoseRaw);
      const carbsGrams = carbsRaw === '' ? null : Number(carbsRaw);
      const record = createInjection(generateUUID(), {
        units: pendingDose,
        administeredAt: new Date().toISOString(),
        glucoseMgDl:
          glucoseMgDl !== null && Number.isFinite(glucoseMgDl) ? glucoseMgDl : null,
        carbsGrams: carbsGrams !== null && Number.isFinite(carbsGrams) ? carbsGrams : null,
        carbRatio: activeCarbRatio,
      });
      await saveInjection(record);
      setPendingDose(null);
      setJustLogged(true);
      onDoseLogged?.();
    } catch (e) {
      setSaveError((e as Error).message || 'Could not save this dose.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="calculator-page">
      <PageHeader
        title={
          <>
            {PATIENT.name}
            <span className="page-header-accent">.</span>
          </>
        }
        intro="Double-check insulin math with clear, step-by-step arithmetic."
      />

{justLogged && (
        <p className="local-notice text-copy-13" role="status">
          Dose logged on this device. It appears in History and IOB.
        </p>
      )}

      {(result.isLowGlucose ||
        result.isHighGlucose ||
        result.isHighCarbs ||
        result.exceedsMaxDose) && (
        <div className="alert-stack">
          {result.isLowGlucose && (
            <div className="alert-banner alert-critical" role="alert">
              <AlertCircle size={24} />
              <div>
                <h4>Glucose is low ({result.glucose} mg/dL)</h4>
                <p>
                  Halfstep does not suggest insulin at or below {PATIENT.lowGlucoseMgDl} mg/dL.
                  Follow your hypoglycemia plan from your care team.
                </p>
              </div>
            </div>
          )}

          {result.isHighGlucose && (
            <div className="alert-banner alert-warning" role="alert">
              <AlertTriangle size={24} />
              <div>
                <h4>Unusually high glucose ({result.glucose} mg/dL)</h4>
                <p>
                  Confirm the meter or CGM reading. When glucose is this high, follow your care
                  team plan for high glucose and ketone checks.
                </p>
              </div>
            </div>
          )}

          {result.isHighCarbs && (
            <div className="alert-banner alert-caution" role="alert">
              <Info size={24} />
              <div>
                <h4>Large carb amount ({result.carbs} grams)</h4>
                <p>
                  That is above the {PATIENT.highCarbsGrams} g check gate in this build. Confirm
                  the carb count.
                </p>
              </div>
            </div>
          )}

          {result.exceedsMaxDose && !result.isLowGlucose && (
            <div className="alert-banner alert-warning" role="alert">
              <AlertTriangle size={24} />
              <div>
                <h4>Above locked maximum ({PATIENT.maxDoseUnits} units)</h4>
                <p>
                  The half-unit math is above this build’s locked maximum. Confirm the glucose and
                  carb numbers.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="calculator-layout">
        <CalculatorInputs
          glucose={glucose}
          carbs={carbs}
          onGlucoseChange={setGlucose}
          onCarbsChange={setCarbs}
          onClear={handleClear}
          glucoseError={glucoseError}
          carbsError={carbsError}
          carbRatioContext={carbRatioContext}
          onCarbRatioContextChange={setCarbRatioContext}
        />

        <DoseResult result={result} onRecordDose={requestRecord} carbRatio={activeCarbRatio}>
          <DoseBreakdown result={result} carbRatio={activeCarbRatio} />
        </DoseResult>
      </div>

      <ClinicalFormula result={result} carbRatio={activeCarbRatio} />

      <footer className="footer-disclaimer">
        <p>
          <strong>Safety Notice:</strong> Halfstep is a math helper for learning and checking
          insulin arithmetic. It is not a medical device and does not replace your care team,
          your meter or CGM, or on-label device instructions. Always verify glucose and dose
          decisions with your own plan before acting.
        </p>
        <p>
          Entries stay on this device. Halfstep does not sync dose history to the cloud. You are
          responsible for what you enter and what insulin is given.
        </p>
      </footer>

      {pendingDose != null && (
        <div
          className="confirm-dialog-backdrop"
          role="presentation"
          onClick={(e) => {
            if (e.target === e.currentTarget) cancelRecord();
          }}
        >
          <div
            className="confirm-dialog card-surface"
            role="dialog"
            aria-modal="true"
            aria-labelledby="log-dose-title"
          >
            <h2 id="log-dose-title" className="text-heading-16">
              Log this dose?
            </h2>
            <dl className="confirm-review confirm-review--dialog">
              <div className="confirm-row">
                <dt>Dose</dt>
                <dd>
                  {pendingDose.toFixed(1)} units {PATIENT.insulinName}
                </dd>
              </div>
              <div className="confirm-row">
                <dt>Glucose</dt>
                <dd>{glucose.trim() ? `${glucose.trim()} mg/dL` : '—'}</dd>
              </div>
              <div className="confirm-row">
                <dt>Carbs</dt>
                <dd>{carbs.trim() ? `${carbs.trim()} g` : '—'}</dd>
              </div>
            </dl>
            <p className="text-copy-13 confirm-note">
              Saves on this device with the current time.
            </p>
            {saveError && (
              <p className="history-error" role="alert">
                {saveError}
              </p>
            )}
            <div className="confirm-dialog-actions"><button
                type="button"
                className="btn-ghost"
                onClick={cancelRecord}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={() => void confirmRecord()}
                disabled={saving}
              >
                {saving ? 'Saving…' : 'Log'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
