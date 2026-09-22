import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthContext';
import { handleFirestoreError, OperationType } from '../services/firestoreErrors';

export interface PreferencesContextType {
  theme: 'light' | 'dark';
  notificationsEnabled: boolean;
  toggleTheme: () => Promise<void>;
  toggleNotifications: () => Promise<void>;
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(true);

  // Sync dark class on the HTML document.documentElement when theme changes
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // When a user logs in, fetch their preferences from the privateUsers Firestore document and update local state
  useEffect(() => {
    if (!user) {
      return;
    }

    let isMounted = true;

    const fetchPreferences = async () => {
      try {
        const privDocRef = doc(db, 'privateUsers', user.uid);
        const snap = await getDoc(privDocRef);
        if (snap.exists() && isMounted) {
          const data = snap.data();
          if (data?.preferences) {
            if (data.preferences.theme === 'light' || data.preferences.theme === 'dark') {
              setTheme(data.preferences.theme);
            }
            if (typeof data.preferences.notificationsEnabled === 'boolean') {
              setNotificationsEnabled(data.preferences.notificationsEnabled);
            }
          }
        }
      } catch (err) {
        console.error('Error fetching user preferences from Firestore:', err);
      }
    };

    fetchPreferences();

    return () => {
      isMounted = false;
    };
  }, [user]);

  // Toggle theme, update document.documentElement, and persist to Firestore
  const toggleTheme = async () => {
    const nextTheme: 'light' | 'dark' = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);

    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    if (user) {
      try {
        const privDocRef = doc(db, 'privateUsers', user.uid);
        await setDoc(
          privDocRef,
          {
            preferences: {
              theme: nextTheme,
              notificationsEnabled,
            },
          },
          { merge: true }
        );
      } catch (err) {
        console.error('Error updating theme preference in Firestore:', err);
        handleFirestoreError(err, OperationType.UPDATE, `privateUsers/${user.uid}`);
      }
    }
  };

  // Toggle notifications and persist to Firestore
  const toggleNotifications = async () => {
    const nextNotifications = !notificationsEnabled;
    setNotificationsEnabled(nextNotifications);

    if (user) {
      try {
        const privDocRef = doc(db, 'privateUsers', user.uid);
        await setDoc(
          privDocRef,
          {
            preferences: {
              theme,
              notificationsEnabled: nextNotifications,
            },
          },
          { merge: true }
        );
      } catch (err) {
        console.error('Error updating notifications preference in Firestore:', err);
        handleFirestoreError(err, OperationType.UPDATE, `privateUsers/${user.uid}`);
      }
    }
  };

  return (
    <PreferencesContext.Provider
      value={{
        theme,
        notificationsEnabled,
        toggleTheme,
        toggleNotifications,
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return context;
}
