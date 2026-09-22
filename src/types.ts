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

export interface UserPreferences {
  theme: 'light' | 'dark';
  notificationsEnabled: boolean;
}

export interface PrivateUser {
  uid: string;
  phoneNumber: string;
  nidNumber: string;
  dateOfBirth: string;
  hiddenAddress: string;
  preferences?: {
    theme: 'light' | 'dark';
    notificationsEnabled: boolean;
  };
}

export interface AdditionalUserData {
  displayName?: string;
  photoURL?: string;
  role?: UserRole;
  phoneNumber?: string;
  nidNumber?: string;
  dateOfBirth?: string;
  hiddenAddress?: string;
  preferences?: {
    theme: 'light' | 'dark';
    notificationsEnabled: boolean;
  };
}

export type PropertyCategory =
  | 'apartment'
  | 'house'
  | 'bachelor_sublet'
  | 'family_unit'
  | 'commercial'
  | 'hostel';

export type GenderPreference = 'Any' | 'Male' | 'Female';
export type PropertyStatus = 'available' | 'rented';

export interface PropertyListing {
  propertyId: string;
  adId: string;
  landlordUid: string;
  title: string;
  rentAmount: number;
  category: PropertyCategory;
  location: string;
  amenities: string[];
  images: string[];
  imageUrls?: string[];
  genderPreference: 'Any' | 'Male' | 'Female';
  availableSeats?: number;
  status: 'available' | 'rented';
  coordinates: [number, number];
  createdAt: any;
}

export interface PropertyDataInput {
  propertyId?: string;
  adId?: string;
  title: string;
  rentAmount: number;
  category: PropertyCategory;
  location: string;
  amenities: string[];
  images?: string[];
  imageUrls?: string[];
  genderPreference: 'Any' | 'Male' | 'Female';
  availableSeats?: number;
  status: 'available' | 'rented';
  coordinates: [number, number];
}

export interface PropertyFilters {
  category?: PropertyCategory | string;
  location?: string;
  minRent?: number;
  maxRent?: number;
  pageSize?: number;
}

export interface Report {
  reportId: string;
  reporterUid: string;
  targetId: string; // can be propertyId or userUid
  targetType: 'property' | 'user';
  reason: string;
  description?: string;
  status: 'pending' | 'reviewed';
  createdAt: any;
}

