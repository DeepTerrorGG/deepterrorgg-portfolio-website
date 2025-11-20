// src/app/providers.tsx
'use client';

import { FirebaseClientProvider } from '@/firebase/client-provider';
import { Toaster } from "@/components/ui/toaster";
import type { ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <FirebaseClientProvider>
      {children}
      <Toaster />
    </FirebaseClientProvider>
  );
}
