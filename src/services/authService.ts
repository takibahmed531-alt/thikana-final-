/**
 * Thikana Real Estate Platform
 * Firebase Authentication & Privacy-Isolated Firestore Synchronization
 */

import {
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
  signInWithPhoneNumber,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  linkWithPopup,
  sendEmailVerification,
  RecaptchaVerifier,
  ConfirmationResult,
  User,
  UserCredential,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  writeBatch,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from '../firebase';
import { AdditionalUserData, PublicProfile, PrivateUser, UserRole } from '../types';
import { handleFirestoreError, OperationType } from './firestoreErrors';

/**
 * Task 2: Helper function to format email or phone identifier.
 * If the identifier contains only numbers (or starts with '+'),
 * appends '@bharahobe.app' to use it as a pseudo-email for OTP-less phone authentication.
 * Otherwise, returns the email as is.
 */
export function formatIdentifier(identifier: string): string {
  const trimmed = (identifier || '').trim();
  const cleaned = trimmed.replace(/[\s-]/g, '');
  if (cleaned.startsWith('+') || /^\d+$/.test(cleaned)) {
    return `${cleaned}@bharahobe.app`;
  }
  return trimmed;
}

/**
 * Task 3: Sign up with email or phone number (OTP-less).
 * Formats the identifier, creates the user with password, updates the auth profile with the name,
 * and synchronizes the new user to Firestore.
 */
export async function signUpWithEmailOrPhone(
  identifier: string,
  password: string,
  name: string
): Promise<UserCredential> {
  try {
    const formattedEmail = formatIdentifier(identifier);
    const credential = await createUserWithEmailAndPassword(auth, formattedEmail, password);

    // Update the auth profile with the provided name
    if (name && name.trim()) {
      await updateProfile(credential.user, {
        displayName: name.trim(),
      });
    }

    // Save and synchronize new user documents to Firestore
    await saveNewUserToDatabase(credential.user, {
      displayName: name.trim(),
    });

    // Check if the original identifier is a real email (and not a phone number pseudo-email)
    const trimmed = (identifier || '').trim();
    const isPseudoEmail = formattedEmail.endsWith('@bharahobe.app') || formattedEmail.endsWith('@thikana.app') || trimmed.endsWith('@bharahobe.app') || trimmed.endsWith('@thikana.app');
    const isEmailAddress = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);

    if (isEmailAddress && !isPseudoEmail) {
      try {
        await sendEmailVerification(credential.user);
      } catch (emailError: any) {
        // Silently log any errors so it doesn't break the signup flow
        console.warn('Silently caught email verification dispatch error:', emailError?.message || emailError);
      }
    }

    return credential;
  } catch (error: any) {
    const isOpNotAllowed =
      error?.code === 'auth/operation-not-allowed' ||
      String(error?.message || '').includes('operation-not-allowed');
    if (isOpNotAllowed) {
      console.warn('Firebase Email/Password provider is not enabled on this project.');
      error.message = 'Email & Password sign-up is not enabled on this Firebase project. Please use "Continue with Google" to sign in or create an account.';
    } else {
      console.warn('Sign-up attempt note:', error?.message || error);
    }
    throw error;
  }
}

/**
 * Task 4: Login with email or phone number (OTP-less).
 * Formats the identifier and signs in with password.
 */
export async function loginWithEmailOrPhone(
  identifier: string,
  password: string
): Promise<UserCredential> {
  try {
    const formattedEmail = formatIdentifier(identifier);
    const credential = await signInWithEmailAndPassword(auth, formattedEmail, password);
    return credential;
  } catch (error: any) {
    const isOpNotAllowed =
      error?.code === 'auth/operation-not-allowed' ||
      String(error?.message || '').includes('operation-not-allowed');
    if (isOpNotAllowed) {
      console.warn('Firebase Email/Password provider is not enabled on this project.');
      error.message = 'Email & Password sign-in is not enabled on this Firebase project. Please use "Continue with Google" to sign in.';
    } else {
      console.warn('Login attempt note:', error?.message || error);
    }
    throw error;
  }
}

/**
 * Task 5: Sign in with Facebook.
 * Triggers a popup with FacebookAuthProvider and synchronizes profile to database.
 */
export async function signInWithFacebook(additionalData?: AdditionalUserData): Promise<UserCredential> {
  try {
    const provider = new FacebookAuthProvider();
    const credential = await signInWithPopup(auth, provider);

    // Synchronize to Firestore (creates publicProfiles and privateUsers if new)
    await saveNewUserToDatabase(credential.user, additionalData);

    return credential;
  } catch (error: any) {
    console.error('Error during Facebook Sign-In:', error);
    throw error;
  }
}

