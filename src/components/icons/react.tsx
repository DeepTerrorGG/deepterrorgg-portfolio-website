// src/components/icons/react.tsx
import type { SVGProps } from 'react';

export function ReactIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>
      <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}>
        <ellipse cx={12} cy={12} fill="none" strokeDasharray={10} strokeDashoffset={10} rx={10} ry={4}>
          <animate attributeName="stroke-dashoffset" values="0;20" dur="2s" repeatCount="indefinite" />
        </ellipse>
        <ellipse
          cx={12}
          cy={12}
          fill="none"
          strokeDasharray={10}
          strokeDashoffset={10}
          rx={10}
          ry={4}
          transform="rotate(60 12 12)"
        >
          <animate attributeName="stroke-dashoffset" values="0;20" dur="2s" repeatCount="indefinite" />
        </ellipse>
        <ellipse
          cx={12}
          cy={12}
          fill="none"
          strokeDasharray={10}
          strokeDashoffset={10}
          rx={10}
          ry={4}
          transform="rotate(120 12 12)"
        >
          <animate attributeName="stroke-dashoffset" values="0;20" dur="2s" repeatCount="indefinite" />
        </ellipse>
      </g>
      <circle cx={12} cy={12} r={1} fill="currentColor" />
    </svg>
  );
}
