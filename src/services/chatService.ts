/**
 * Thikana Real Estate Platform
 * Chat & Messaging Services using Firebase v9+ Modular SDK
 */

import imageCompression from 'browser-image-compression';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  getStorage,
} from 'firebase/storage';
import {
  collection,
  doc,
  setDoc,
  getDocs,
  getDoc,
  deleteDoc,
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
import { auth, db, storage } from '../firebase';
import { handleFirestoreError, OperationType } from './firestoreErrors';
import { updateUserLastActive } from './authService';

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
      maxSizeMB: 0.5,
      maxWidthOrHeight: 1080,
      useWebWorker: true,
    };

    const compressedFile = await imageCompression(file, options);

    const storagePath = `chatImages/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
    const imageRef = ref(storage, storagePath);

    const metadata = { contentType: file.type || 'image/jpeg' };
    await uploadBytes(imageRef, compressedFile, metadata);
    const downloadURL = await getDownloadURL(imageRef);

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
    // Query by current user's participation to comply with security rules and avoid composite index requirement
    const callerUid = auth.currentUser?.uid || tenantUid;
    const existingQuery = query(
      conversationsRef,
      where('participants', 'array-contains', callerUid)
    );

    let querySnapshot;
    try {
      querySnapshot = await getDocs(existingQuery);
    } catch (err) {
      console.warn('Existing conversation lookup warning:', err);
    }

    if (querySnapshot && !querySnapshot.empty) {
      const matchDoc = querySnapshot.docs.find((d) => {
        const data = d.data() as Conversation;
        const participants = data.participants || [];
        const isSameProp = data.propertyId === propertyId;
        const hasBoth =
          (participants.includes(tenantUid) && participants.includes(landlordUid)) ||
          (data.tenantUid === tenantUid && data.landlordUid === landlordUid);
        return isSameProp && hasBoth;
      });

      if (matchDoc) {
        const data = matchDoc.data() as Conversation;
        return {
          conversationId: matchDoc.id,
          conversation: {
            id: matchDoc.id,
            ...data,
          },
          isNew: false,
        };
      }
    }

    // No existing conversation found; generate a new unique conversation document
    const newDocRef = doc(conversationsRef);
    const conversationId = newDocRef.id;
    const participantsList = Array.from(new Set([tenantUid, landlordUid]));

    const newConversation: Conversation = {
      conversationId,
      propertyId,
      landlordUid,
      tenantUid,
      participants: participantsList,
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
    const participantsList = Array.from(new Set([tenantUid, landlordUid]));
    try {
      await updateDoc(parentRef, {
        landlordUid,
        tenantUid,
        participants: participantsList,
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
        participants: participantsList,
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

    // Event-driven presence: update lastActive when user sends a message
    updateUserLastActive(senderUid).catch(() => {});

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
      }
      callback([]);
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
      }
      callback([]);
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

/**
 * Deletes an individual chat message document from Firestore and strictly
 * deletes its associated image from Firebase Storage if present to prevent orphaned files.
 *
 * @param conversationId The ID of the conversation parent document
 * @param messageId The ID of the message document
 * @param imageUrl Optional direct image URL of the message (if omitted, doc is inspected)
 * @returns Promise resolving to operation status
 */
export async function deleteMessage(
  conversationId: string,
  messageId: string,
  imageUrl?: string | null
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!conversationId || !messageId) {
      throw new Error('conversationId and messageId are required to delete a message.');
    }

    let targetImageUrl = imageUrl;

    // If imageUrl wasn't provided, inspect Firestore document to extract any imageUrl
    if (!targetImageUrl) {
      try {
        const msgDocRef = doc(db, 'conversations', conversationId, 'messages', messageId);
        const msgSnap = await getDoc(msgDocRef);
        if (msgSnap.exists()) {
          const data = msgSnap.data() as ChatMessage;
          targetImageUrl = data.imageUrl || null;
        }
      } catch (inspectErr) {
        console.warn(`Could not inspect message document (${messageId}) for image URL:`, inspectErr);
      }
    }

    // Step 1: Strict storage deletion if an attached image exists
    if (targetImageUrl && typeof targetImageUrl === 'string') {
      try {
        if (
          targetImageUrl.includes('firebasestorage.googleapis.com') ||
          targetImageUrl.startsWith('gs://') ||
          targetImageUrl.startsWith('chatImages/')
        ) {
          const storageInstance = storage || getStorage();
          const imageRef = ref(storageInstance, targetImageUrl);
          await deleteObject(imageRef);
        }
      } catch (storageErr) {
        // Log warning and proceed so Firestore document is still deleted even if image is missing
        console.warn(`Could not delete message image from storage (${targetImageUrl}):`, storageErr);
      }
    }

    // Step 2: Delete message document from Firestore
    const msgDocRef = doc(db, 'conversations', conversationId, 'messages', messageId);
    await deleteDoc(msgDocRef);

    return { success: true };
  } catch (err: any) {
    console.error(`Error deleting message ${messageId} in conversation ${conversationId}:`, err);
    handleFirestoreError(err, OperationType.DELETE, `conversations/${conversationId}/messages/${messageId}`);
    return { success: false, error: err?.message || 'Failed to delete message.' };
  }
}

