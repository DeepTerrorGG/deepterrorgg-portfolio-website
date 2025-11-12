// src/app/providers.tsx
'use client';

import { FirebaseClientProvider as FirebaseProvider } from '@/firebase';
import { Toaster } from "@/components/ui/toaster";
import type { ReactNode } from 'react';

// This file is DEPRECATED and will be removed. 
// The new structure uses src/app/layout.tsx to compose providers.
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <FirebaseProvider>
      {children}
      <Toaster />
    </FirebaseProvider>
  );
}
