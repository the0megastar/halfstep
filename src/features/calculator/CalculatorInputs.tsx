import { Droplet, Utensils, RotateCcw } from 'lucide-react';
import { PATIENT, type CarbRatioContext } from '../../../lib/patient';

export interface CalculatorInputsProps {
  glucose: string;
  carbs: string;
  onGlucoseChange: (val: string) => void;
  onCarbsChange: (val: string) => void;
  onClear: () => void;
  glucoseError: boolean;
  carbsError: boolean;
  carbRatioContext: CarbRatioContext;
  onCarbRatioContextChange: (context: CarbRatioContext) => void;
}

export function CalculatorInputs({
  glucose,
  carbs,
  onGlucoseChange,
  onCarbsChange,
  onClear,
  glucoseError,
  carbsError,
  carbRatioContext,
  onCarbRatioContextChange,
}: CalculatorInputsProps) {
  const showClear = glucose !== '' || carbs !== '';

  return (
    <section className="card-surface entry-panel" aria-labelledby="inputs-heading">
      <div className="card-header">
        <div>
          <span className="step-tag text-label-12">Step 1</span>
          <h2 id="inputs-heading" className="text-heading-20">
            Enter the numbers
          </h2>
        </div>
        {showClear && (
          <button
            type="button"
            className="icon-badge-btn active"
            onClick={onClear}
            aria-label="Clear glucose and carbs"
            title="Clear"
          >
            <RotateCcw size={18} />
          </button>
        )}
      </div>

      <div className="input-fields">
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
              onChange={(e) => onGlucoseChange(e.target.value)}
              placeholder="e.g. 185"
              aria-invalid={glucoseError}
            />
            <span className="unit-pill">mg/dL</span>
          </div>
          {glucoseError && (
            <p className="field-error">Enter a valid positive glucose reading.</p>
          )}
        </div>

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
              onChange={(e) => onCarbsChange(e.target.value)}
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

          <div
            className="carb-ratio-segmented"
            role="radiogroup"
            aria-label="Carb ratio context"
          >
            <button
              type="button"
              role="radio"
              aria-checked={carbRatioContext === 'home'}
              className={`carb-ratio-segment${carbRatioContext === 'home' ? ' is-selected' : ''}`}
              onClick={() => onCarbRatioContextChange('home')}
            >
              Home · 1:{PATIENT.carbRatio}
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={carbRatioContext === 'school'}
              className={`carb-ratio-segment${carbRatioContext === 'school' ? ' is-selected' : ''}`}
              onClick={() => onCarbRatioContextChange('school')}
            >
              School · 1:{PATIENT.schoolCarbRatio}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
