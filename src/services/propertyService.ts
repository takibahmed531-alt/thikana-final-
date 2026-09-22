/**
 * Thikana Real Estate Platform
 * Property CRUD Operations & Image Compression Services
 * Uses Firebase v9+ Modular SDK
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
  getDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
  QueryConstraint,
  QueryDocumentSnapshot,
  DocumentData,
} from 'firebase/firestore';
import { db, storage } from '../firebase';
import {
  PropertyDataInput,
  PropertyListing,
  PropertyFilters,
} from '../types';
import { handleFirestoreError, OperationType } from './firestoreErrors';

export interface PropertyCreationResponse {
  success: boolean;
  propertyId: string;
  property: PropertyListing;
  message?: string;
}

export interface PropertyFetchResponse {
  success: boolean;
  properties: PropertyListing[];
  lastDoc: QueryDocumentSnapshot<DocumentData> | null;
  hasMore: boolean;
  count: number;
}

export interface SinglePropertyResponse {
  success: boolean;
  property: PropertyListing | null;
  message?: string;
}

/**
 * Task 1: Image Compression & Storage Upload
 * Compresses each image file to under 200KB using browser-image-compression,
 * uploads each to Firebase Storage in 'propertyImages/' folder, and returns download URLs.
 *
 * @param files Array of File objects or a FileList from an <input type="file">
 * @returns Promise resolving to an array of public download URLs
 */
