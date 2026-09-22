/**
 * Thikana Real Estate Platform
 * Customer Support & Help Ticket Service using Firebase Firestore
 */

import { collection, doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { SupportTicket } from '../types';
import { handleFirestoreError, OperationType } from './firestoreErrors';

/**
 * Submits a new support ticket to the 'supportTickets' Firestore collection.
 * 
 * @param userUid The Firebase Auth UID of the authenticated user
 * @param email The contact email address for follow-ups
 * @param subject Brief summary of the inquiry or issue
 * @param message Detailed message explaining the issue
 * @returns Promise resolving to the created SupportTicket document
 */
export async function submitSupportTicket(
  userUid: string,
  email: string,
  subject: string,
  message: string
): Promise<SupportTicket> {
  if (!userUid) {
    throw new Error('User authentication is required to submit a support ticket.');
  }

  const cleanEmail = email.trim();
  const cleanSubject = subject.trim();
  const cleanMessage = message.trim();

  if (!cleanEmail) {
    throw new Error('Please provide a valid contact email address.');
  }

  if (!cleanSubject) {
    throw new Error('Please provide a subject for your ticket.');
  }

  if (!cleanMessage) {
    throw new Error('Please provide a detailed description of your request.');
  }

  const ticketsCol = collection(db, 'supportTickets');
  const newTicketRef = doc(ticketsCol);
  const ticketId = newTicketRef.id;

  const ticketData: SupportTicket = {
    ticketId,
    userUid,
    email: cleanEmail,
    subject: cleanSubject,
    message: cleanMessage,
    status: 'open',
    createdAt: new Date().toISOString(),
  };

  try {
    await setDoc(newTicketRef, ticketData);
    return ticketData;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `supportTickets/${ticketId}`);
    throw error;
  }
}
