import { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'en' | 'bn';

export interface CoreTranslations {
  // Brand & Slogan
  brandName: string;
  brandSlogan: string;

  // Navigation & General
  home: string;
  saved: string;
  messages: string;
  profile: string;
  postAd: string;
  searchPlaceholder: string;
  signIn: string;
  signOut: string;
  cancel: string;
  backToListings: string;
  save: string;
  share: string;
  copied: string;
  copyAdId: string;
  adId: string;
  listingId: string;
  refresh: string;
  tryAgain: string;
  noPhoto: string;
  noPhotosAvailable: string;
  highResPhotos: string;

  // Hero & Search
  heroBadge: string;
  heroTitleStart: string;
  heroSubtitle: string;
  homeSearchPlaceholder: string;
  popularAreas: string;
  exploreCategory: string;

  // Categories
  familyFlat: string;
  bachelor: string;
  sublet: string;
  mess: string;
  commercial: string;
  allCategories: string;

  // Property Specs & Pricing
  monthlyRent: string;
  perMonth: string;
  beds: string;
  baths: string;
  sqft: string;
  unitSize: string;
  floorLevel: string;
  bedrooms: string;
  bathrooms: string;
  advance: string;
  security: string;
  securityAdvance: string;
  minimumLease: string;
  sixMonths: string;
  serviceGasCharge: string;
  gender: string;
  genderPreference: string;
  occupationPreference: string;
  seat: string;
  seats: string;
  seatsAvailable: string;
  available: string;
  availableFrom: string;
  posted: string;

  // Badges & Status
  rentedOut: string;
  availableForRent: string;
  verified: string;
  verifiedListing: string;
  directLandlord: string;
  propertyOwnerHost: string;
  verifiedIdentityNid: string;
  activeListings: string;
  memberSince: string;
  privacySafeguard: string;
  privacySafeguardDesc: string;

  // Property Details Page Sections
  aboutProperty: string;
  amenitiesFacilities: string;
  locationNeighborhood: string;
  interactiveMapDesc: string;
  quickChat: string;
  openFullMessenger: string;
  reportAd: string;
  editAd: string;
  deleteAd: string;

  // Pages & Footer Links
  privacyPolicy: string;
  aboutUs: string;
  faq: string;
  userManual: string;
  termsOfService: string;

  // Profile & Auth
  userProfileAuth: string;
  publicProfileInfo: string;
  privateIdentityVault: string;
  appSettings: string;
  postPropertyListing: string;
  editPropertyListing: string;
  listingTitle: string;
  accommodationCategory: string;
  publishToThikana: string;
  publishToBharaHobe: string;
  updateProperty: string;
  myPostedProperties: string;
  savePublicProfile: string;
  savePrivateVault: string;
}

export const translationDictionary: Record<Language, CoreTranslations> = {
  en: {
    // Brand & Slogan
    brandName: 'Bhara Hobe',
    brandSlogan: 'Renting properties, now at your fingertips!',

    // Navigation & General
    home: 'Home',
    saved: 'Saved',
    messages: 'Messages',
    profile: 'Profile',
    postAd: 'Post Ad',
    searchPlaceholder: 'Search city, area (e.g. Dhanmondi, Gulshan), or apartment...',
    signIn: 'Sign In',
    signOut: 'Sign Out',
    cancel: 'Cancel',
    backToListings: 'Back to Listings',
    save: 'Save',
    share: 'Share',
    copied: 'Copied',
    copyAdId: 'Copy Ad ID',
    adId: 'Ad ID',
    listingId: 'Listing ID',
    refresh: 'Refresh',
    tryAgain: 'Try Again',
    noPhoto: 'No Photo',
    noPhotosAvailable: 'No Photos Available',
    highResPhotos: 'High-Res Photos',

    // Hero & Search
    heroBadge: 'Discover Verified Homes in Bangladesh',
    heroTitleStart: 'Find your next rental home with',
    heroSubtitle: 'Renting properties, now at your fingertips!',
    homeSearchPlaceholder: 'Search by area (e.g., Dhanmondi) or Ad ID (e.g., TK-123456)...',
    popularAreas: 'Popular areas:',
    exploreCategory: 'Explore by Category',

    // Categories
    familyFlat: 'Family Flat',
    bachelor: 'Bachelor',
    sublet: 'Sublet',
    mess: 'Mess',
    commercial: 'Commercial',
    allCategories: 'All',

    // Property Specs & Pricing
    monthlyRent: 'Monthly Rent (BDT) *',
    perMonth: '/ month',
    beds: 'Beds',
    baths: 'Baths',
    sqft: 'sqft',
    unitSize: 'Unit Size',
    floorLevel: 'Floor Level',
    bedrooms: 'Bedrooms',
    bathrooms: 'Bathrooms',
    advance: 'Advance',
    security: 'Security',
    securityAdvance: 'Security & Advance',
    minimumLease: 'Minimum Lease',
    sixMonths: '6 Months',
    serviceGasCharge: 'Service & Gas Charge',
    gender: 'Gender',
    genderPreference: 'Gender Preference',
    occupationPreference: 'Occupation Preference',
    seat: 'Seat',
    seats: 'Seats',
    seatsAvailable: 'Seats Available',
    available: 'Available',
    availableFrom: 'Available From',
    posted: 'Posted',

    // Badges & Status
    rentedOut: 'Rented Out',
    availableForRent: 'Available for Rent',
    verified: 'Verified',
    verifiedListing: 'Verified Listing',
    directLandlord: 'Direct Landlord',
    propertyOwnerHost: 'Property Owner & Host',
    verifiedIdentityNid: 'Verified Identity (NID)',
    activeListings: 'Active Listings',
    memberSince: 'Member since',
    privacySafeguard: 'Privacy Safeguard',
    privacySafeguardDesc: 'Phone numbers are kept confidential to prevent spam. Use Bhara Hobe secure in-app messaging to negotiate and schedule physical visits.',

    // Property Details Page Sections
    aboutProperty: 'About this Property',
    amenitiesFacilities: 'Amenities & Facilities',
    locationNeighborhood: 'Location & Neighborhood',
    interactiveMapDesc: 'Precise location pin with interactive map navigation',
    quickChat: 'Quick Chat with Landlord',
    openFullMessenger: 'Open Full Messenger',
    reportAd: 'Report Ad',
    editAd: 'Edit Ad',
    deleteAd: 'Delete Ad',

    // Pages & Footer Links
    privacyPolicy: 'Privacy Policy',
    aboutUs: 'About Us',
    faq: 'FAQ',
    userManual: 'User Manual',
    termsOfService: 'Terms of Service',

    // Profile & Auth
    userProfileAuth: 'User Profile & Authentication',
    publicProfileInfo: 'Public Profile Information',
    privateIdentityVault: 'Private Identity Vault',
    appSettings: 'App Settings',
    postPropertyListing: 'Post a Property Listing',
    editPropertyListing: 'Edit Property Listing',
    listingTitle: 'Listing Title *',
    accommodationCategory: 'Accommodation Category *',
    publishToThikana: 'Publish to Bhara Hobe',
    publishToBharaHobe: 'Publish to Bhara Hobe',
    updateProperty: 'Update Property',
    myPostedProperties: 'My Posted Properties',
    savePublicProfile: 'Save Public Profile',
    savePrivateVault: 'Save Private Vault',
  },
  bn: {
    // Brand & Slogan
    brandName: 'ভাড়া হবে',
    brandSlogan: 'বাসা ভাড়া দেওয়া বা নেওয়া—এখন হাতের মুঠোয়!',

    // Navigation & General
    home: 'হোম',
    saved: 'সেভড',
    messages: 'মেসেজ',
    profile: 'প্রোফাইল',
    postAd: 'অ্যাড দিন',
    searchPlaceholder: 'লোকেশন বা এরিয়া সার্চ করুন...',
    signIn: 'লগইন করুন',
    signOut: 'লগআউট',
    cancel: 'বাতিল করুন',
    backToListings: 'লিস্টিংসে ফিরুন',
    save: 'সেভ করুন',
    share: 'শেয়ার',
    copied: 'কপি হয়েছে',
    copyAdId: 'অ্যাড আইডি কপি করুন',
    adId: 'অ্যাড আইডি',
    listingId: 'লিস্টিং আইডি',
    refresh: 'রিফ্রেশ',
    tryAgain: 'আবার চেষ্টা করুন',
    noPhoto: 'ছবি নেই',
    noPhotosAvailable: 'কোনো ছবি পাওয়া যায়নি',
    highResPhotos: 'হাই-রেজ ছবি',

    // Hero & Search
    heroBadge: 'বাংলাদেশে ভেরিফাইড বাসা খুঁজুন',
    heroTitleStart: 'খুঁজে নিন আপনার নতুন বাসা',
    heroSubtitle: 'বাসা ভাড়া দেওয়া বা নেওয়া—এখন হাতের মুঠোয়!',
    homeSearchPlaceholder: 'এরিয়া সার্চ করুন (যেমন: ধানমন্ডি) বা অ্যাড আইডি (যেমন: TK-123456)...',
    popularAreas: 'জনপ্রিয় এরিয়া:',
    exploreCategory: 'ক্যাটাগরি অনুযায়ী খুঁজুন',

    // Categories
    familyFlat: 'ফ্যামিলি ফ্ল্যাট',
    bachelor: 'ব্যাচেলর',
    sublet: 'সাবলেট',
    mess: 'মেস',
    commercial: 'কমার্শিয়াল',
    allCategories: 'সব',

    // Property Specs & Pricing
    monthlyRent: 'মাসিক ভাড়া (টাকা) *',
    perMonth: '/ মাস',
    beds: 'বেড',
    baths: 'বাথ',
    sqft: 'স্কয়ার ফুট',
    unitSize: 'সাইজ',
    floorLevel: 'ফ্লোর',
    bedrooms: 'বেডরুম',
    bathrooms: 'বাথরুম',
    advance: 'অ্যাডভান্স',
    security: 'সিকিউরিটি',
    securityAdvance: 'সিকিউরিটি ও অ্যাডভান্স',
    minimumLease: 'মিনিমাম লিজ',
    sixMonths: '৬ মাস',
    serviceGasCharge: 'সার্ভিস ও গ্যাস চার্জ',
    gender: 'জেন্ডার',
    genderPreference: 'জেন্ডার প্রেফারেন্স',
    occupationPreference: 'পেশা প্রেফারেন্স',
    seat: 'সিট',
    seats: 'সিট',
    seatsAvailable: 'সিট খালি আছে',
    available: 'ফাঁকা হবে',
    availableFrom: 'ফাঁকা হওয়ার তারিখ',
    posted: 'পোস্ট করা হয়েছে',

    // Badges & Status
    rentedOut: 'ভাড়া হয়ে গেছে',
    availableForRent: 'ভাড়ার জন্য ফাঁকা',
    verified: 'ভেরিফাইড',
    verifiedListing: 'ভেরিফাইড লিস্টিং',
    directLandlord: 'সরাসরি মালিক',
    propertyOwnerHost: 'প্রপার্টি মালিক',
    verifiedIdentityNid: 'ভেরিফাইড পরিচয় (NID)',
    activeListings: 'সক্রিয় লিস্টিং',
    memberSince: 'যুক্ত হয়েছেন',
    privacySafeguard: 'প্রাইভেসি সুরক্ষা',
    privacySafeguardDesc: 'স্প্যাম রোধ করতে ফোন নম্বর গোপন রাখা হয়। বাড়িওয়ালার সাথে কথা বলতে ও বাসা ভিজিট করতে ভাড়া হবে-র ইন-অ্যাপ মেসেঞ্জার ব্যবহার করুন।',

    // Property Details Page Sections
    aboutProperty: 'প্রপার্টির বিস্তারিত',
    amenitiesFacilities: 'সুযোগ-সুবিধা সমূহ',
    locationNeighborhood: 'লোকেশন ও আশেপাশের এলাকা',
    interactiveMapDesc: 'ইন্টারেক্টিভ ম্যাপে সঠিক লোকেশন পিন',
    quickChat: 'বাড়িওয়ালার সাথে দ্রুত চ্যাট',
    openFullMessenger: 'সম্পূর্ণ মেসেঞ্জার খুলুন',
    reportAd: 'অ্যাড রিপোর্ট করুন',
    editAd: 'এডিট করুন',
    deleteAd: 'ডিলিট করুন',

    // Pages & Footer Links
    privacyPolicy: 'প্রাইভেসি পলিসি',
    aboutUs: 'আমাদের সম্পর্কে',
    faq: 'সাধারণ জিজ্ঞাসা',
    userManual: 'ইউজার ম্যানুয়াল',
    termsOfService: 'শর্তাবলী',

    // Profile & Auth
    userProfileAuth: 'ইউজার প্রোফাইল ও লগইন',
    publicProfileInfo: 'পাবলিক প্রোফাইল তথ্য',
    privateIdentityVault: 'প্রাইভেট আইডেন্টিটি ভল্ট',
    appSettings: 'অ্যাপ সেটিংস',
    postPropertyListing: 'নতুন প্রপার্টি অ্যাড দিন',
    editPropertyListing: 'প্রপার্টি অ্যাড এডিট করুন',
    listingTitle: 'অ্যাডের টাইটেল *',
    accommodationCategory: 'থাকার ক্যাটাগরি *',
    publishToThikana: 'ভাড়া হবে-তে পাবলিশ করুন',
    publishToBharaHobe: 'ভাড়া হবে-তে পাবলিশ করুন',
    updateProperty: 'প্রপার্টি আপডেট করুন',
    myPostedProperties: 'আমার পোস্ট করা অ্যাড',
    savePublicProfile: 'পাবলিক প্রোফাইল সেভ করুন',
    savePrivateVault: 'প্রাইভেট ভল্ট সেভ করুন',
  },
};

// Dynamic Category Mapping
const CATEGORY_MAP: Record<string, { en: string; bn: string }> = {
  'Family Flat': { en: 'Family Flat', bn: 'ফ্যামিলি ফ্ল্যাট' },
  family_flat: { en: 'Family Flat', bn: 'ফ্যামিলি ফ্ল্যাট' },
  Bachelor: { en: 'Bachelor', bn: 'ব্যাচেলর' },
  bachelor: { en: 'Bachelor', bn: 'ব্যাচেলর' },
  Sublet: { en: 'Sublet', bn: 'সাবলেট' },
  sublet: { en: 'Sublet', bn: 'সাবলেট' },
  Mess: { en: 'Mess', bn: 'মেস' },
  mess: { en: 'Mess', bn: 'মেস' },
  Commercial: { en: 'Commercial', bn: 'কমার্শিয়াল' },
  commercial: { en: 'Commercial', bn: 'কমার্শিয়াল' },
  All: { en: 'All', bn: 'সব' },
};

// Gender / Demographic Dynamic Mapping
const GENDER_MAP: Record<string, { en: string; bn: string }> = {
  Any: { en: 'Any', bn: 'যেকোনো' },
  Male: { en: 'Male', bn: 'পুরুষ' },
  Female: { en: 'Female', bn: 'নারী' },
};

export interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: keyof CoreTranslations) => string;
  translateCategory: (category: string) => string;
  translateGender: (gender: string) => string;
  dictionary: CoreTranslations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'bhara_hobe_lang';

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('thikana_lang');
      return saved === 'bn' ? 'bn' : 'en';
    } catch {
      return 'en';
    }
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (e) {
      console.warn('Unable to persist language to localStorage', e);
    }
  };

  const toggleLanguage = () => {
    const nextLang = language === 'en' ? 'bn' : 'en';
    setLanguage(nextLang);
  };

  const t = (key: keyof CoreTranslations): string => {
    return translationDictionary[language]?.[key] ?? translationDictionary.en[key] ?? key;
  };

  const translateCategory = (category: string): string => {
    if (!category) return '';
    const match = CATEGORY_MAP[category] || CATEGORY_MAP[category.trim()];
    if (match) {
      return language === 'bn' ? match.bn : match.en;
    }
    return category;
  };

  const translateGender = (gender: string): string => {
    if (!gender) return '';
    const match = GENDER_MAP[gender] || GENDER_MAP[gender.trim()];
    if (match) {
      return language === 'bn' ? match.bn : match.en;
    }
    return gender;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        t,
        translateCategory,
        translateGender,
        dictionary: translationDictionary[language],
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
