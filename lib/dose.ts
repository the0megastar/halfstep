import { PATIENT, ROMAN } from './patient.ts';
export { PATIENT, ROMAN };


export type RoundingCategory = 'exact' | 'round-down' | 'round-half' | 'round-up';

export interface RoundingInfo {
  unrounded: number;
  rounded: number;
  whole: number;
  remainder: number;
  decimalText: string;
  ruleCategory: RoundingCategory;
  ruleLabel: string;
  explanation: string;
}

export function parseDecimal(raw: string, allowZero = true): number | null {
  const trimmed = raw.trim();
  if (!/^\d+(?:\.\d+)?$/.test(trimmed)) return null;
  const n = Number(trimmed);
  return Number.isFinite(n) && n <= Number.MAX_SAFE_INTEGER && (allowZero ? n >= 0 : n > 0) ? n : null;
}

/**
 * Roman's half-unit rounding rule:
 * - .1 to .3 remainder: round down to whole (.0)
 * - .4 to .7 remainder: round to half (.5)
 * - .8 to .9 remainder: round up to next whole (.0)
 */
export function calculateHalfStepRounding(total: number): RoundingInfo {
  const whole = Math.floor(total);
  const rawRemainder = total - whole;
  const remainder = Math.round(rawRemainder * 100) / 100;
  const decimalText = `.${rawRemainder.toFixed(2).split('.')[1]}`; // e.g. ".49"

  let rounded = whole;
  let ruleCategory: RoundingCategory = 'exact';
  let ruleLabel = '';
  let explanation = '';

  if (remainder < 0.05) {
    rounded = whole;
    ruleCategory = 'exact';
    ruleLabel = 'Exact whole unit';
    explanation = `That total is already a whole unit (${whole}u), so no half-unit rounding is needed.`;
  } else if (remainder >= 0.05 && remainder < 0.35) {
    rounded = whole;
    ruleCategory = 'round-down';
    ruleLabel = 'Round down (.1–.3)';
    explanation = `The leftover ${decimalText} is in the .1 to .3 range, so the dose rounds down to ${rounded.toFixed(1)} ${unitWord(rounded)}.`;
  } else if (remainder >= 0.35 && remainder < 0.75) {
    rounded = whole + 0.5;
    ruleCategory = 'round-half';
    ruleLabel = 'Round to half (.4–.7)';
    explanation = `The leftover ${decimalText} is in the .4 to .7 range, so the dose rounds to ${rounded.toFixed(1)} ${unitWord(rounded)}.`;
  } else {
    rounded = whole + 1.0;
    ruleCategory = 'round-up';
    ruleLabel = 'Round up (.8–.9)';
    explanation = `The leftover ${decimalText} is in the .8 to .9 range, so the dose rounds up to ${rounded.toFixed(1)} ${unitWord(rounded)}.`;
  }

  return {
    unrounded: total,
    rounded,
    whole,
    remainder,
    decimalText,
    ruleCategory,
    ruleLabel,
    explanation,
  };
}

export function displayUnits(n: number | null, precision = 3): string {
  if (n === null) return '—';
  const rounded = Number(n.toFixed(precision));
  const isApprox = Math.abs(rounded - n) > 1e-10;
  return `${isApprox ? '≈ ' : ''}${rounded.toLocaleString('en-US', { maximumFractionDigits: precision })}`;
}

/**
 * Compact unit label for dense math cards (Food / Correction).
 * No approximation marker; max 2 fraction digits; tight "u" suffix.
 * Keeps list-row trailing values short so they do not wrap on phone.
 */
export function displayCompactUnits(n: number | null): string {
  if (n === null || !Number.isFinite(n)) return '—';
  const rounded = Math.round(n * 100) / 100;
  const text = Number(rounded.toFixed(2)).toString();
  return `${text}u`;
}

/** Plain unit amount for teaching copy — no ≈ marker (avoids “exact ≈ …” contradictions). */
export function formatTeachingUnits(n: number | null, precision = 2): string {
  if (n === null || !Number.isFinite(n)) return '—';
  return Number(n.toFixed(precision)).toLocaleString('en-US', {
    maximumFractionDigits: precision,
  });
}

/** Singular for 0.5 and 1 (and their negatives); otherwise plural “units”. */
export function unitWord(n: number | null): string {
  if (n === null || !Number.isFinite(n)) return 'units';
  const abs = Math.abs(n);
  if (Math.abs(abs - 0.5) < 1e-9 || Math.abs(abs - 1) < 1e-9) return 'unit';
  return 'units';
}

/** Amount + unit/units for teaching sentences. */
export function formatTeachingAmount(n: number | null, precision = 2): string {
  if (n === null || !Number.isFinite(n)) return '—';
  return `${formatTeachingUnits(n, precision)} ${unitWord(n)}`;
}

export interface CalculationResult {
  glucose: number | null;
  carbs: number | null;
  food: number | null;
  correction: number | null;
  total: number | null;
  rounding: RoundingInfo | null;
  belowTarget: boolean;
  isLowGlucose: boolean;
  isHighGlucose: boolean;
  isHighCarbs: boolean;
  /** True when half-unit rounded math is above locked max — no suggested dose. */
  exceedsMaxDose: boolean;
  glucoseWarning: string | null;
  carbsWarning: string | null;
  casualSentence: string;
}


