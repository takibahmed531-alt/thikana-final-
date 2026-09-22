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
export type OccupationPreference = 'Any' | 'Student' | 'Job Holder';
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
  occupationPreference?: OccupationPreference | string;
  minAge?: number;
  maxAge?: number;
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
  occupationPreference?: OccupationPreference | string;
  minAge?: number;
  maxAge?: number;
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

export interface PropertySummary {
  propertyId?: string;
  title?: string;
  rentAmount?: number;
  location?: string;
  imageUrl?: string;
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

export interface SupportTicket {
  ticketId: string;
  userUid: string;
  email: string;
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  createdAt: string;
}

export interface SearchAlert {
  id?: string;
  alertId?: string;
  userUid: string;
  userEmail?: string;
  area: string;
  category: string;
  minRent?: number;
  maxRent?: number;
  genderPreference?: 'Any' | 'Male' | 'Female' | string;
  emailNotifications?: boolean;
  createdAt: any;
  lastNotifiedAt?: any;
}

export interface NotificationLog {
  id?: string;
  logId: string;
  userUid: string;
  userEmail: string;
  propertyId: string;
  propertyTitle?: string;
  alertId?: string;
  status: 'sent' | 'delivered' | 'simulated' | 'failed';
  createdAt: any;
}

export interface AlertMatchResult {
  matchedAlertsCount: number;
  dispatchedEmailsCount: number;
  results: {
    alertId?: string;
    userUid: string;
    userEmail: string;
    status: 'sent' | 'simulated' | 'failed';
    message?: string;
  }[];
}

