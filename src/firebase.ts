/**
 * Thikana Real Estate Platform
 * Firebase Client Initialization using firebase-applet-config.json
 */
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore, doc, getDocFromServer } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase with auto-injected platform configuration
export const app: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// CRITICAL: The app will break without passing the configured databaseId
export const db: Firestore = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId);
export const auth: Auth = getAuth(app);
export const storage: FirebaseStorage = getStorage(app);

// Connection test on boot as required by Firebase skill
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}

testConnection();
