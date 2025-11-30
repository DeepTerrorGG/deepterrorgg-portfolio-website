
// src/app/providers.tsx
'use client';

import { SessionProvider } from 'next-auth/react';
import { Toaster } from "@/components/ui/toaster";
import type { ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <FirebaseProvider>
        {children}
        <Toaster />
      </FirebaseProvider>
    </SessionProvider>
  );
}
