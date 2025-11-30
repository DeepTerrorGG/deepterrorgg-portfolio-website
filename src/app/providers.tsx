// src/app/providers.tsx
'use client';

import { Toaster } from "@/components/ui/toaster";
import type { ReactNode } from 'react';
import { FirebaseClientProvider } from '@/firebase/client-provider';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <FirebaseClientProvider>
      {children}
      <Toaster />
    </FirebaseClientProvider>
  );
}
