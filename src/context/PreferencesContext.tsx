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
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('thikana_theme');
    return saved === 'dark' || saved === 'light' ? saved : 'light';
  });
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('thikana_notifications');
    return saved !== null ? saved === 'true' : true;
  });

  // Sync dark class on the HTML document.documentElement when theme changes & persist to localStorage
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('thikana_theme', theme);
  }, [theme]);

  // Persist notificationsEnabled to localStorage
  useEffect(() => {
    localStorage.setItem('thikana_notifications', String(notificationsEnabled));
  }, [notificationsEnabled]);

  // When a user logs in, sync the localStorage values (theme & notificationsEnabled) to Firestore
  // When logged out (Guest), fall back to localStorage
  useEffect(() => {
    if (!user) {
      const savedTheme = localStorage.getItem('thikana_theme') as 'light' | 'dark';
      if (savedTheme === 'light' || savedTheme === 'dark') {
        setTheme(savedTheme);
      }
      const savedNotif = localStorage.getItem('thikana_notifications');
      if (savedNotif !== null) {
        setNotificationsEnabled(savedNotif === 'true');
      }
      return;
    }

    let isMounted = true;

    const syncLocalStorageToFirestore = async () => {
      try {
        const localTheme = (localStorage.getItem('thikana_theme') as 'light' | 'dark') || theme;
        const localNotif =
          localStorage.getItem('thikana_notifications') !== null
            ? localStorage.getItem('thikana_notifications') === 'true'
            : notificationsEnabled;

        const privDocRef = doc(db, 'privateUsers', user.uid);
        const snap = await getDoc(privDocRef);

        if (snap.exists() && isMounted) {
          // Sync localStorage value to Firestore
          await setDoc(
            privDocRef,
            {
              preferences: {
                theme: localTheme,
                notificationsEnabled: localNotif,
              },
            },
            { merge: true }
          );
        } else if (!snap.exists() && isMounted) {
          // If privateUsers profile document is being initialized during first sign-up, retry sync
          setTimeout(async () => {
            try {
              const retrySnap = await getDoc(privDocRef);
              if (retrySnap.exists() && isMounted) {
                await setDoc(
                  privDocRef,
                  {
                    preferences: {
                      theme: localTheme,
                      notificationsEnabled: localNotif,
                    },
                  },
                  { merge: true }
                );
              }
            } catch (retryErr) {
              console.warn('Delayed preferences sync failed:', retryErr);
            }
          }, 1200);
        }
      } catch (err) {
        console.error('Error syncing preferences to Firestore upon login:', err);
      }
    };

    syncLocalStorageToFirestore();

    return () => {
      isMounted = false;
    };
  }, [user]);

  // Toggle theme, save to localStorage, and persist to Firestore if logged in
  const toggleTheme = async () => {
    const nextTheme: 'light' | 'dark' = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('thikana_theme', nextTheme);

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

  // Toggle notifications, save to localStorage, and persist to Firestore if logged in
  const toggleNotifications = async () => {
    const nextNotifications = !notificationsEnabled;
    setNotificationsEnabled(nextNotifications);
    localStorage.setItem('thikana_notifications', String(nextNotifications));

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
