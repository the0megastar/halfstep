import { PATIENT } from './patient.ts';

export interface InjectionValues {
  units: number;
  administeredAt: string;
  /** Optional; kept for older records. Not collected in v0.2.0 UI. */
  caregiver: string;
  glucoseMgDl?: number | null;
  carbsGrams?: number | null;
}

export interface InjectionEvent {
  at: string;
  action: 'created' | 'corrected' | 'voided';
  values: InjectionValues;
}

export interface Injection extends InjectionValues {
  id: string;
  schemaVersion: 1;
  insulin: string;
  createdAt: string;
  revision: number;
  status: 'active' | 'voided';
  events: InjectionEvent[];
}

export function validateInjection(values: InjectionValues, now = Date.now()): string | null {
  if (!Number.isFinite(values.units) || values.units <= 0) {
    return 'Enter a positive dose in units.';
  }
  if (!Number.isSafeInteger(values.units * 2)) {
    return 'Enter a dose in half-unit steps (0.5, 1, 1.5…).';
  }
  if (values.units > PATIENT.maxDoseUnits) {
    return `Dose cannot exceed the locked maximum of ${PATIENT.maxDoseUnits} units.`;
  }
  const time = Date.parse(values.administeredAt);
  if (!Number.isFinite(time)) {
    return 'Enter a valid administration date and time.';
  }
  if (time > now) {
    return 'Administration time cannot be in the future.';
  }
  return null;
}

function cleanValues(values: InjectionValues): InjectionValues {
  return {
    ...values,
    caregiver: (values.caregiver ?? '').trim(),
    glucoseMgDl:
      values.glucoseMgDl != null && Number.isFinite(values.glucoseMgDl)
        ? values.glucoseMgDl
        : null,
    carbsGrams:
      values.carbsGrams != null && Number.isFinite(values.carbsGrams)
        ? values.carbsGrams
        : null,
  };
}

export function createInjection(id: string, values: InjectionValues, now = Date.now()): Injection {
  const error = validateInjection(values, now);
  if (error) throw new Error(error);
  const clean = cleanValues(values);
  const at = new Date(now).toISOString();
  return {
    ...clean,
    id,
    schemaVersion: 1,
    insulin: PATIENT.insulinName,
    createdAt: at,
    revision: 1,
    status: 'active',
    events: [{ at, action: 'created', values: clean }],
  };
}

export function reviseInjection(
  record: Injection,
  values: InjectionValues,
  voided = false,
  now = Date.now(),
): Injection {
  if (record.status === 'voided') {
    throw new Error('A voided entry cannot be edited. Record a new injection if needed.');
  }
  const error = validateInjection(values, now);
  if (error) throw new Error(error);
  const clean = cleanValues(values);
  return {
    ...record,
    ...clean,
    insulin: PATIENT.insulinName,
    revision: record.revision + 1,
    status: voided ? 'voided' : 'active',
    events: [
      ...record.events,
      {
        at: new Date(now).toISOString(),
        action: voided ? 'voided' : 'corrected',
        values: clean,
      },
    ],
  };
}

export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    return [...bytes]
      .map((b, i) => ([4, 6, 8, 10].includes(i) ? '-' : '') + b.toString(16).padStart(2, '0'))
      .join('');
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
