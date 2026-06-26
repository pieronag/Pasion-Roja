import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: ReturnType<typeof initializeApp>;
try {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
} catch (e) {
  console.error('Firebase init error:', e);
  app = getApps()[0];
}

export const db = getFirestore(app);
export const auth = getAuth(app);

setPersistence(auth, browserLocalPersistence).catch((e) =>
  console.warn('Auth persistence error:', e)
);

export let messaging: any = null;

if (typeof window !== 'undefined') {
  import('firebase/messaging')
    .then(({ getMessaging }) => {
      messaging = getMessaging(app);
    })
    .catch(() => {
      console.warn('Firebase Messaging no disponible');
    });
}
