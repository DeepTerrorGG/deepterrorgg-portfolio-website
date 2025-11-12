'use client';

import { Toaster } from "@/components/ui/toaster";
import type { ReactNode } from 'react';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <Toaster />
    </>
  );
}
