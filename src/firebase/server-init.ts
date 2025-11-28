
// src/firebase/server-init.ts

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { firebaseConfig } from './config';

let firebaseApp: FirebaseApp;

// This function is for SERVER-SIDE use only.
// It ensures that we initialize the app only once.
export function initializeFirebase() {
  if (!getApps().length) {
    firebaseApp = initializeApp(firebaseConfig);
  } else {
    firebaseApp = getApp();
  }
  return {
    firestore: getFirestore(firebaseApp),
  };
}

    