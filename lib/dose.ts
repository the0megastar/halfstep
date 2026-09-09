/**
 * Roman's Clinical Settings (Prescribed by his doctor).
 * Hardcoded and immutable to ensure patient safety.
 */
export const ROMAN = Object.freeze({
  ratio: 35,          // 1 unit of insulin per 35 grams of carbohydrates
  sensitivity: 135,   // 1 unit of insulin lowers blood glucose by 135 mg/dL (ISF)
  target: 150,        // Target blood glucose (mg/dL)
  maxGlucose: 400,    // Glucose over 400 is unusually high; prompts double-check & ketone warning
  lowGlucose: 70,     // Glucose under 70 is hypoglycemia; prompts no-dose alert
  highCarbs: 100,     // Carbs over 100g prompts a casual sanity check
});

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
  const decimalText = rawRemainder.toFixed(3).substring(1); // e.g. ".486"

  let rounded = whole;
  let ruleCategory: RoundingCategory = 'exact';
  let ruleLabel = '';
  let explanation = '';

  if (remainder < 0.05) {
    rounded = whole;
    ruleCategory = 'exact';
    ruleLabel = 'Exact whole unit';
    explanation = `Exact match (${whole}u). No rounding needed.`;
  } else if (remainder >= 0.05 && remainder < 0.35) {
    rounded = whole;
    ruleCategory = 'round-down';
    ruleLabel = 'Round down (.1–.3)';
    explanation = `The decimal (${decimalText}) falls in the .1–.3 range, so round down to ${rounded.toFixed(1)} units.`;
  } else if (remainder >= 0.35 && remainder < 0.75) {
    rounded = whole + 0.5;
    ruleCategory = 'round-half';
    ruleLabel = 'Round to half (.4–.7)';
    explanation = `The decimal (${decimalText}) falls in the .4–.7 range, so round to the half-unit mark: ${rounded.toFixed(1)} units.`;
  } else {
    rounded = whole + 1.0;
    ruleCategory = 'round-up';
    ruleLabel = 'Round up (.8–.9)';
    explanation = `The decimal (${decimalText}) falls in the .8–.9 range, so round up to ${rounded.toFixed(1)} units.`;
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
  glucoseWarning: string | null;
  carbsWarning: string | null;
  casualSentence: string;
}

export function calculate(glucoseRaw: string, carbsRaw: string): CalculationResult {
  const glucose = parseDecimal(glucoseRaw, false);
  const carbs = parseDecimal(carbsRaw);

  const isLowGlucose = glucose !== null && glucose < ROMAN.lowGlucose;
  const isHighGlucose = glucose !== null && glucose > ROMAN.maxGlucose;
  const isHighCarbs = carbs !== null && carbs > ROMAN.highCarbs;

  const glucoseWarning = isLowGlucose
    ? `Hold on — blood sugar is ${glucose} mg/dL, which is under 70. I wouldn't dose on a low! Treat the low with fast-acting carbs first (like juice) and check Roman's school plan.`
    : isHighGlucose
    ? `Whoa, double-check that glucose (${glucose} mg/dL). Over 400 is unusually high. If this is accurate, check for ketones and follow his school emergency plan.`
    : null;

  const carbsWarning = isHighCarbs
    ? `That's ${carbs}g of carbs (over 100g)! Are you sure about this count? Take a quick look at Roman's lunchbox or plate to double-check.`
    : null;

  const food = carbs === null ? null : carbs / ROMAN.ratio;
  const belowTarget = glucose !== null && glucose < ROMAN.target;
  const correction = glucose === null || belowTarget ? null : (glucose - ROMAN.target) / ROMAN.sensitivity;

  let total: number | null = null;
  let rounding: RoundingInfo | null = null;

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

  // Generate dynamic conversational teaching sentence
  let casualSentence = '';
  if (glucose === null && carbs === null) {
    casualSentence = 'Enter Roman’s glucose reading and lunch carbs above. Halfstep will calculate the exact units, explain each step in plain English, and apply his half-unit rounding rule.';
  } else if (isLowGlucose) {
    casualSentence = `Blood sugar is ${glucose} mg/dL (under 70). Do not give insulin for a low reading. Give fast-acting carbs instead according to his school emergency plan.`;
  } else if (glucose === null) {
    casualSentence = `For ${carbs}g of carbs, Roman needs ${displayUnits(food)} units for food (${carbs} ÷ 35). Enter his current glucose to check if a correction is needed.`;
  } else if (carbs === null) {
    if (belowTarget) {
      casualSentence = `At ${glucose} mg/dL, Roman is below his 150 target, so no correction insulin is given. Enter his carbs to calculate his meal dose.`;
    } else {
      casualSentence = `At ${glucose} mg/dL (${glucose - ROMAN.target} points over target), his high glucose correction is ${displayUnits(correction)} units. Enter his carbs to get the total dose.`;
    }
  } else if (belowTarget) {
    casualSentence = `Roman is at ${glucose} mg/dL (below his 150 target), so he gets zero correction insulin. He only gets food coverage: ${displayUnits(food)} units for his ${carbs}g of carbs (${carbs} ÷ 35). ${rounding ? rounding.explanation : ''}`.trim();
  } else if (total !== null && rounding !== null) {
    const dose = rounding.rounded.toFixed(1);
    const diff = glucose - ROMAN.target;
    casualSentence = `Roman gets ${dose} units. Here is the math: ${displayUnits(food)} units for food (${carbs}g ÷ 35) plus ${displayUnits(correction)} units for correction (${glucose} − 150 = ${diff}, then ${diff} ÷ 135). Exact total is ${displayUnits(total)} units. ${rounding.explanation}`;
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
    glucoseWarning,
    carbsWarning,
    casualSentence,
  };
}
