import React from 'react';
import { Droplet } from 'lucide-react';

export interface IobGaugeProps {
  fraction?: number;
}

export function IobGauge({ fraction = 0 }: IobGaugeProps) {
  const percentage = Math.min(100, Math.max(0, fraction * 100));

  return (
    <span className="iob-ring">
      <svg viewBox="0 0 32 32" aria-hidden="true">
        <circle className="iob-track" cx="16" cy="16" r="14" />
        <circle
          className="iob-fill"
          cx="16"
          cy="16"
          r="14"
          pathLength="100"
          strokeDasharray={`${percentage} 100`}
        />
      </svg>
      <Droplet size={17} />
    </span>
  );
}
