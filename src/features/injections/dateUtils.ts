/**
 * Pure date conversion and formatting utilities for injection records
 */

export function localTimeInput(iso = new Date().toISOString()): string {
  const date = new Date(iso);
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

/** Local calendar date for <input type="date"> (YYYY-MM-DD). */
export function localDateInput(iso = new Date().toISOString()): string {
  return localTimeInput(iso).slice(0, 10);
}

/** Local clock time for <input type="time"> (HH:MM). */
export function localClockInput(iso = new Date().toISOString()): string {
  return localTimeInput(iso).slice(11, 16);
}

/** Combine local date + clock into datetime-local value (YYYY-MM-DDTHH:MM). */
export function combineLocalDateAndClock(date: string, clock: string): string {
  const d = date.trim();
  const t = clock.trim();
  if (!d || !t) return '';
  return `${d}T${t}`;
}

export function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString();
}

export function formatDateHeading(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatTimeShort(value: string | number): string {
  return new Date(value).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });
}
