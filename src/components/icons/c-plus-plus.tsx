// src/components/icons/c-plus-plus.tsx
import type { SVGProps } from 'react';

export function CPlusPlusIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>
      <path
        fill="currentColor"
        d="M14.5 13.5h-3v-3h3m2.5-5.5H12v3h5v5h-5v3h5v5h-5v3h7V8zM5 13.5H2v-3h3m2.5-5.5H3v3h5v5H3v3h5v5H3v3h7V8z"
      ></path>
      <path
        fill="currentColor"
        d="M18 10h2v2h-2zm0 2h2v2h-2zm-2-2h2v2h-2zm2 0h2v2h-2z"
      ></path>
    </svg>
  );
}
