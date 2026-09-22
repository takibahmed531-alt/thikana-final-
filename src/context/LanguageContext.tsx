import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

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
    signIn: 'Google Sign In',
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
    saved: 'সংরক্ষিত',
    messages: 'মেসেজ',
    profile: 'প্রোফাইল',
    postAd: 'বিজ্ঞাপন দিন',
    searchPlaceholder: 'শহর, এলাকা (যেমন ধানমন্ডি, গুলশান) খুঁজুন...',
    signIn: 'গুগল সাইন ইন',
    signOut: 'লগআউট',
    heroBadge: 'বাংলাদেশের ভেরিফাইড ভাড়াবাসা খুঁজুন',
    heroTitleStart: 'আপনার পরবর্তী ভাড়াবাসা খুঁজুন',
    heroSubtitle: 'ঢাকা, চট্টগ্রাম এবং সিলেটের ভেরিফাইড ফ্যামিলি ফ্ল্যাট, ব্যাচেলর এবং সাবলেট বাসা খুঁজুন সর্বোচ্চ প্রাইভেসির সাথে।',
    homeSearchPlaceholder: 'এলাকা (যেমন: ধানমন্ডি) অথবা বিজ্ঞাপন আইডি (যেমন: TK-123456) দিয়ে খুঁজুন...',
    popularAreas: 'জনপ্রিয় এলাকা:',
    exploreCategory: 'ক্যাটাগরি অনুযায়ী খুঁজুন',
    userProfileAuth: 'ইউজার প্রোফাইল ও নিরাপত্তা',
    publicProfileInfo: 'পাবলিক প্রোফাইল তথ্য',
    privateIdentityVault: 'প্রাইভেট আইডেন্টিটি ভল্ট',
    appSettings: 'অ্যাপ সেটিংস',
    postPropertyListing: 'ভাড়ার বিজ্ঞাপন দিন',
    editPropertyListing: 'বিজ্ঞাপন সম্পাদনা করুন',
    listingTitle: 'বিজ্ঞাপনের শিরোনাম *',
    monthlyRent: 'মাসিক ভাড়া (টাকা) *',
    accommodationCategory: 'বাসার ধরন বা ক্যাটাগরি *',
    publishToThikana: 'ঠিকানায় প্রকাশ করুন',
    updateProperty: 'আপডেট করুন',
    myPostedProperties: 'আমার পোস্ট করা বিজ্ঞাপন',
    savePublicProfile: 'পাবলিক প্রোফাইল সংরক্ষণ করুন',
    savePrivateVault: 'প্রাইভেট তথ্য সংরক্ষণ করুন',
    cancel: 'বাতিল',
    backToListings: 'তালিকায় ফিরে যান',
    editAd: 'বিজ্ঞাপন সম্পাদনা',
    deleteAd: 'বিজ্ঞাপন মুছুন',
    save: 'সংরক্ষণ করুন',
    share: 'শেয়ার',
    reportAd: 'রিপোর্ট করুন',
    aboutProperty: 'প্রপার্টির বিস্তারিত',
    amenitiesFacilities: 'সুযোগ-সুবিধা সমূহ',
    locationNeighborhood: 'অবস্থান ও আশেপাশের এলাকা',
    securityAdvance: 'অগ্রিম জামানত',
    minimumLease: 'ন্যূনতম চুক্তি',
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
