/**
 * Thikana Real Estate Platform
 * Shared TypeScript Definitions
 */

export type UserRole = 'tenant' | 'landlord' | 'agent';

export interface PublicProfile {
  uid: string;
  displayName: string;
  photoURL: string;
  role: UserRole;
  isVerified: boolean;
}

export interface PrivateUser {
  uid: string;
  phoneNumber: string;
  nidNumber: string;
  dateOfBirth: string;
  hiddenAddress: string;
}

export interface AdditionalUserData {
  displayName?: string;
  photoURL?: string;
  role?: UserRole;
  phoneNumber?: string;
  nidNumber?: string;
  dateOfBirth?: string;
  hiddenAddress?: string;
}

export type PropertyCategory =
  | 'apartment'
  | 'house'
  | 'bachelor_sublet'
  | 'family_unit'
  | 'commercial'
  | 'hostel';

export interface PropertyListing {
  propertyId: string;
  landlordUid: string;
  title: string;
  rentAmount: number;
  category: PropertyCategory;
  location: string;
  amenities: string[];
  images: string[];
  imageUrls?: string[];
  createdAt: any;
}

export interface PropertyDataInput {
  propertyId?: string;
  title: string;
  rentAmount: number;
  category: PropertyCategory;
  location: string;
  amenities: string[];
  images?: string[];
  imageUrls?: string[];
}

export interface PropertyFilters {
  category?: PropertyCategory | string;
  location?: string;
  minRent?: number;
  maxRent?: number;
  pageSize?: number;
}