/**
 * Task 1: Google Sign-In
 * Signs in user via popup and automatically triggers privacy-isolated Firestore provisioning.
 */
export async function signInWithGoogle(additionalData?: AdditionalUserData): Promise<UserCredential> {
  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    const credential = await signInWithPopup(auth, provider);

    // Synchronize to Firestore (creates publicProfiles and privateUsers if new)
    await saveNewUserToDatabase(credential.user, additionalData);

    return credential;
  } catch (error: any) {
    console.error('Error during Google Sign-In:', error);
    throw new Error(error?.message || 'Failed to authenticate with Google.');
  }
}

/**
 * Task 2: Links a Google account to an existing Phone/Email account for recovery purposes.
 * Validates that auth.currentUser exists and executes linkWithPopup with GoogleAuthProvider.
 */
export async function linkGoogleAccount(): Promise<UserCredential> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('No user is currently signed in. Please sign in before linking an account.');
  }

  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const credential = await linkWithPopup(currentUser, provider);
    return credential;
  } catch (error: any) {
    console.error('Error linking Google account:', error);
    const code = error?.code;
    if (code === 'auth/credential-already-in-use') {
      throw new Error('This Google account is already linked to another user.');
    }
    if (code === 'auth/email-already-in-use') {
      throw new Error('An account already exists with the email associated with this Google account.');
    }
    if (code === 'auth/provider-already-linked') {
      throw new Error('A Google account is already linked to this profile.');
    }
    if (code === 'auth/popup-closed-by-user') {
      throw new Error('Google linking popup was closed before completion.');
    }
    if (code === 'auth/cancelled-popup-request') {
      throw new Error('Only one sign-in popup can be active at a time.');
    }
    if (code === 'auth/requires-recent-login') {
      throw new Error('This operation is sensitive and requires recent authentication. Please sign in again and retry.');
    }
    throw new Error(error?.message || 'Failed to link Google account.');
  }
}

/**
 * Helper to initialize Firebase RecaptchaVerifier for Phone Authentication.
 * Supports invisible or visible captcha.
 */
export function setupRecaptcha(
  container: string | HTMLElement = 'recaptcha-container',
  isInvisible = true
): RecaptchaVerifier {
  try {
    // Clear any existing verifier on window if previously mounted
    if ((window as any).recaptchaVerifier) {
      try {
        (window as any).recaptchaVerifier.clear();
      } catch {
        // Ignored
      }
    }

    const verifier = new RecaptchaVerifier(auth, container, {
      size: isInvisible ? 'invisible' : 'normal',
      callback: () => {
        // reCAPTCHA solved - allow signInWithPhoneNumber
      },
      'expired-callback': () => {
        console.warn('reCAPTCHA expired. Please reset.');
      },
    });

    (window as any).recaptchaVerifier = verifier;
    return verifier;
  } catch (error: any) {
    console.error('Error setting up RecaptchaVerifier:', error);
    throw new Error(error?.message || 'Failed to initialize reCAPTCHA verifier.');
  }
}

/**
 * Task 2 (Part A): Send Phone OTP
 * Initiates phone number verification and returns the confirmation result.
 *
 * @param phoneNumber E.164 format phone number (e.g., "+8801712345678")
 * @param verifier RecaptchaVerifier instance or DOM container ID (default: 'recaptcha-container')
 */
export async function sendOTP(
  phoneNumber: string,
  verifier?: RecaptchaVerifier | string
): Promise<ConfirmationResult> {
  try {
    if (!phoneNumber || !phoneNumber.trim()) {
      throw new Error('Please provide a valid phone number with country code (e.g., +8801712345678).');
    }

    let appVerifier: RecaptchaVerifier;

    if (verifier instanceof RecaptchaVerifier) {
      appVerifier = verifier;
    } else if (typeof verifier === 'string') {
      appVerifier = setupRecaptcha(verifier);
    } else if ((window as any).recaptchaVerifier) {
      appVerifier = (window as any).recaptchaVerifier;
    } else {
      appVerifier = setupRecaptcha('recaptcha-container', true);
    }

    const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
    return confirmationResult;
  } catch (error: any) {
    console.error('Error sending OTP:', error);
    throw new Error(error?.message || 'Failed to send OTP. Verify your phone number and reCAPTCHA.');
  }
}

/**
 * Task 2 (Part B): Verify Phone OTP
 * Validates the 6-digit SMS verification code and initializes user documents upon success.
 *
 * @param confirmationResult Result object returned from sendOTP
 * @param verificationCode 6-digit OTP code entered by the user
 * @param additionalData Optional initial profile attributes (role, name, etc.)
 */
