import React, { useState, useEffect } from 'react';
import {
  User as UserIcon,
  Shield,
  Lock,
  CheckCircle2,
  AlertCircle,
  LogOut,
  Save,
  KeyRound,
  Home,
  Check,
  Settings,
  Moon,
  Sun,
  Bell,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePreferences } from '../context/PreferencesContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { handleFirestoreError, OperationType } from '../services/firestoreErrors';
import { UserRole } from '../types';

export default function ProfilePage() {
  const { user, publicProfile, privateUser, loading, signInWithGoogle, signOut, refreshProfile } =
    useAuth();
  const { theme, notificationsEnabled, toggleTheme, toggleNotifications } = usePreferences();

  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState<UserRole>('tenant');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [nidNumber, setNidNumber] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [hiddenAddress, setHiddenAddress] = useState('');

  const [savingPublic, setSavingPublic] = useState(false);
  const [savingPrivate, setSavingPrivate] = useState(false);
  const [publicMsg, setPublicMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );
  const [privateMsg, setPrivateMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  useEffect(() => {
    if (publicProfile) {
      setDisplayName(publicProfile.displayName || user?.displayName || '');
      setRole(publicProfile.role || 'tenant');
    } else if (user) {
      setDisplayName(user.displayName || '');
    }

    if (privateUser) {
      setPhoneNumber(privateUser.phoneNumber || '');
      setNidNumber(privateUser.nidNumber || '');
      setDateOfBirth(privateUser.dateOfBirth || '');
      setHiddenAddress(privateUser.hiddenAddress || '');
    }
  }, [publicProfile, privateUser, user]);

  const handleUpdatePublicProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSavingPublic(true);
    setPublicMsg(null);

    try {
      const pubRef = doc(db, 'publicProfiles', user.uid);
      await updateDoc(pubRef, {
        displayName: displayName.trim() || 'Thikana User',
        role,
        isVerified: publicProfile?.isVerified ?? false,
      });
      await refreshProfile();
      setPublicMsg({ type: 'success', text: 'Public profile updated successfully!' });
    } catch (err: any) {
      setPublicMsg({ type: 'error', text: err?.message || 'Failed to update profile.' });
      handleFirestoreError(err, OperationType.UPDATE, `publicProfiles/${user.uid}`);
    } finally {
      setSavingPublic(false);
    }
  };

  const handleUpdatePrivateVault = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSavingPrivate(true);
    setPrivateMsg(null);

    try {
      const privRef = doc(db, 'privateUsers', user.uid);
      await updateDoc(privRef, {
        phoneNumber: phoneNumber.trim(),
        nidNumber: nidNumber.trim(),
        dateOfBirth: dateOfBirth.trim(),
        hiddenAddress: hiddenAddress.trim(),
      });
      await refreshProfile();
      setPrivateMsg({ type: 'success', text: 'Private identity vault updated securely.' });
    } catch (err: any) {
      setPrivateMsg({ type: 'error', text: err?.message || 'Failed to update private vault.' });
      handleFirestoreError(err, OperationType.UPDATE, `privateUsers/${user.uid}`);
    } finally {
      setSavingPrivate(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 text-center">
        <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-slate-500 font-medium">Checking authentication state...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <UserIcon className="w-6 h-6 text-emerald-600" />
              User Profile & Authentication
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Managed via Firebase Authentication & Cloud Firestore with isolated privacy rules.
            </p>
          </div>
          {user && (
            <button
              type="button"
              onClick={() => signOut()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          )}
        </div>
      </div>

      {/* When Logged Out */}
      {!user ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mx-auto">
            <UserIcon className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h2 className="text-xl font-bold text-slate-900">Sign in to Thikana</h2>
            <p className="text-sm text-slate-500">
              Sign in with your Google account to post verified rental listings, connect with
              landlords, and save favourite apartments.
            </p>
          </div>

          <button
            type="button"
            onClick={() => signInWithGoogle()}
            className="inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm shadow-sm transition-all cursor-pointer hover:shadow-emerald-600/20 hover:shadow-md"
          >
            <KeyRound className="w-4 h-4" />
            Continue with Google
          </button>

          {/* Privacy Separation Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-slate-100 text-left">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                <Shield className="w-4 h-4 text-emerald-600" />
                <span>Public Profile</span>
              </div>
              <p className="text-xs text-slate-500">
                Display name, avatar, and listing role (Tenant / Landlord) stored in{' '}
                <code className="text-emerald-700 font-mono">publicProfiles</code>.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                <Lock className="w-4 h-4 text-rose-600" />
                <span>Private Identity Vault</span>
              </div>
              <p className="text-xs text-slate-500">
                NID, phone, and home address isolated in{' '}
                <code className="text-rose-700 font-mono">privateUsers</code>, accessible strictly
                to your UID.
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* When Logged In */
        <div className="space-y-6">
          {/* User Identity Banner */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'Profile'}
                  className="w-16 h-16 rounded-full object-cover border-2 border-emerald-500/30"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-xl">
                  {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-900">
                    {publicProfile?.displayName || user.displayName || 'Thikana User'}
                  </h2>
                  {publicProfile?.isVerified && (
                    <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                      <Check className="w-3 h-3" />
                      Verified
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500">{user.email}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-xs font-medium uppercase tracking-wider">
                    Role: {publicProfile?.role || 'tenant'}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    UID: {user.uid.slice(0, 10)}...
                  </span>
                </div>
              </div>
            </div>

            <div className="flex sm:flex-col items-center sm:items-end gap-2 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" /> Firebase Connected
              </span>
              <span className="text-slate-400">Database: asia-southeast1</span>
            </div>
          </div>

          {/* Section 1: Public Profile Settings */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-slate-900 font-bold">
              <Shield className="w-5 h-5 text-emerald-600" />
              <h3>Public Profile Information</h3>
            </div>
            <p className="text-xs text-slate-500">
              This info is visible to tenants and landlords on property cards and chat messages.
            </p>

            {publicMsg && (
              <div
                className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                  publicMsg.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {publicMsg.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{publicMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleUpdatePublicProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-600"
                    placeholder="Your Full Name"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Account Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-600 bg-white"
                  >
                    <option value="tenant">Tenant (Looking for rent)</option>
                    <option value="landlord">Landlord (Listings owner)</option>
                    <option value="agent">Real Estate Agent</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={savingPublic}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium shadow-sm transition-colors cursor-pointer disabled:opacity-60"
                >
                  <Save className="w-3.5 h-3.5" />
                  {savingPublic ? 'Saving...' : 'Save Public Profile'}
                </button>
              </div>
            </form>
          </div>

          {/* Section 2: Private Identity Vault */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-slate-900 font-bold">
              <Lock className="w-5 h-5 text-rose-600" />
              <h3>Private Identity Vault</h3>
            </div>
            <p className="text-xs text-slate-500">
              Protected by Firestore Security Rules (<code className="font-mono">privateUsers</code>
              ). Only your authenticated UID can read or write these confidential fields.
            </p>

            {privateMsg && (
              <div
                className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                  privateMsg.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {privateMsg.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{privateMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleUpdatePrivateVault} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Contact Phone Number
                  </label>
                  <input
                    type="text"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-600"
                    placeholder="+880 1700 000000"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    National ID (NID) Number
                  </label>
                  <input
                    type="text"
                    value={nidNumber}
                    onChange={(e) => setNidNumber(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-600"
                    placeholder="10 or 17 digit NID"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Permanent Address (Hidden)
                  </label>
                  <input
                    type="text"
                    value={hiddenAddress}
                    onChange={(e) => setHiddenAddress(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-600"
                    placeholder="House, Road, City"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={savingPrivate}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium shadow-sm transition-colors cursor-pointer disabled:opacity-60"
                >
                  <Save className="w-3.5 h-3.5" />
                  {savingPrivate ? 'Securing...' : 'Save Private Vault'}
                </button>
              </div>
            </form>
          </div>

          {/* Section 3: App Settings */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-2 text-slate-900 font-bold">
              <Settings className="w-5 h-5 text-emerald-600" />
              <h3>App Settings</h3>
            </div>
            <p className="text-xs text-slate-500">
              Manage your interface preferences and live alert settings. Changes are automatically synced with your account.
            </p>

            <div className="divide-y divide-slate-100">
              {/* Dark Mode Toggle */}
              <div className="flex items-center justify-between py-3.5 first:pt-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                    {theme === 'dark' ? (
                      <Moon className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <Sun className="w-5 h-5 text-amber-500" />
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-900">Dark Mode</div>
                    <div className="text-xs text-slate-500">
                      {theme === 'dark' ? 'Dark theme is currently active' : 'Light theme is currently active'}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={theme === 'dark'}
                  onClick={toggleTheme}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
                    theme === 'dark' ? 'bg-emerald-600' : 'bg-slate-200'
                  }`}
                  title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                >
                  <span className="sr-only">Toggle Dark Mode</span>
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                      theme === 'dark' ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Push Notifications Toggle */}
              <div className="flex items-center justify-between py-3.5 last:pb-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                    <Bell
                      className={`w-5 h-5 ${
                        notificationsEnabled ? 'text-emerald-600' : 'text-slate-400'
                      }`}
                    />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-900">Push Notifications</div>
                    <div className="text-xs text-slate-500">
                      {notificationsEnabled
                        ? 'Alerts enabled for inquiries, messages, and bookings'
                        : 'Push notifications are paused'}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={notificationsEnabled}
                  onClick={toggleNotifications}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
                    notificationsEnabled ? 'bg-emerald-600' : 'bg-slate-200'
                  }`}
                  title={notificationsEnabled ? 'Disable notifications' : 'Enable notifications'}
                >
                  <span className="sr-only">Toggle Push Notifications</span>
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                      notificationsEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
