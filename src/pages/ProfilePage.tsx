import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  User as UserIcon,
  Shield,
  ShieldAlert,
  Lock,
  CheckCircle2,
  AlertCircle,
  LogOut,
  Save,
  Key,
  KeyRound,
  Home,
  Check,
  Settings,
  Moon,
  Sun,
  Bell,
  Link2,
  Loader2,
  Mail,
  LifeBuoy,
  HelpCircle,
  BookOpen,
  MessageSquareHeart,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePreferences } from '../context/PreferencesContext';
import { doc, updateDoc } from 'firebase/firestore';
import { sendEmailVerification } from 'firebase/auth';
import { auth, db } from '../firebase';
import { handleFirestoreError, OperationType } from '../services/firestoreErrors';
import { UserRole } from '../types';
import { getUserProperties } from '../services/propertyService';
import PropertyCard from '../components/PropertyCard';

export default function ProfilePage() {
  const {
    user,
    publicProfile,
    privateUser,
    loading,
    openAuthModal,
    linkGoogleAccount,
    signOut,
    refreshProfile,
  } = useAuth();
  const { theme, notificationsEnabled, toggleTheme, toggleNotifications } = usePreferences();

  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState<UserRole>('tenant');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [nidNumber, setNidNumber] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [hiddenAddress, setHiddenAddress] = useState('');

  const [myProperties, setMyProperties] = useState<any[]>([]);
  const [loadingProps, setLoadingProps] = useState(false);

  const [savingPublic, setSavingPublic] = useState(false);
  const [savingPrivate, setSavingPrivate] = useState(false);
  const [linkingGoogle, setLinkingGoogle] = useState(false);
  const [sendingVerification, setSendingVerification] = useState(false);
  const [verificationSuccessMsg, setVerificationSuccessMsg] = useState<string | null>(null);
  const [verificationErrorMsg, setVerificationErrorMsg] = useState<string | null>(null);
  const [publicMsg, setPublicMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );
  const [privateMsg, setPrivateMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );
  const [linkMsg, setLinkMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  const isEmailUnverified = Boolean(
    user && !user.emailVerified && user.email && !user.email.endsWith('@thikana.app')
  );

  const handleResendVerification = async () => {
    if (!auth.currentUser) return;
    setSendingVerification(true);
    setVerificationSuccessMsg(null);
    setVerificationErrorMsg(null);
    try {
      await sendEmailVerification(auth.currentUser);
      setVerificationSuccessMsg('Verification email sent!');
      setTimeout(() => {
        setVerificationSuccessMsg(null);
      }, 6000);
    } catch (err: any) {
      console.error('Error sending verification email:', err);
      if (err?.code === 'auth/too-many-requests') {
        setVerificationErrorMsg('Too many requests. Please wait a few moments before trying again.');
      } else {
        setVerificationErrorMsg(err?.message || 'Failed to send verification email.');
      }
    } finally {
      setSendingVerification(false);
    }
  };

  const isGoogleLinked = Boolean(
    user?.providerData?.some((p) => p.providerId === 'google.com')
  );

  const linkedEmail =
    user?.providerData?.find((p) => p.providerId === 'google.com')?.email ||
    user?.email ||
    '';

  const handleLinkGoogle = async () => {
    setLinkingGoogle(true);
    setLinkMsg(null);
    try {
      await linkGoogleAccount();
      setLinkMsg({
        type: 'success',
        text: 'Google account linked successfully! You can now use Google for recovery and instant sign-in.',
      });
      await refreshProfile();
    } catch (err: any) {
      setLinkMsg({
        type: 'error',
        text: err?.message || 'Failed to link Google account. Please try again.',
      });
    } finally {
      setLinkingGoogle(false);
    }
  };

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

  useEffect(() => {
    if (!user) {
      setMyProperties([]);
      return;
    }

    const currentUid = user.uid;
    let isMounted = true;
    async function loadMyProperties() {
      setLoadingProps(true);
      try {
        const properties = await getUserProperties(currentUid);
        if (isMounted) {
          const formatted = (properties || []).map((p: any) => {
            let cat = 'Family Flat';
            const rawCat = (p.category as string || '').toLowerCase();
            if (rawCat === 'bachelor_sublet' || rawCat === 'bachelor') cat = 'Bachelor';
            else if (rawCat === 'hostel' || rawCat === 'mess') cat = 'Mess';
            else if (rawCat === 'commercial') cat = 'Commercial';
            else if (rawCat === 'sublet') cat = 'Sublet';
            else if (rawCat === 'apartment' || rawCat === 'family_unit' || rawCat === 'house' || rawCat === 'family flat') cat = 'Family Flat';

            const firstImg =
              (Array.isArray(p.images) && p.images.length > 0 && p.images[0]) ||
              (Array.isArray(p.imageUrls) && p.imageUrls.length > 0 && p.imageUrls[0]) ||
              'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80';

            return {
              ...p,
              id: p.propertyId || p.id || '',
              adId: p.adId,
              title: p.title || 'Rental Property',
              rentAmount: Number(p.rentAmount) || 0,
              location: p.location || '',
              category: cat,
              isVerified: p.isVerified ?? true,
              imageUrl: firstImg,
              bedrooms: p.bedrooms || 3,
              bathrooms: p.bathrooms || 2,
              areaSqft: p.areaSqft || 1200,
              postedTime: 'Posted by you',
              genderPreference: p.genderPreference,
              availableSeats: p.availableSeats,
              status: p.status || 'available',
              coordinates: p.coordinates,
            };
          });
          setMyProperties(formatted);
        }
      } catch (err) {
        console.error('Failed to fetch user properties:', err);
      } finally {
        if (isMounted) {
          setLoadingProps(false);
        }
      }
    }

    loadMyProperties();
    return () => {
      isMounted = false;
    };
  }, [user]);

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
        phoneNumber: (phoneNumber || '').trim(),
        nidNumber: (nidNumber || '').trim(),
        dateOfBirth: (dateOfBirth || '').trim(),
        hiddenAddress: (hiddenAddress || '').trim(),
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
              Sign in with your email, phone number, or social account to post verified rental listings, connect with
              landlords, and save favourite apartments.
            </p>
          </div>

          <button
            type="button"
            onClick={() => openAuthModal('signin')}
            className="inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm shadow-sm transition-all cursor-pointer hover:shadow-emerald-600/20 hover:shadow-md"
          >
            <KeyRound className="w-4 h-4" />
            Sign In / Create Account
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
          {/* Prominent Email Verification Warning Banner */}
          {isEmailUnverified && (
            <div className="bg-amber-50 border border-amber-300/80 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center shrink-0 text-amber-700 mt-0.5 sm:mt-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded-md">
                      Action Required
                    </span>
                    {verificationSuccessMsg && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-md">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        {verificationSuccessMsg}
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm font-medium text-amber-900 leading-snug">
                    Your email address is not verified. Please check your inbox to verify your account and secure your identity.
                  </p>
                  {verificationErrorMsg && (
                    <p className="text-xs text-rose-700 font-medium">
                      {verificationErrorMsg}
                    </p>
                  )}
                </div>
              </div>

              <div className="shrink-0 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={sendingVerification}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sendingVerification ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sending Link...</span>
                    </>
                  ) : (
                    <>
                      <Mail className="w-3.5 h-3.5" />
                      <span>Resend Verification Link</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

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

          {/* Section 3: Account Security & Recovery */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 text-slate-900 font-bold">
              <ShieldAlert className="w-5 h-5 text-emerald-600" />
              <h3 className="text-base font-bold text-slate-900">Account Security & Recovery</h3>
            </div>
            <p className="text-xs text-slate-500">
              Manage external identity verification to safeguard your account against lost passwords or phone numbers.
            </p>

            {linkMsg && linkMsg.type === 'error' && (
              <div className="p-3 rounded-xl text-xs flex items-center gap-2 bg-rose-50 text-rose-800 border border-rose-200">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{linkMsg.text}</span>
              </div>
            )}

            {user.providerData.some((p) => p.providerId === 'google.com') ? (
              /* Linked: Success message with green checkmark and linked email */
              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start sm:items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-emerald-200 flex items-center justify-center shrink-0 shadow-xs text-emerald-600">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-emerald-950 flex items-center gap-2">
                      <span>Google Account Linked for Recovery</span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-200/80 text-emerald-900">
                        <Check className="w-3 h-3" /> Active
                      </span>
                    </div>
                    {linkedEmail && (
                      <p className="text-xs text-emerald-700 font-medium mt-0.5">
                        {linkedEmail}
                      </p>
                    )}
                  </div>
                </div>
                <div className="shrink-0">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-medium text-xs shadow-xs">
                    <Shield className="w-3.5 h-3.5" /> Protected
                  </span>
                </div>
              </div>
            ) : (
              /* Not Linked: Warning message and Link Google Account button */
              <div className="space-y-4">
                <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/80 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-xs sm:text-sm text-amber-900 font-medium leading-relaxed">
                      No recovery email linked. If you forget your password, you may lose access.
                    </p>
                    <p className="text-[11px] text-amber-700">
                      Link your Google account to enable one-click recovery and permanent sign-in access.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                  <div className="text-xs text-slate-500">
                    Instant recovery account via Google authentication.
                  </div>
                  <button
                    type="button"
                    onClick={handleLinkGoogle}
                    disabled={linkingGoogle}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {linkingGoogle ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Linking Google Account...</span>
                      </>
                    ) : (
                      <>
                        <Key className="w-4 h-4" />
                        <span>Link Google Account</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Section 4: App Settings */}
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

          {/* Section 5: My Posted Properties */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-900 font-bold">
                <Home className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base sm:text-lg">My Posted Properties</h3>
              </div>
              <Link
                to="/post-ad"
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline"
              >
                + Post New Ad
              </Link>
            </div>
            <p className="text-xs text-slate-500">
              Manage the rental properties and sublet listings you have published on Thikana.
            </p>

            {loadingProps ? (
              <div className="py-10 text-center text-sm text-slate-500 flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                <span>Loading your posted properties...</span>
              </div>
            ) : myProperties.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-5 pt-2">
                {myProperties.map((prop) => (
                  <PropertyCard key={prop.id} property={prop} />
                ))}
              </div>
            ) : (
              <div className="py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 p-6 space-y-2">
                <p className="text-sm text-slate-500 font-medium">You haven&apos;t posted any properties yet.</p>
                <Link
                  to="/post-ad"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                >
                  Post your first property listing &rarr;
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Help & Legal Card (Always visible at the bottom for both logged-in and guest users) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs mt-6 transition-colors">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <LifeBuoy className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <span>Help &amp; Legal</span>
        </h2>

        <div className="divide-y divide-slate-100 dark:divide-slate-800 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900">
          {/* User Manual */}
          <Link
            to="/manual"
            className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/60 active:bg-slate-100 dark:active:bg-slate-800 transition-colors group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  User Manual
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Step-by-step guides to search, chat, and post ads
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
          </Link>

          {/* FAQ */}
          <Link
            to="/faq"
            className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/60 active:bg-slate-100 dark:active:bg-slate-800 transition-colors group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <HelpCircle className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  FAQ
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Frequently asked questions about accounts &amp; listings
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
          </Link>

          {/* Support Center */}
          <Link
            to="/support"
            className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/60 active:bg-slate-100 dark:active:bg-slate-800 transition-colors group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <MessageSquareHeart className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                  Support Center
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Submit a ticket or get help from our care team
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-rose-600 dark:group-hover:text-rose-400 group-hover:translate-x-0.5 transition-all" />
          </Link>

          {/* Privacy Policy */}
          <Link
            to="/privacy"
            className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/60 active:bg-slate-100 dark:active:bg-slate-800 transition-colors group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  Privacy Policy
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  NID and contact isolation security standards
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 group-hover:translate-x-0.5 transition-all" />
          </Link>
        </div>
      </div>
    </div>
  );
}
