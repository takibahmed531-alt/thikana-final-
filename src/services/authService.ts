/**
 * Thikana Real Estate Platform
 * Firebase Authentication & Privacy-Isolated Firestore Synchronization
 */

import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  ConfirmationResult,
  User,
  UserCredential,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  writeBatch,
} from 'firebase/firestore';
import { auth, db } from '../firebase';
import { AdditionalUserData, PublicProfile, PrivateUser, UserRole } from '../types';
import { handleFirestoreError, OperationType } from './firestoreErrors';

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
