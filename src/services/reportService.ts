/**
 * Thikana Real Estate Platform
 * Reporting & Fraud Detection Service using Firebase v9+ Modular SDK
 */

import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { Report } from '../types';
import { handleFirestoreError, OperationType } from './firestoreErrors';

/**
 * Submits a fraud, safety, or policy violation report for a property or user.
 * Saves a new report document with 'pending' status into the 'reports' Firestore collection.
 *
 * @param targetId The unique identifier of the reported entity (propertyId or userUid)
 * @param targetType The type of entity being reported ('property' | 'user')
 * @param reason The categorized reason for reporting
 * @param description Optional detailed notes or incident description
 * @param reporterUid The UID of the authenticated user submitting the report
 * @returns Promise resolving to the created Report record
 */
export async function submitReport(
  targetId: string,
  targetType: 'property' | 'user',
  reason: string,
  description?: string,
  reporterUid?: string
): Promise<Report> {
  try {
    if (!targetId || !targetType || !reason) {
      throw new Error('targetId, targetType, and reason are required to submit a report.');
    }

    if (!reporterUid) {
      throw new Error('reporterUid is required to submit a report.');
    }

    if (targetType !== 'property' && targetType !== 'user') {
      throw new Error("targetType must be either 'property' or 'user'.");
    }

    const reportsCol = collection(db, 'reports');
    const newDocRef = doc(reportsCol);
    const reportId = newDocRef.id;

    const reportData: Report = {
      reportId,
      reporterUid,
      targetId,
      targetType,
      reason: reason.trim(),
      description: description ? description.trim() : '',
      status: 'pending',
      createdAt: serverTimestamp(),
    };

    try {
      await setDoc(newDocRef, reportData);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `reports/${reportId}`);
    }

    return {
      ...reportData,
      reportId,
    };
  } catch (error) {
    console.error('Error submitting report:', error);
    throw error;
  }
}
