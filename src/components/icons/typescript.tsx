// src/components/icons/typescript.tsx
import type { SVGProps } from 'react';

export function TypeScriptIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>
      <path
        fill="currentColor"
        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2m-1 16v-5h-2V9h2V4h2v5h2v2h-2v7zm8-10.5c0-.83.67-1.5 1.5-1.5H22v-3h-2c-.55 0-1-.45-1-1V8c0-.55.45-1 1-1h3c.55 0 1 .45 1 1v1.5c0 .83-.67 1.5-1.5 1.5H20v3h2c.55 0 1 .45 1 1v1c0 .55-.45 1-1 1h-4c-.55 0-1-.45-1-1z"
      ></path>
    </svg>
  );
}
