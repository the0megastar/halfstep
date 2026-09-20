import type { CalculationResult } from '../../../lib/dose';
import { PATIENT } from '../../../lib/patient';

export interface ClinicalFormulaProps {
  result: CalculationResult;
  carbRatio: number;
}

export function ClinicalFormula({ result, carbRatio }: ClinicalFormulaProps) {
  return (
    <section className="math-teaching-group" aria-label="Dose math teaching">
      <div className="math-teaching-intro">
        <span className="step-tag text-label-12">Step 3</span>
        <h2 className="text-heading-20">Learn the Math</h2>
        <p className="text-copy-13">
          A dose is built from two amounts: food coverage for carbs, and correction when
          glucose is above target. Add them for a total, then round that total to a half unit
          so it matches what the syringe can deliver.
        </p>
      </div>

      <div className="math-teaching-steps">
        <section className="math-teaching-step" aria-labelledby="dose-built-heading">
          <h3 id="dose-built-heading" className="text-heading-14 math-teaching-step-title">
            How the Dose Is Built
          </h3>

          <div className="latex-formula-card">
            <div
              className="latex-math"
              role="math"
              aria-label={`Dose equals Carbs over ${carbRatio} plus Glucose minus 150 over ${PATIENT.isf}`}
            >
              <span className="math-var">Dose</span>
              <span className="math-op">=</span>

              <div className="math-fraction">
                <span className="math-num">Carbs</span>
                <span className="math-den">{carbRatio}</span>
              </div>

              <span className="math-op">+</span>

              <div className="math-fraction">
                <span className="math-num">Glucose &minus; 150</span>
                <span className="math-den">{PATIENT.isf}</span>
              </div>
            </div>
          </div>
        </section>

        <section className="math-teaching-step" aria-labelledby="rounding-guide-heading">
          <h3 id="rounding-guide-heading" className="text-heading-14 math-teaching-step-title">
            Half-Unit Rounding Guide
          </h3>

          <div className="ref-rules">
            <div
              className={`ref-item ${result.rounding?.ruleCategory === 'round-down' ? 'is-active' : ''}`}
            >
              <div className="text-label-12 ref-tag">.1 to .3</div>
              <strong className="text-label-14 ref-action">Round Down</strong>
              <p className="text-copy-13 ref-desc ref-desc--example">
                to whole unit (e.g. 1.2 &rarr; 1.0u)
              </p>
            </div>
            <div
              className={`ref-item ${result.rounding?.ruleCategory === 'round-half' ? 'is-active' : ''}`}
            >
              <div className="text-label-12 ref-tag">.4 to .7</div>
              <strong className="text-label-14 ref-action">Round to Half</strong>
              <p className="text-copy-13 ref-desc ref-desc--example">
                to half unit (e.g. 1.5 &rarr; 1.5u, 1.4 &rarr; 1.5u)
              </p>
            </div>
            <div
              className={`ref-item ${result.rounding?.ruleCategory === 'round-up' ? 'is-active' : ''}`}
            >
              <div className="text-label-12 ref-tag">.8 to .9</div>
              <strong className="text-label-14 ref-action">Round Up</strong>
              <p className="text-copy-13 ref-desc ref-desc--example">
                to next whole unit (e.g. 1.8 &rarr; 2.0u)
              </p>
            </div>
          </div>
        </section>
      </div>
    </section>
  );
}
