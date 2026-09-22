/**
 * Thikana Real Estate Platform
 * Chat & Messaging Services using Firebase v9+ Modular SDK
 */

import imageCompression from 'browser-image-compression';
import {
  ref,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage';
import {
  collection,
  doc,
  setDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  updateDoc,
  onSnapshot,
  Unsubscribe,
  limit,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { db, storage } from '../firebase';
import { handleFirestoreError, OperationType } from './firestoreErrors';

// ----------------------------------------------------------------------
// Image Compression & Chat Image Upload
// ----------------------------------------------------------------------

/**
 * Compresses an image and uploads it to Firebase Storage for chat attachments.
 *
 * @param file The image File object to compress and upload
 * @returns Promise resolving to the public download URL
 */
export async function uploadChatImage(file: File): Promise<string> {
  try {
    if (!file) {
      throw new Error('No file provided for upload.');
    }

    // Compress the image using browser-image-compression
    const options = {
      maxSizeMB: 0.2,
      maxWidthOrHeight: 1024,
      useWebWorker: true,
    };

    const compressedFile = await imageCompression(file, options);

    // Upload the compressed file to Firebase Storage under chatImages/{timestamp}_{filename}
    const timestamp = Date.now();
    const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `chatImages/${timestamp}_${sanitizedFilename}`;
    const storageRef = ref(storage, storagePath);

    const snapshot = await uploadBytes(storageRef, compressedFile);
    const downloadURL = await getDownloadURL(snapshot.ref);

    return downloadURL;
  } catch (error) {
    console.error('Error uploading chat image:', error);
    throw error;
  }
}

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
  status?: 'sent' | 'delivered' | 'read';
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
  deletedBy?: string[];
  starredBy?: string[];
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
      participants: [tenantUid, landlordUid],
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

/**
 * Starts or retrieves an existing conversation between a tenant and landlord for a property,
 * and immediately sends the first message inside the messages subcollection.
 *
 * @param tenantUid UID of the prospective tenant (sender of the initial message)
 * @param landlordUid UID of the property landlord
 * @param propertyId The unique property identifier
 * @param propertyDetails Optional summary of property (title, rent, location, image)
 * @param messageText The initial message text to send
 * @returns Promise resolving to the conversation ID, conversation document, and sent message
 */
export async function startConversationAndSendMessage(
  tenantUid: string,
  landlordUid: string,
  propertyId: string,
  propertyDetails?: PropertySummary,
  messageText?: string
): Promise<{
  conversationId: string;
  conversation: Conversation;
  message?: ChatMessage;
  isNew: boolean;
}> {
  try {
    if (!tenantUid || !landlordUid || !propertyId) {
      throw new Error('tenantUid, landlordUid, and propertyId are required to start a conversation.');
    }

    // 1. Check if conversation already exists or create a new one
    const convResult = await startConversation(propertyId, landlordUid, tenantUid, propertyDetails);
    const { conversationId, conversation, isNew } = convResult;

    // 2. Ensure the parent conversation document has explicit landlordUid, tenantUid, participants, and updatedAt
    const parentRef = doc(db, 'conversations', conversationId);
    try {
      await updateDoc(parentRef, {
        landlordUid,
        tenantUid,
        participants: [tenantUid, landlordUid],
        updatedAt: serverTimestamp(),
      });
    } catch (updateErr) {
      console.warn('Non-blocking conversation metadata update notice:', updateErr);
    }

    // 3. Send the initial message if message text is provided
    let sentMsg: ChatMessage | undefined;
    const trimmedMessage = (messageText || '').trim();
    if (trimmedMessage) {
      sentMsg = await sendMessage(conversationId, tenantUid, trimmedMessage);
    }

    return {
      conversationId,
      conversation: {
        ...conversation,
        landlordUid,
        tenantUid,
        participants: [tenantUid, landlordUid],
      },
      message: sentMsg,
      isNew,
    };
  } catch (error) {
    console.error('Error starting conversation and sending message:', error);
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
      status: 'sent',
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
    where('participants', 'array-contains', userUid)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const conversations: Conversation[] = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as Conversation),
      }));

      // Sort client-side by updatedAt desc to bypass composite index requirement
      conversations.sort((a, b) => (b.updatedAt?.toMillis?.() || b.updatedAt?.seconds || 0) - (a.updatedAt?.toMillis?.() || a.updatedAt?.seconds || 0));

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

// ----------------------------------------------------------------------
// Task 4: Soft Deletion & Starring
// ----------------------------------------------------------------------

/**
 * Soft-deletes a conversation for a specific user by adding their UID to the deletedBy array.
 *
 * @param conversationId The ID of the conversation
 * @param userUid The UID of the user who wants to hide/delete the conversation
 * @returns Promise resolving to operation status
 */
export async function softDeleteConversation(
  conversationId: string,
  userUid: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!conversationId || !userUid) {
      throw new Error('conversationId and userUid are required to soft-delete a conversation.');
    }
    const convDocRef = doc(db, 'conversations', conversationId);
    await updateDoc(convDocRef, {
      deletedBy: arrayUnion(userUid),
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (err: any) {
    console.error(`Error soft-deleting conversation (${conversationId}):`, err);
    handleFirestoreError(err, OperationType.UPDATE, `conversations/${conversationId}`);
    return { success: false, error: err?.message || 'Failed to soft delete conversation.' };
  }
}

/**
 * Toggles the starred status of a conversation for a specific user.
 * Checks if the userUid is in the starredBy array and toggles it using arrayUnion or arrayRemove.
 *
 * @param conversationId The ID of the conversation
 * @param userUid The UID of the user toggling the star
 * @returns Promise resolving to operation status and new starred state
 */
export async function toggleStarConversation(
  conversationId: string,
  userUid: string
): Promise<{ success: boolean; isStarred: boolean; error?: string }> {
  try {
    if (!conversationId || !userUid) {
      throw new Error('conversationId and userUid are required to toggle star.');
    }
    const convDocRef = doc(db, 'conversations', conversationId);
    const convSnap = await getDoc(convDocRef);
    if (!convSnap.exists()) {
      throw new Error('Conversation does not exist.');
    }

    const data = convSnap.data() as Conversation;
    const starredBy = data.starredBy || [];
    const isCurrentlyStarred = starredBy.includes(userUid);

    await updateDoc(convDocRef, {
      starredBy: isCurrentlyStarred ? arrayRemove(userUid) : arrayUnion(userUid),
      updatedAt: serverTimestamp(),
    });

    return { success: true, isStarred: !isCurrentlyStarred };
  } catch (err: any) {
    console.error(`Error toggling star on conversation (${conversationId}):`, err);
    handleFirestoreError(err, OperationType.UPDATE, `conversations/${conversationId}`);
    return {
      success: false,
      isStarred: false,
      error: err?.message || 'Failed to toggle star on conversation.',
    };
  }
}
