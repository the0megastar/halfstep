import { useMemo } from 'react';
import type { Injection } from '../../../lib/injections';
import { injectionProgress } from '../../../lib/iob';

export interface ContributingInjectionItem {
  record: Injection;
  item: NonNullable<ReturnType<typeof injectionProgress>>;
}

export function useIobSummary(records: Injection[], now: number, loaded: boolean) {
  return useMemo(() => {
    const sorted = [...records].sort(
      (a, b) => Date.parse(b.administeredAt) - Date.parse(a.administeredAt)
    );
    const active = sorted.filter((record) => record.status === 'active');
    const progressList = active.map((record) => ({
      record,
      item: injectionProgress(record.administeredAt, record.units, now),
    }));

    const uncertain = !loaded || progressList.some((p) => p.item === null);
    const total = progressList.reduce((sum, p) => sum + (p.item?.remainingUnits ?? 0), 0);

    const activeContributing = progressList.filter(
      (p): p is ContributingInjectionItem =>
        p.item !== null && p.item.remainingMs > 0
    );

    const latest = activeContributing[0]?.item;

    return {
      total,
      latest,
      activeContributing,
      uncertain,
      activeRecords: active,
      sortedRecords: sorted,
    };
  }, [records, now, loaded]);
}
