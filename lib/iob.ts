export const ACTION_DURATION_MS = 3 * 60 * 60 * 1000;

export function injectionProgress(administeredAt: string, units: number, now: number) {
  const administered = Date.parse(administeredAt);
  if (!Number.isFinite(administered) || !Number.isFinite(units) || units <= 0 || administered > now) return null;
  const remainingMs = Math.max(0, ACTION_DURATION_MS - (now - administered));
  const fraction = remainingMs / ACTION_DURATION_MS;
  return { remainingMs, fraction, remainingUnits: units * fraction };
}
export function remainingLabel(ms: number): string {
  const minutes = Math.ceil(ms / 60000);
  if (minutes <= 0) return 'Interval complete';
  const hours = Math.floor(minutes / 60);
  return hours ? `${hours}h${minutes % 60 ? ` ${minutes % 60}m` : ''}` : `${minutes}m`;
}
