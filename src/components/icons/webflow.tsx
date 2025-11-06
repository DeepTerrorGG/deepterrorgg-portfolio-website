// src/components/icons/webflow.tsx
import type { SVGProps } from 'react';

export function WebflowIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>
      <path
        fill="currentColor"
        d="M12.235 2.01L7.08 7.164v9.673l5.155 5.153l5.155-5.153V7.164L12.235 2.01zm0 1.03l4.125 4.123h-8.25L12.235 3.04zM8.11 7.164h8.25v8.643l-4.125 4.122l-4.125-4.122V7.164z"
      ></path>
      <path fill="currentColor" d="M8.11 7.164h8.25v2.062H8.11z"></path>
    </svg>
  );
}