export async function verifyOTP(
  confirmationResult: ConfirmationResult,
  verificationCode: string,
  additionalData?: AdditionalUserData
): Promise<UserCredential> {
  try {
    if (!confirmationResult) {
      throw new Error('No active confirmation session found. Please request an OTP first.');
    }

    if (!verificationCode || verificationCode.trim().length < 6) {
      throw new Error('Please enter the valid 6-digit verification code.');
    }

    const credential = await confirmationResult.confirm(verificationCode.trim());

    // Synchronize to Firestore (creates publicProfiles and privateUsers if new)
    await saveNewUserToDatabase(credential.user, {
      phoneNumber: credential.user.phoneNumber || undefined,
      ...additionalData,
    });

    return credential;
  } catch (error: any) {
    console.error('Error verifying OTP code:', error);
    throw new Error(error?.message || 'Invalid or expired verification code.');
  }
}

/**
 * Task 3: Save New User to Database
 *
 * Critical post-login helper that splits and saves user data across
 * 'publicProfiles' and 'privateUsers' collections using an atomic Firestore WriteBatch.
 *
 * Enforces the strict privacy separation:
 * - 'publicProfiles': uid, displayName, photoURL, role, isVerified
 * - 'privateUsers': uid, phoneNumber, nidNumber, dateOfBirth, hiddenAddress
 */
export async function saveNewUserToDatabase(
  user: User,
  additionalData?: AdditionalUserData
): Promise<{ isNewUser: boolean; publicProfile: PublicProfile; privateUser: PrivateUser }> {
  try {
    if (!user || !user.uid) {
      throw new Error('Invalid user object provided to saveNewUserToDatabase.');
    }

    const uid = user.uid;
    const publicProfileRef = doc(db, 'publicProfiles', uid);
    const privateUserRef = doc(db, 'privateUsers', uid);

    // Check if the user already exists in the database
    let publicProfileSnap;
    try {
      publicProfileSnap = await getDoc(publicProfileRef);
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, `publicProfiles/${uid}`);
    }

    if (publicProfileSnap && publicProfileSnap.exists()) {
      // Existing user: return current data without overwriting
      const existingPublic = publicProfileSnap.data() as PublicProfile;
      let privateUserSnap;
      try {
        privateUserSnap = await getDoc(privateUserRef);
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, `privateUsers/${uid}`);
      }
      const existingPrivate = (privateUserSnap?.exists()
        ? privateUserSnap.data()
        : {}) as PrivateUser;

      return {
        isNewUser: false,
        publicProfile: existingPublic,
        privateUser: existingPrivate,
      };
    }

    // Determine normalized role (defaults to 'tenant')
    const rawRole = (additionalData?.role || 'tenant').toLowerCase();
    const role: UserRole = rawRole === 'landlord' || rawRole === 'agent' ? rawRole : 'tenant';

    // 1. Prepare Public Profile (Readable by anyone, writable only by owner)
    const publicProfileData: PublicProfile = {
      uid,
      displayName: (user.displayName || additionalData?.displayName || 'New User').trim(),
      photoURL: user.photoURL || additionalData?.photoURL || '',
      role,
      isVerified: false, // strictly false on creation to respect Security Rules
    };

    // 2. Prepare Private User Record (Strictly readable/writable only by authenticated user)
    const privateUserData: PrivateUser = {
      uid,
      phoneNumber: user.phoneNumber || additionalData?.phoneNumber || '',
      nidNumber: additionalData?.nidNumber?.trim() || '',
      dateOfBirth: additionalData?.dateOfBirth?.trim() || '',
      hiddenAddress: additionalData?.hiddenAddress?.trim() || '',
    };

    // Execute atomic batch write: guarantees both records are created or none
    try {
      const batch = writeBatch(db);
      batch.set(publicProfileRef, publicProfileData);
      batch.set(privateUserRef, privateUserData);
      await batch.commit();
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${uid}`);
    }

    return {
      isNewUser: true,
      publicProfile: publicProfileData,
      privateUser: privateUserData,
    };
  } catch (error: any) {
    console.error('Error in saveNewUserToDatabase:', error);
    throw error;
  }
}

/**
 * Updates the user's lastActive timestamp in their publicProfile document.
 * This is event-driven to avoid continuous timer polling and Firestore quota drain.
 */
export async function updateUserLastActive(uid: string): Promise<void> {
  if (!uid || !uid.trim()) return;
  try {
    const userProfileRef = doc(db, 'publicProfiles', uid.trim());
    await updateDoc(userProfileRef, {
      lastActive: serverTimestamp(),
    }).catch(async () => {
      await setDoc(userProfileRef, { lastActive: serverTimestamp() }, { merge: true }).catch(() => {});
    });
  } catch (err) {
    console.warn('Could not update user lastActive timestamp:', err);
  }
}

