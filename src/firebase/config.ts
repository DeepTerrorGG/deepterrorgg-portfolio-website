
const getEnv = (val: string | undefined, fallback: string) => {
  return (!val || val.includes('your_')) ? fallback : val;
};

export const firebaseConfig = {
  projectId: getEnv(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID, "deepterrorgg-portfolio"),
  appId: getEnv(process.env.NEXT_PUBLIC_FIREBASE_APP_ID, "1:568392924675:web:bf4eee9a5401aa41585836"),
  apiKey: getEnv(process.env.NEXT_PUBLIC_FIREBASE_API_KEY, "AIzaSyCN-c2Ve2N4Th7Lg51o9xNKJwwMPHOEyoc"),
  authDomain: getEnv(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN, "deepterrorgg-portfolio.firebaseapp.com"),
  measurementId: getEnv(process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID, ""),
  messagingSenderId: getEnv(process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID, "568392924675"),
  storageBucket: getEnv(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET, "deepterrorgg-portfolio.firebasestorage.app"),
};
