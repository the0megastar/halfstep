/**
 * Estimated glucose after a dose, using prescribed CR and ISF only.
 * Does not model IOB, absorption timing, or exercise.
 */
import { ROMAN } from './dose.ts';

export interface GlucoseEstimateInput {
  glucose: number | null;
  carbs: number | null;
  doseUnits: number | null;
  carbRatio?: number;
  sensitivity?: number;
}

export interface GlucoseEstimate {
  estimatedGlucose: number | null;
  carbRise: number | null;
  insulinDrop: number | null;
  complete: boolean;
}

export function estimateGlucoseAfterDose(input: GlucoseEstimateInput): GlucoseEstimate {
  const cr = input.carbRatio ?? ROMAN.ratio;
  const isf = input.sensitivity ?? ROMAN.sensitivity;
  const { glucose, carbs, doseUnits } = input;

  if (
    glucose === null ||
    carbs === null ||
    doseUnits === null ||
    !Number.isFinite(glucose) ||
    !Number.isFinite(carbs) ||
    !Number.isFinite(doseUnits) ||
    cr <= 0 ||
    isf <= 0 ||
    doseUnits < 0 ||
    carbs < 0
  ) {
    return { estimatedGlucose: null, carbRise: null, insulinDrop: null, complete: false };
  }

  const carbRise = (carbs / cr) * isf;
  const insulinDrop = doseUnits * isf;
  const estimatedGlucose = glucose + carbRise - insulinDrop;

  return {
    estimatedGlucose,
    carbRise,
    insulinDrop,
    complete: true,
  };
}

export function formatEstimatedGlucose(mgdl: number | null): string {
  if (mgdl === null || !Number.isFinite(mgdl)) return '—';
  return `${Math.round(mgdl)}`;
}