export function clampToMaxDose(units: number): number {
  const max = PATIENT.maxDoseUnits;
  if (!Number.isFinite(units) || units <= 0) return units;
  return Math.min(units, max);
}

export function calculate(
  glucoseRaw: string,
  carbsRaw: string,
  carbRatio: number = PATIENT.carbRatio
): CalculationResult {
  const glucose = parseDecimal(glucoseRaw, false);
  const carbs = parseDecimal(carbsRaw);

  const isLowGlucose = glucose !== null && glucose < ROMAN.lowGlucose;
  const isHighGlucose = glucose !== null && glucose > ROMAN.maxGlucose;
  const isHighCarbs = carbs !== null && carbs > ROMAN.highCarbs;

  const glucoseWarning = isLowGlucose
    ? `Glucose is ${glucose} mg/dL, under 70. Halfstep does not suggest insulin. Follow your hypoglycemia plan from your care team.`
    : isHighGlucose
    ? `Glucose is ${glucose} mg/dL, over 400. Confirm the reading and follow your care team plan for high glucose.`
    : null;

  const carbsWarning = isHighCarbs
    ? `Carbs are ${carbs} g, above the ${PATIENT.highCarbsGrams} g check gate in this build. Confirm the carb count.`
    : null;

  const food = carbs === null ? null : carbs / carbRatio;
  const belowTarget = glucose !== null && glucose < ROMAN.target;
  const correction = glucose === null || belowTarget ? null : (glucose - ROMAN.target) / ROMAN.sensitivity;

  let total: number | null = null;
  let rounding: RoundingInfo | null = null;
  let exceedsMaxDose = false;

  if (isLowGlucose) {
    // Suppress dose recommendation on severe low
    total = null;
    rounding = null;
  } else if (belowTarget && glucose !== null && carbs !== null) {
    // Below target but >= 70: food dose only, correction suppressed
    total = food;
    if (total !== null) {
      rounding = calculateHalfStepRounding(total);
    }
  } else if (food !== null && correction !== null) {
    total = food + correction;
    rounding = calculateHalfStepRounding(total);
  }

  // Over locked max: no suggested dose figure (hero / breakdown units blanked in UI)
  if (rounding !== null && rounding.rounded > PATIENT.maxDoseUnits) {
    exceedsMaxDose = true;
  }

  // How the Math Works: bridge live numbers to the idea
  let casualSentence = '';
  if (glucose === null && carbs === null) {
    casualSentence = '';
  } else if (isLowGlucose) {
    casualSentence = `Glucose is ${glucose} mg/dL, under 70. Halfstep does not suggest insulin at this reading. Follow your hypoglycemia plan from your care team.`;
  } else if (glucose === null) {
    casualSentence = `Food coverage for ${carbs}g of carbs is ${formatTeachingAmount(food)} (${carbs} ÷ ${carbRatio}). Correction still needs a glucose reading.`;
  } else if (carbs === null) {
    if (belowTarget) {
      casualSentence = `At ${glucose} mg/dL, glucose is below the 150 target, so correction is 0. Food coverage still needs a carb count.`;
    } else {
      const diff = glucose - ROMAN.target;
      casualSentence = `At ${glucose} mg/dL (${diff} over the 150 target), correction is ${formatTeachingAmount(correction)} (${diff} ÷ 135). Food coverage still needs a carb count.`;
    }
  } else if (exceedsMaxDose) {
    casualSentence =
      `The half-unit math is above the locked maximum of ${PATIENT.maxDoseUnits} units. Confirm the glucose and carb numbers. Halfstep does not log a dose over that maximum.`;
  } else if (total !== null && rounding !== null) {
    const dose = rounding.rounded.toFixed(1);
    const hasFood = carbs !== null && carbs > 0;
    if (belowTarget || correction === null) {
      casualSentence =
        `The dose is ${dose} ${unitWord(rounding.rounded)}. Food coverage is ${formatTeachingAmount(food)} from ${carbs}g ÷ ${carbRatio}. At ${glucose} mg/dL, glucose is below the 150 target, so correction is 0. That is ${formatTeachingAmount(total)} before half-unit rounding. ${rounding.explanation}`.trim();
    } else if (!hasFood) {
      // Correction-only (0 g carbs): skip a useless “food coverage is 0 from 0g ÷ …” line
      casualSentence =
        `The dose is ${dose} ${unitWord(rounding.rounded)}. Correction is ${formatTeachingAmount(correction)} from (${glucose} − 150) ÷ 135. That is ${formatTeachingAmount(total)} before half-unit rounding. ${rounding.explanation}`.trim();
    } else {
      const beforeRound = food! + correction!;
      casualSentence =
        `The dose is ${dose} ${unitWord(rounding.rounded)}. Food coverage is ${formatTeachingAmount(food)} from ${carbs}g ÷ ${carbRatio}. Correction is ${formatTeachingAmount(correction)} from (${glucose} − 150) ÷ 135. Those add to ${formatTeachingAmount(beforeRound)} before half-unit rounding. ${rounding.explanation}`.trim();
    }
  }

  return {
    glucose,
    carbs,
    food,
    correction,
    total,
    rounding,
    belowTarget,
    isLowGlucose,
    isHighGlucose,
    isHighCarbs,
    exceedsMaxDose,
    glucoseWarning,
    carbsWarning,
    casualSentence,
  };
}
