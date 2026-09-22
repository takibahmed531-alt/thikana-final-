/**
 * Thikana Real Estate Platform
 * Chat & Messaging Services using Firebase v9+ Modular SDK
 */

import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  updateDoc,
  onSnapshot,
  Unsubscribe,
  limit,
} from 'firebase/firestore';
import { db } from '../firebase';
import { handleFirestoreError, OperationType } from './firestoreErrors';

// ----------------------------------------------------------------------
// Task 1: TypeScript Interfaces
// ----------------------------------------------------------------------

export interface PropertySummary {
  propertyId?: string;
  title?: string;
  rentAmount?: number;
  location?: string;
  imageUrl?: string;
}

export interface ChatMessage {
  id?: string;
  messageId: string;
  senderUid: string;
  text: string;
  imageUrl?: string | null;
  createdAt: any;
}

export interface Conversation {
  id?: string;
  conversationId: string;
  propertyId: string;
  landlordUid: string;
  tenantUid: string;
  participants: string[];
  propertyDetails?: PropertySummary;
  lastMessage?: string;
  lastMessageSenderUid?: string;
  lastMessageTimestamp?: any;
  createdAt: any;
  updatedAt: any;
}

// ----------------------------------------------------------------------
// Task 2: Start or Retrieve Existing Conversation
// ----------------------------------------------------------------------

/**
 * Starts a new conversation or retrieves the existing one between the landlord and tenant
 * for a specific property listing.
 *
 * @param propertyId The unique property identifier
 * @param landlordUid The UID of the landlord
 * @param tenantUid The UID of the prospective tenant
 * @param propertyDetails Optional summary of property (title, rent, location, image)
 * @returns Promise resolving to the conversation ID and conversation document data
 */
export async function startConversation(
  propertyId: string,
  landlordUid: string,
  tenantUid: string,
  propertyDetails?: PropertySummary
): Promise<{ conversationId: string; conversation: Conversation; isNew: boolean }> {
  try {
    if (!propertyId || !landlordUid || !tenantUid) {
      throw new Error('propertyId, landlordUid, and tenantUid are required to initiate a conversation.');
    }

    const conversationsRef = collection(db, 'conversations');

    // Check if an active conversation already exists between these two users for this property
    const existingQuery = query(
      conversationsRef,
      where('propertyId', '==', propertyId),
      where('landlordUid', '==', landlordUid),
      where('tenantUid', '==', tenantUid),
      limit(1)
    );

    let querySnapshot;
    try {
      querySnapshot = await getDocs(existingQuery);
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, 'conversations');
    }

    if (querySnapshot && !querySnapshot.empty) {
      const existingDoc = querySnapshot.docs[0];
      const data = existingDoc.data() as Conversation;
      return {
        conversationId: existingDoc.id,
        conversation: {
          id: existingDoc.id,
          ...data,
        },
        isNew: false,
      };
    }

    // No existing conversation found; generate a new unique conversation document
    const newDocRef = doc(conversationsRef);
    const conversationId = newDocRef.id;

    const newConversation: Conversation = {
      conversationId,
      propertyId,
      landlordUid,
      tenantUid,
      participants: [landlordUid, tenantUid],
      propertyDetails: propertyDetails || {},
      lastMessage: '',
      lastMessageSenderUid: '',
      lastMessageTimestamp: serverTimestamp(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    try {
      await setDoc(newDocRef, newConversation);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `conversations/${conversationId}`);
    }

    return {
      conversationId,
      conversation: {
        id: conversationId,
        ...newConversation,
      },
      isNew: true,
    };
  } catch (error) {
    console.error('Error starting conversation:', error);
    throw error;
  }
}

// ----------------------------------------------------------------------
// Task 3: Send Message in Conversation Subcollection
// ----------------------------------------------------------------------

/**
 * Sends a message within a conversation's 'messages' subcollection and
 * updates the parent conversation's lastMessage and updatedAt fields.
 *
 * @param conversationId The ID of the parent conversation
 * @param senderUid The UID of the sender
 * @param text The text body of the message
 * @param imageUrl Optional image URL attachment
 * @returns Promise resolving to the newly created ChatMessage
 */
export async function sendMessage(
  conversationId: string,
  senderUid: string,
  text: string,
  imageUrl?: string | null
): Promise<ChatMessage> {
  try {
    if (!conversationId || !senderUid) {
      throw new Error('conversationId and senderUid are required to send a message.');
    }

    const trimmedText = (text || '').trim();
    if (!trimmedText && !imageUrl) {
      throw new Error('Message cannot be empty. Provide text or an image.');
    }

    // 1. Add document to messages subcollection
    const messagesColRef = collection(db, 'conversations', conversationId, 'messages');
    const messageDocRef = doc(messagesColRef);
    const messageId = messageDocRef.id;

    const messageData: ChatMessage = {
      messageId,
      senderUid,
      text: trimmedText,
      imageUrl: imageUrl || null,
      createdAt: serverTimestamp(),
    };

    try {
      await setDoc(messageDocRef, messageData);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `conversations/${conversationId}/messages/${messageId}`);
    }

    // 2. Update parent conversation metadata
    const parentConvRef = doc(db, 'conversations', conversationId);
    const displaySnippet = trimmedText || (imageUrl ? '📷 Photo' : 'New message');

    try {
      await updateDoc(parentConvRef, {
        lastMessage: displaySnippet,
        lastMessageSenderUid: senderUid,
        lastMessageTimestamp: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.warn('Warning updating conversation metadata after message send:', err);
    }

    return {
      id: messageId,
      ...messageData,
    };
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
}

// ----------------------------------------------------------------------
// Task 4: Real-time Listeners (onSnapshot)
// ----------------------------------------------------------------------

/**
 * Real-time listener for all conversations where user is a participant.
 *
 * @param userUid The current authenticated user UID
 * @param callback Callback fired whenever conversations change
 * @param onError Optional error handler
 * @returns Unsubscribe function
 */
export function subscribeToUserConversations(
  userUid: string,
  callback: (conversations: Conversation[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  if (!userUid) {
    console.warn('subscribeToUserConversations called without userUid');
    return () => {};
  }

  const conversationsRef = collection(db, 'conversations');
  const q = query(
    conversationsRef,
    where('participants', 'array-contains', userUid),
    orderBy('updatedAt', 'desc')
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const conversations: Conversation[] = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as Conversation),
      }));
      callback(conversations);
    },
    (error) => {
      console.error(`Error subscribing to user conversations (${userUid}):`, error);
      if (onError) {
        onError(error);
      } else {
        handleFirestoreError(error, OperationType.LIST, 'conversations');
      }
    }
  );
}

/**
 * Real-time listener for messages inside a specific conversation subcollection.
 *
 * @param conversationId The ID of the conversation
 * @param callback Callback fired with chronologically sorted messages
 * @param onError Optional error handler
 * @returns Unsubscribe function
 */
export function subscribeToMessages(
  conversationId: string,
  callback: (messages: ChatMessage[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  if (!conversationId) {
    console.warn('subscribeToMessages called without conversationId');
    return () => {};
  }

  const messagesRef = collection(db, 'conversations', conversationId, 'messages');
  const q = query(messagesRef, orderBy('createdAt', 'asc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const messages: ChatMessage[] = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as ChatMessage),
      }));
      callback(messages);
    },
    (error) => {
      console.error(`Error subscribing to messages (${conversationId}):`, error);
      if (onError) {
        onError(error);
      } else {
        handleFirestoreError(error, OperationType.LIST, `conversations/${conversationId}/messages`);
      }
    }
  );
}
