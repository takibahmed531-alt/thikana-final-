import { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'en' | 'bn';

export interface CoreTranslations {
  home: string;
  saved: string;
  messages: string;
  profile: string;
  postAd: string;
  searchPlaceholder: string;
  signIn: string;
  signOut: string;
  heroBadge: string;
  heroTitleStart: string;
  heroSubtitle: string;
  homeSearchPlaceholder: string;
  popularAreas: string;
  exploreCategory: string;
  userProfileAuth: string;
  publicProfileInfo: string;
  privateIdentityVault: string;
  appSettings: string;
  postPropertyListing: string;
  editPropertyListing: string;
  listingTitle: string;
  monthlyRent: string;
  accommodationCategory: string;
  publishToThikana: string;
  updateProperty: string;
  myPostedProperties: string;
  savePublicProfile: string;
  savePrivateVault: string;
  cancel: string;
  backToListings: string;
  editAd: string;
  deleteAd: string;
  save: string;
  share: string;
  reportAd: string;
  aboutProperty: string;
  amenitiesFacilities: string;
  locationNeighborhood: string;
  securityAdvance: string;
  minimumLease: string;
  quickChat: string;
  openFullMessenger: string;
}

export const translationDictionary: Record<Language, CoreTranslations> = {
  en: {
    home: 'Home',
    saved: 'Saved',
    messages: 'Messages',
    profile: 'Profile',
    postAd: 'Post Ad',
    searchPlaceholder: 'Search city, area (e.g. Dhanmondi, Gulshan), or apartment...',
    signIn: 'Sign In',
    signOut: 'Sign Out',
    heroBadge: 'Discover Verified Homes in Bangladesh',
    heroTitleStart: 'Find your next rental home with',
    heroSubtitle: 'Search verified family apartments, bachelor pads, and sublets across Dhaka, Chattogram, and Sylhet with total privacy protection.',
    homeSearchPlaceholder: 'Search by area (e.g., Dhanmondi) or Ad ID (e.g., TK-123456)...',
    popularAreas: 'Popular areas:',
    exploreCategory: 'Explore by Category',
    userProfileAuth: 'User Profile & Authentication',
    publicProfileInfo: 'Public Profile Information',
    privateIdentityVault: 'Private Identity Vault',
    appSettings: 'App Settings',
    postPropertyListing: 'Post a Property Listing',
    editPropertyListing: 'Edit Property Listing',
    listingTitle: 'Listing Title *',
    monthlyRent: 'Monthly Rent (BDT) *',
    accommodationCategory: 'Accommodation Category *',
    publishToThikana: 'Publish to Thikana',
    updateProperty: 'Update Property',
    myPostedProperties: 'My Posted Properties',
    savePublicProfile: 'Save Public Profile',
    savePrivateVault: 'Save Private Vault',
    cancel: 'Cancel',
    backToListings: 'Back to Listings',
    editAd: 'Edit Ad',
    deleteAd: 'Delete Ad',
    save: 'Save',
    share: 'Share',
    reportAd: 'Report Ad',
    aboutProperty: 'About this Property',
    amenitiesFacilities: 'Amenities & Facilities',
    locationNeighborhood: 'Location & Neighborhood',
    securityAdvance: 'Security Advance',
    minimumLease: 'Minimum Lease',
    quickChat: 'Quick Chat with Landlord',
    openFullMessenger: 'Open Full Messenger',
  },
  bn: {
    home: 'হোম',
    saved: 'সেভড',
    messages: 'মেসেজ',
    profile: 'প্রোফাইল',
    postAd: 'অ্যাড দিন',
    searchPlaceholder: 'লোকেশন বা এরিয়া সার্চ করুন...',
    signIn: 'লগইন করুন',
    signOut: 'লগআউট',
    heroBadge: 'নিরাপদ রেন্টাল',
    heroTitleStart: 'খুঁজে নিন আপনার নতুন',
    heroSubtitle: 'বাংলাদেশের সবচেয়ে নিরাপদ রিয়েল এস্টেট প্ল্যাটফর্মে ভেরিফাইড ফ্ল্যাট, ব্যাচেলর ও সাবলেট বাসা খুঁজুন সর্বোচ্চ প্রাইভেসির সাথে।',
    homeSearchPlaceholder: 'এরিয়া সার্চ করুন (যেমন: ধানমন্ডি)',
    popularAreas: 'জনপ্রিয় এরিয়া:',
    exploreCategory: 'ক্যাটাগরি অনুযায়ী খুঁজুন',
    userProfileAuth: 'ইউজার প্রোফাইল',
    publicProfileInfo: 'পাবলিক প্রোফাইল',
    privateIdentityVault: 'প্রাইভেট আইডেন্টিটি ভল্ট',
    appSettings: 'অ্যাপ সেটিংস',
    postPropertyListing: 'নতুন অ্যাড দিন',
    editPropertyListing: 'অ্যাড এডিট করুন',
    listingTitle: 'অ্যাডের টাইটেল',
    monthlyRent: 'মাসিক ভাড়া',
    accommodationCategory: 'ক্যাটাগরি',
    publishToThikana: 'পাবলিশ করুন',
    updateProperty: 'আপডেট করুন',
    myPostedProperties: 'আমার পোস্ট করা অ্যাড',
    savePublicProfile: 'সেভ করুন',
    savePrivateVault: 'সুরক্ষিত করুন',
    cancel: 'বাতিল করুন',
    backToListings: 'ফিরে যান',
    editAd: 'এডিট করুন',
    deleteAd: 'ডিলিট করুন',
    save: 'সেভ করুন',
    share: 'শেয়ার',
    reportAd: 'রিপোর্ট করুন',
    aboutProperty: 'প্রপার্টির বিস্তারিত',
    amenitiesFacilities: 'সুযোগ-সুবিধা সমূহ',
    locationNeighborhood: 'লোকেশন ও আশেপাশের এলাকা',
    securityAdvance: 'সিকিউরিটি অ্যাডভান্স',
    minimumLease: 'সর্বনিম্ন চুক্তি',
    quickChat: 'বাড়িওয়ালার সাথে দ্রুত চ্যাট',
    openFullMessenger: 'সম্পূর্ণ মেসেঞ্জার খুলুন',
  },
};

export interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: keyof CoreTranslations) => string;
  dictionary: CoreTranslations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'thikana_lang';

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
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

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        t,
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
