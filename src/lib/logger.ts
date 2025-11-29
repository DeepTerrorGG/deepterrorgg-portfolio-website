
'use client';

import { initializeFirebase } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export function logActivity(message: string, level: 'info' | 'warn' | 'error' = 'info') {
  // This is a "fire and forget" function. We don't want logging to
  // block the main thread or for its errors to bubble up to the user.
  try {
    const { firestore } = initializeFirebase();
    if (!firestore) {
      console.warn("Firestore not available. Skipping log.");
      return;
    }
    
    const logsCollection = collection(firestore, 'system_logs');
    
    // Use the non-blocking version of addDoc
    addDoc(logsCollection, {
      level,
      msg: message,
      timestamp: serverTimestamp(),
    }).catch(error => {
      // Silently fail to the console if logging fails.
      console.error("Failed to write log to Firestore:", error);
    });

  } catch (error) {
    // Catch initialization errors or other synchronous issues.
    console.error("Failed to initiate logging:", error);
  }
}
