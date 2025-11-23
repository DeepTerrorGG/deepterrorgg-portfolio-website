// src/components/icons/doom.tsx
import type { SVGProps } from 'react';

export function DoomIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 256 256"
      {...props}
    >
      <path
        fill="currentColor"
        d="M216 40H40a8 8 0 0 0-8 8v152a8 8 0 0 0 8 8h176a8 8 0 0 0 8-8V48a8 8 0 0 0-8-8M48 192V56h160v136Zm36-52.26V112h34.91L108.4 92.51a12 12 0 0 1 16.9-1.48L144.38 108H172a12 12 0 0 1 0 24h-16v19.74a12 12 0 0 1-24 0V132h-32.38a12 12 0 0 1-9-20.26Z"
      ></path>
    </svg>
  );
}
