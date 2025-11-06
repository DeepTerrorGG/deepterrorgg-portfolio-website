// src/components/icons/calculator.tsx
import type { SVGProps } from 'react';

export function CalculatorIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      {...props}
    >
      <path
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 2v20h16V2zm5 5h6m-3-3v6M8 14h8m-8 3h8"
      ></path>
    </svg>
  );
}
