import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged, signOut as fbSignOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { PublicProfile, PrivateUser } from '../types';
import { signInWithGoogle, saveNewUserToDatabase } from '../services/authService';
import { handleFirestoreError, OperationType } from '../services/firestoreErrors';

interface AuthContextType {
  user: User | null;
  publicProfile: PublicProfile | null;
  privateUser: PrivateUser | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [publicProfile, setPublicProfile] = useState<PublicProfile | null>(null);
  const [privateUser, setPrivateUser] = useState<PrivateUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async (currentUser: User) => {
    try {
      const pubDocRef = doc(db, 'publicProfiles', currentUser.uid);
      const privDocRef = doc(db, 'privateUsers', currentUser.uid);

      let pubSnap;
      try {
        pubSnap = await getDoc(pubDocRef);
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, `publicProfiles/${currentUser.uid}`);
      }

      if (pubSnap && pubSnap.exists()) {
        setPublicProfile(pubSnap.data() as PublicProfile);
      } else {
        // Initialize profile if it doesn't exist yet
        const res = await saveNewUserToDatabase(currentUser);
        setPublicProfile(res.publicProfile);
        setPrivateUser(res.privateUser);
        return;
      }

      try {
        const privSnap = await getDoc(privDocRef);
        if (privSnap && privSnap.exists()) {
          setPrivateUser(privSnap.data() as PrivateUser);
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, `privateUsers/${currentUser.uid}`);
      }
    } catch (err) {
      console.error('Error fetching user data from Firestore:', err);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await fetchUserData(currentUser);
      } else {
        setPublicProfile(null);
        setPrivateUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      const cred = await signInWithGoogle();
      if (cred.user) {
        await fetchUserData(cred.user);
      }
    } catch (err) {
      console.error('Google Sign-In failed:', err);
      throw err;
    }
  };

  const handleSignOut = async () => {
    try {
      await fbSignOut(auth);
      setUser(null);
      setPublicProfile(null);
      setPrivateUser(null);
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  const refreshProfile = async () => {
    if (auth.currentUser) {
      await fetchUserData(auth.currentUser);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        publicProfile,
        privateUser,
        loading,
        signInWithGoogle: handleGoogleSignIn,
        signOut: handleSignOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