export async function uploadPropertyImages(files: File[] | FileList): Promise<string[]> {
  try {
    const fileArray = Array.isArray(files) ? files : Array.from(files);

    if (!fileArray || fileArray.length === 0) {
      return [];
    }

    // Compression options: guaranteed under 200KB (0.195MB)
    const compressionOptions = {
      maxSizeMB: 0.195, // Under 200KB
      maxWidthOrHeight: 1920,
      useWebWorker: true,
      fileType: 'image/webp', // High efficiency web format
    };

    const uploadPromises = fileArray.map(async (originalFile, index) => {
      // Validate file type
      if (!originalFile.type.startsWith('image/')) {
        throw new Error(`File "${originalFile.name}" is not a valid image format.`);
      }

      // Step 1: Compress image
      let compressedFile: File | Blob;
      try {
        compressedFile = await imageCompression(originalFile, compressionOptions);
      } catch (compressionErr) {
        console.warn(`Compression fallback for ${originalFile.name}:`, compressionErr);
        compressedFile = originalFile;
      }

      // Step 2: Generate unique storage path
      const sanitizedName = originalFile.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const uniqueId = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}_${index}`;
      const storagePath = `propertyImages/${uniqueId}_${sanitizedName}`;
      const imageStorageRef = ref(storage, storagePath);

      // Step 3: Upload bytes to Firebase Storage
      const metadata = {
        contentType: compressedFile.type || 'image/jpeg',
        customMetadata: {
          originalName: originalFile.name,
          uploadedAt: new Date().toISOString(),
        },
      };

      const uploadResult = await uploadBytes(imageStorageRef, compressedFile, metadata);

      // Step 4: Retrieve public download URL
      const downloadURL = await getDownloadURL(uploadResult.ref);
      return downloadURL;
    });

    const downloadURLs = await Promise.all(uploadPromises);
    return downloadURLs;
  } catch (error: any) {
    console.error('Error in uploadPropertyImages:', error);
    throw new Error(
      error?.code === 'storage/unauthorized'
        ? 'Permission denied uploading images. Please verify your authentication status.'
        : error?.code === 'storage/quota-exceeded'
        ? 'Storage quota exceeded. Please contact platform support.'
        : error?.message || 'Failed to compress and upload property images.'
    );
  }
}

/**
 * Generates a unique short Ad ID for searching and offline reference (e.g. THK-87B2A)
 */
export function generateShortAdId(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let random = '';
  for (let i = 0; i < 5; i++) {
    random += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `THK-${random}`;
}

/**
 * Task 2: Create Property
 * Compresses and uploads provided imageFiles, then saves complete listing data
 * into the 'properties' Firestore collection with serverTimestamp().
 *
 * @param propertyData Basic property attributes (title, rentAmount, category, location, amenities)
 * @param imageFiles Image files to compress and upload
 * @param landlordUid Authenticated UID of the landlord
 */
export async function createProperty(
  propertyData: PropertyDataInput,
  imageFiles: File[] | FileList = [],
  landlordUid: string
): Promise<PropertyCreationResponse> {
  try {
    if (!landlordUid || !landlordUid.trim()) {
      throw new Error('Landlord UID is required to create a property listing.');
    }

    if (!propertyData.title || propertyData.title.trim().length < 3) {
      throw new Error('Property title must be at least 3 characters.');
    }

    if (propertyData.rentAmount === undefined || propertyData.rentAmount === null || Number(propertyData.rentAmount) < 0) {
      throw new Error('Valid monthly rent amount is required.');
    }

    if (!propertyData.location || propertyData.location.trim().length < 2) {
      throw new Error('Property location is required.');
    }

    // Step 1: Upload and compress images if files were provided
    let uploadedImageUrls: string[] = [];
    if (imageFiles && (Array.isArray(imageFiles) ? imageFiles.length > 0 : imageFiles.length > 0)) {
      uploadedImageUrls = await uploadPropertyImages(imageFiles);
    }

    // Combine any pre-existing URLs with newly uploaded URLs
    const finalImages = [
      ...(propertyData.images || []),
      ...(propertyData.imageUrls || []),
      ...uploadedImageUrls,
    ];

    // Step 2: Initialize Firestore document reference
    const propertyDocRef = propertyData.propertyId
      ? doc(db, 'properties', propertyData.propertyId)
      : doc(collection(db, 'properties'));

    const propertyId = propertyDocRef.id;

    // Sanitize coordinates (fallback to central Dhaka if missing or malformed for backward compatibility)
    const sanitizedCoordinates: [number, number] =
      Array.isArray(propertyData.coordinates) &&
      propertyData.coordinates.length === 2 &&
      typeof propertyData.coordinates[0] === 'number' &&
      !isNaN(propertyData.coordinates[0]) &&
      typeof propertyData.coordinates[1] === 'number' &&
      !isNaN(propertyData.coordinates[1])
        ? [propertyData.coordinates[0], propertyData.coordinates[1]]
        : [23.8103, 90.4125];

    // Optional availableSeats validation
    const parsedSeats =
      propertyData.availableSeats !== undefined && propertyData.availableSeats !== null
        ? Number(propertyData.availableSeats)
        : undefined;

    // Step 3: Build listing payload conforming to Firestore security schema
    const adId =
      propertyData.adId && propertyData.adId.trim().length >= 5
        ? propertyData.adId.trim()
        : generateShortAdId();

    const completePropertyData: PropertyListing = {
      propertyId,
      adId,
      landlordUid,
      title: propertyData.title.trim(),
      rentAmount: Number(propertyData.rentAmount),
      category: propertyData.category || 'apartment',
      location: propertyData.location.trim(),
      amenities: Array.isArray(propertyData.amenities) ? propertyData.amenities : [],
      images: finalImages,
      imageUrls: finalImages, // Provided as alias for consistency
      genderPreference: propertyData.genderPreference || 'Any',
      ...(parsedSeats !== undefined && !isNaN(parsedSeats) && parsedSeats >= 0
        ? { availableSeats: parsedSeats }
        : {}),
      status: 'available', // Default to 'available' per specification
      coordinates: sanitizedCoordinates,
      createdAt: serverTimestamp(),
    };

    // Step 4: Write to 'properties' collection
    try {
      await setDoc(propertyDocRef, completePropertyData);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `properties/${propertyId}`);
    }

    return {
      success: true,
      propertyId,
      property: completePropertyData,
      message: 'Property listing created successfully.',
    };
  } catch (error: any) {
    console.error('Error creating property:', error);
    throw error;
  }
}

/**
 * Task 3: Read Properties (Cost-Optimized Pagination)
 * Fetches properties from Firestore with filtering and cursor-based pagination (startAfter)
 * to minimize read operations.
 *
 * @param filters Optional filter criteria (category, location, pageSize)
 * @param lastVisibleDoc Last QueryDocumentSnapshot from previous page for startAfter cursor
 */
export async function getProperties(
  filters?: PropertyFilters,
  lastVisibleDoc?: QueryDocumentSnapshot<DocumentData> | null
): Promise<PropertyFetchResponse> {
  try {
    const propertiesCollection = collection(db, 'properties');
    const constraints: QueryConstraint[] = [];
    const pageSize = filters?.pageSize && filters.pageSize > 0 ? filters.pageSize : 10;

    // Filter by Category if specified
    if (filters?.category && filters.category.trim() !== '') {
      constraints.push(where('category', '==', filters.category.trim()));
    }

    // Filter by Location if specified
    if (filters?.location && filters.location.trim() !== '') {
      constraints.push(where('location', '==', filters.location.trim()));
    }

    // Deterministic ordering for pagination
    constraints.push(orderBy('createdAt', 'desc'));

    // Cursor-based pagination to minimize reads
    if (lastVisibleDoc) {
      constraints.push(startAfter(lastVisibleDoc));
    }

    // Page limit constraint
    constraints.push(limit(pageSize));

    const q = query(propertiesCollection, ...constraints);
    let snapshot;
    try {
      snapshot = await getDocs(q);
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'properties');
    }

    const properties: PropertyListing[] = [];
    if (snapshot && !snapshot.empty) {
      snapshot.forEach((docSnap) => {
        properties.push(docSnap.data() as PropertyListing);
      });
    }

    const newLastDoc = (snapshot && snapshot.docs && snapshot.docs.length > 0)
      ? snapshot.docs[snapshot.docs.length - 1]
      : null;
    const hasMore = Boolean(snapshot && snapshot.docs && snapshot.docs.length === pageSize);

    return {
      success: true,
      properties,
      lastDoc: newLastDoc,
      hasMore,
      count: properties.length,
    };
  } catch (error: any) {
    console.error('Error fetching properties:', error);
    throw error;
  }
}

/**
 * Task 4: Get Single Property
 * Fetches a specific property document by its unique ID.
 *
 * @param propertyId The unique property document ID
 */
export async function getPropertyById(propertyId: string): Promise<SinglePropertyResponse> {
  try {
    if (!propertyId || !propertyId.trim()) {
      throw new Error('Valid property ID is required.');
    }

    const docRef = doc(db, 'properties', propertyId.trim());
    let docSnap;
    try {
      docSnap = await getDoc(docRef);
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, `properties/${propertyId.trim()}`);
    }

    if (!docSnap.exists()) {
      return {
        success: false,
        property: null,
        message: `Property with ID "${propertyId}" does not exist.`,
      };
    }

    const property = docSnap.data() as PropertyListing;

    return {
      success: true,
      property,
    };
  } catch (error: any) {
    console.error(`Error fetching property ${propertyId}:`, error);
    throw error;
  }
}

/**
 * Task 5: Search Property by Short Ad ID
 * Fetches a property document by its unique short Ad ID (e.g. THK-XXXXX).
 *
 * @param adId The unique short Ad ID
 */
export async function getPropertyByAdId(adId: string): Promise<SinglePropertyResponse> {
  try {
    if (!adId || !adId.trim()) {
      throw new Error('Valid Ad ID is required.');
    }

    const q = query(
      collection(db, 'properties'),
      where('adId', '==', adId.trim().toUpperCase()),
      limit(1)
    );

    let querySnapshot;
    try {
      querySnapshot = await getDocs(q);
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'properties');
    }

    if (!querySnapshot || querySnapshot.empty) {
      return {
        success: false,
        property: null,
        message: `Property with Ad ID "${adId}" not found.`,
      };
    }

    const docSnap = querySnapshot.docs[0];
    const property = docSnap.data() as PropertyListing;

    return {
      success: true,
      property,
    };
  } catch (error: any) {
    console.error(`Error searching property by Ad ID ${adId}:`, error);
    throw error;
  }
}

/**
 * Deletes a property document from the 'properties' collection in Firestore.
 *
 * @param propertyId The unique property document ID
 * @returns Promise resolving to true on success
 */
export async function deletePropertyListing(propertyId: string): Promise<boolean> {
  try {
    if (!propertyId || !propertyId.trim()) {
      throw new Error('Valid Property ID is required.');
    }
    await deleteDoc(doc(db, 'properties', propertyId));
    return true;
  } catch (error: any) {
    console.error(`Error deleting property listing ${propertyId}:`, error);
    throw error;
  }
}

/**
 * Updates a property document in the 'properties' collection in Firestore,
 * optionally compressing and uploading new images and merging their URLs.
 *
 * @param propertyId The unique property document ID
 * @param updatedData The updated property fields object
 * @param newImageFiles Optional array of new image files to compress and upload
 * @returns Promise resolving to true on success
 */
export async function updatePropertyListing(
  propertyId: string,
  updatedData: any,
  newImageFiles: File[] = []
): Promise<boolean> {
  try {
    if (!propertyId || !propertyId.trim()) {
      throw new Error('Valid Property ID is required.');
    }

    if (newImageFiles && newImageFiles.length > 0) {
      const uploadedUrls = await uploadPropertyImages(newImageFiles);
      const existingImages = Array.isArray(updatedData?.images) ? updatedData.images : [];
      updatedData.images = [...existingImages, ...uploadedUrls];
    }

    await updateDoc(doc(db, 'properties', propertyId), updatedData);
    return true;
  } catch (error: any) {
    console.error(`Error updating property ${propertyId}:`, error);
    throw error;
  }
}

