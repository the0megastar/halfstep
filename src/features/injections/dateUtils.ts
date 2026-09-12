/**
 * Pure date conversion and formatting utilities for injection records
 */

export function localTimeInput(iso = new Date().toISOString()): string {
  const date = new Date(iso);
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
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

export function formatTimeShort(iso: string): string {
  return new Date(iso).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });
}
