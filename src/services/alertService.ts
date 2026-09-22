import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { handleFirestoreError, OperationType } from './firestoreErrors';

export interface SearchAlert {
  id?: string;
  userUid: string;
  area: string;
  category: string;
  createdAt: any;
}

/**
 * Creates a smart search alert for a user, notifying them when properties matching their
 * area and category become available.
 */
export async function createSearchAlert(
  userUid: string,
  area: string,
  category: string
): Promise<string> {
  try {
    const alertsCollection = collection(db, 'searchAlerts');
    const docRef = await addDoc(alertsCollection, {
      userUid,
      area: area.trim(),
      category: category.trim(),
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating search alert in Firestore:', error);
    handleFirestoreError(error, OperationType.CREATE, 'searchAlerts');
  }
}
