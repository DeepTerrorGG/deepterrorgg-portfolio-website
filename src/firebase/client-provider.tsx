// src/firebase/client-provider.tsx
'use client';

import { ReactNode, useMemo } from 'react';
import { initializeFirebase } from '@/firebase';
import { FirebaseProvider } from '@/firebase/provider';

export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  // Memoize the initialization to ensure it only runs once.
  const firebaseServices = useMemo(() => {
    return initializeFirebase();
  }, []);

  // The actual FirebaseProvider now receives the initialized services as props.
  // This pattern avoids running initialization logic directly inside the
  // provider's render path, which can be problematic for RSC and bundling.
  return (
    <FirebaseProvider
      firebaseApp={firebaseServices.firebaseApp}
      auth={firebaseServices.auth}
      firestore={firebaseServices.firestore}
    >
      {children}
    </FirebaseProvider>
  );
}
