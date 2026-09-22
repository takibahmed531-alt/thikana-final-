/**
 * Thikana Real Estate Platform
 * User Search Preference Alerts & Automated Notification Management
 */

import {
  collection,
  addDoc,
  doc,
  deleteDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import { SearchAlert, PropertyListing, AlertMatchResult } from '../types';
import { handleFirestoreError, OperationType } from './firestoreErrors';
import {
  matchAndDispatchPropertyAlerts,
  generatePropertyAlertEmailHtml,
  sendPropertyAlertEmail,
} from './notificationService';

export interface CreateSearchAlertInput {
  userUid: string;
  userEmail?: string;
  area: string;
  category: string;
  minRent?: number;
  maxRent?: number;
  genderPreference?: 'Any' | 'Male' | 'Female' | string;
  emailNotifications?: boolean;
}

/**
 * Creates a smart search alert for a user, notifying them via email when properties
 * matching their area, category, rent range, and gender preference are posted.
 */
export async function createSearchAlert(
  userUid: string,
  area: string,
  category: string,
  options?: Partial<CreateSearchAlertInput>
): Promise<string> {
  try {
    const alertsCollection = collection(db, 'searchAlerts');
    const docRef = await addDoc(alertsCollection, {
      userUid,
      userEmail: options?.userEmail || '',
      area: area.trim(),
      category: category.trim(),
      minRent: options?.minRent !== undefined ? Number(options.minRent) : undefined,
      maxRent: options?.maxRent !== undefined ? Number(options.maxRent) : undefined,
      genderPreference: options?.genderPreference || 'Any',
      emailNotifications: options?.emailNotifications !== undefined ? options.emailNotifications : true,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating search alert in Firestore:', error);
    handleFirestoreError(error, OperationType.CREATE, 'searchAlerts');
    throw error;
  }
}

/**
 * Retrieves all active search alerts saved by an authenticated user.
 */
export async function getUserSearchAlerts(userUid: string): Promise<SearchAlert[]> {
  try {
    const alertsCollection = collection(db, 'searchAlerts');
    const q = query(alertsCollection, where('userUid', '==', userUid));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      alertId: docSnap.id,
      ...docSnap.data(),
    })) as SearchAlert[];
  } catch (error) {
    console.error('Error fetching user search alerts:', error);
    handleFirestoreError(error, OperationType.GET, `searchAlerts?userUid=${userUid}`);
    return [];
  }
}

/**
 * Deletes a search alert configured by the user.
 */
export async function deleteSearchAlert(alertId: string, _userUid: string): Promise<boolean> {
  try {
    const alertDocRef = doc(db, 'searchAlerts', alertId);
    await deleteDoc(alertDocRef);
    return true;
  } catch (error) {
    console.error('Error deleting search alert:', error);
    handleFirestoreError(error, OperationType.DELETE, `searchAlerts/${alertId}`);
    return false;
  }
}

/**
 * Automatically evaluates a newly posted property and dispatches email alerts
 * to all matching subscribers across the platform.
 */
export async function triggerPropertyAlerts(
  property: PropertyListing
): Promise<AlertMatchResult> {
  return await matchAndDispatchPropertyAlerts(property);
}

/**
 * Sends a test/sample property alert email to verify notification formatting.
 */
export async function sendSamplePropertyAlert(
  userEmail: string,
  userUid: string,
  property: Partial<PropertyListing>
): Promise<{ success: boolean; message: string; previewHtml?: string }> {
  const sampleProperty: PropertyListing = {
    propertyId: property.propertyId || 'sample_prop_123',
    adId: property.adId || 'THK-TEST',
    landlordUid: property.landlordUid || 'landlord_preview',
    title: property.title || 'Luxurious 3-BHK Apartment with Lake View',
    rentAmount: property.rentAmount || 32000,
    category: (property.category as any) || 'apartment',
    location: property.location || 'Dhanmondi Road 8/A, Dhaka',
    amenities: property.amenities || ['Elevator', 'Backup Generator', 'Car Parking', 'CCTV Security'],
    images: property.images || ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80'],
    genderPreference: (property.genderPreference as any) || 'Any',
    status: 'available',
    coordinates: property.coordinates || [23.7461, 90.3742],
    createdAt: new Date().toISOString(),
  };

  const { html, text, subject } = generatePropertyAlertEmailHtml(sampleProperty, userEmail);

  const dispatchResult = await sendPropertyAlertEmail({
    to: userEmail,
    userUid,
    propertyId: sampleProperty.propertyId,
    subject,
    html,
    text,
  });

  return {
    success: dispatchResult.success,
    message: dispatchResult.success
      ? `Sample email alert successfully sent to ${userEmail}`
      : 'Sample email alert dispatch simulated.',
    previewHtml: html,
  };
}
