import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged, signOut as fbSignOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { PublicProfile, PrivateUser } from '../types';
import {
  signInWithGoogle,
  signInWithFacebook,
  signUpWithEmailOrPhone,
  loginWithEmailOrPhone,
  linkGoogleAccount as linkGoogleAccountService,
  saveNewUserToDatabase,
} from '../services/authService';
import { handleFirestoreError, OperationType } from '../services/firestoreErrors';

/**
 * Normalizes Firebase Auth error codes into clear, user-friendly messages.
 */
function formatAuthError(err: any): Error {
  const code = err?.code;
  const message = String(err?.message || '');

  if (
    code === 'auth/operation-not-allowed' ||
    message.includes('operation-not-allowed') ||
    message.includes('Email & Password')
  ) {
    return new Error(
      'Email & Password registration is not enabled on this Firebase project. Please use "Continue with Google" to sign in or create an account.'
    );
  }

  switch (code) {
    case 'auth/credential-already-in-use':
      return new Error('This Google account is already linked to another account.');
    case 'auth/provider-already-linked':
      return new Error('A Google account is already linked to your profile.');
    case 'auth/requires-recent-login':
      return new Error('This operation requires recent authentication. Please sign in again and retry.');
    case 'auth/email-already-in-use':
      return new Error('This email or phone number is already registered. Please sign in.');
    case 'auth/invalid-email':
      return new Error('The email or phone format provided is invalid.');
    case 'auth/user-not-found':
      return new Error('No account found with this email or phone number.');
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return new Error('Invalid email/phone or password. Please verify your credentials.');
    case 'auth/weak-password':
      return new Error('Password must be at least 6 characters long.');
    case 'auth/too-many-requests':
      return new Error('Too many failed attempts. Please wait a few moments and try again.');
    case 'auth/popup-closed-by-user':
      return new Error('Sign-in popup was closed before completing authentication.');
    case 'auth/cancelled-popup-request':
      return new Error('Only one sign-in popup is allowed at a time.');
    case 'auth/account-exists-with-different-credential':
      return new Error('An account already exists with the same email using a different sign-in method.');
    case 'auth/network-request-failed':
      return new Error('Network error. Please check your internet connection and try again.');
    case 'auth/operation-not-allowed':
      return new Error(
        'Email & Password registration is not enabled on this Firebase project. Please use "Continue with Google" to sign in or create an account.'
      );
    default:
      return new Error(err?.message || 'Authentication failed. Please try again.');
  }
}

interface AuthContextType {
  user: User | null;
  publicProfile: PublicProfile | null;
  privateUser: PrivateUser | null;
  loading: boolean;
  isAuthModalOpen: boolean;
  authModalMode: 'signin' | 'signup';
  openAuthModal: (mode?: 'signin' | 'signup') => void;
  closeAuthModal: () => void;
  signInWithGoogle: () => Promise<void>;
  signInWithFacebook: () => Promise<void>;
  signUpWithEmailOrPhone: (identifier: string, password: string, name: string) => Promise<void>;
  loginWithEmailOrPhone: (identifier: string, password: string) => Promise<void>;
  linkGoogleAccount: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [publicProfile, setPublicProfile] = useState<PublicProfile | null>(null);
  const [privateUser, setPrivateUser] = useState<PrivateUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');

  const openAuthModal = (mode: 'signin' | 'signup' = 'signin') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

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
    } catch (err: any) {
      console.warn('Google Sign-In notice:', err?.message || err);
      throw formatAuthError(err);
    }
  };

  const handleFacebookSignIn = async () => {
    try {
      const cred = await signInWithFacebook();
      if (cred.user) {
        await fetchUserData(cred.user);
      }
    } catch (err: any) {
      console.warn('Facebook Sign-In notice:', err?.message || err);
      throw formatAuthError(err);
    }
  };

  const handleSignUpWithEmailOrPhone = async (identifier: string, password: string, name: string) => {
    try {
      const cred = await signUpWithEmailOrPhone(identifier, password, name);
      if (cred.user) {
        await fetchUserData(cred.user);
      }
    } catch (err: any) {
      console.warn('Sign-up notice:', err?.message || err);
      throw formatAuthError(err);
    }
  };

  const handleLoginWithEmailOrPhone = async (identifier: string, password: string) => {
    try {
      const cred = await loginWithEmailOrPhone(identifier, password);
      if (cred.user) {
        await fetchUserData(cred.user);
      }
    } catch (err: any) {
      console.warn('Login notice:', err?.message || err);
      throw formatAuthError(err);
    }
  };

  const handleLinkGoogleAccount = async () => {
    try {
      const cred = await linkGoogleAccountService();
      if (cred.user) {
        setUser(auth.currentUser);
        await fetchUserData(cred.user);
      }
    } catch (err: any) {
      console.warn('Link Google account notice:', err?.message || err);
      throw formatAuthError(err);
    }
  };

  const handleSignOut = async () => {
    try {
      await fbSignOut(auth);
      setUser(null);
      setPublicProfile(null);
      setPrivateUser(null);
    } catch (err) {
      console.warn('Sign out notice:', err);
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
        isAuthModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        signInWithGoogle: handleGoogleSignIn,
        signInWithFacebook: handleFacebookSignIn,
        signUpWithEmailOrPhone: handleSignUpWithEmailOrPhone,
        loginWithEmailOrPhone: handleLoginWithEmailOrPhone,
        linkGoogleAccount: handleLinkGoogleAccount,
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
