// src/app/providers.tsx
'use client';

import { SessionProvider } from 'next-auth/react';
import { Toaster } from "@/components/ui/toaster";
import type { ReactNode } from 'react';
import { FirebaseClientProvider } from '@/firebase/client-provider';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <FirebaseClientProvider>
        {children}
        <Toaster />
      </FirebaseClientProvider>
    </SessionProvider>
  );
}
