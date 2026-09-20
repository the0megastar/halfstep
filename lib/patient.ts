/**
 * Cloneable patient defaults for Halfstep.
 * Edit this file (then rebuild) to adapt the app for another person.
 * Values here are the Locked insulin parameters shown in Settings.
 */

export type CarbRatioContext = 'breakfast' | 'school' | 'dinner';

export const CARB_RATIO_MAP: Record<CarbRatioContext, number> = Object.freeze({
  breakfast: 20,
  school: 45,
  dinner: 35,
});

export const PATIENT = Object.freeze({
  /** Display name on the Calculate page */
  name: 'Roman',
  /** Grams of carbohydrate covered by 1 unit of insulin (default / school) */
  carbRatio: 45,
  /** mg/dL glucose drop expected from 1 unit of insulin (ISF) */
  isf: 135,
  /** Target glucose for correction math (mg/dL) */
  targetGlucose: 150,
  /** Hard ceiling for suggested and logged doses (units) */
  maxDoseUnits: 5,
  /** Linear IOB model length (hours) */
  durationOfInsulinHours: 3,
  /** Rapid-acting insulin label in UI copy */
  insulinName: 'NovoLog',
  /** At or below this glucose, do not suggest a dose (mg/dL) */
  lowGlucoseMgDl: 70,
  /** Unusually high glucose prompt (mg/dL) */
  highGlucoseMgDl: 400,
  /** Large carb count prompt (grams) */
  highCarbsGrams: 100,
});

export type PatientConfig = typeof PATIENT;

export const ACTION_DURATION_MS = PATIENT.durationOfInsulinHours * 60 * 60 * 1000;

/** Compatibility shape used by existing dose math helpers. */
export const ROMAN = Object.freeze({
  ratio: PATIENT.carbRatio,
  sensitivity: PATIENT.isf,
  target: PATIENT.targetGlucose,
  maxGlucose: PATIENT.highGlucoseMgDl,
  lowGlucose: PATIENT.lowGlucoseMgDl,
  highCarbs: PATIENT.highCarbsGrams,
});
