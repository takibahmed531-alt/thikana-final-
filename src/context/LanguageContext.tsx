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
