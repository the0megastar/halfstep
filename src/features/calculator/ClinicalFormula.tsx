import React from 'react';
import type { CalculationResult } from '../../../lib/dose';

export interface ClinicalFormulaProps {
  result: CalculationResult;
}

export function ClinicalFormula({ result }: ClinicalFormulaProps) {
  return (
    <>
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
    </>
  );
}
