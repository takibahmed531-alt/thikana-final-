import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  X,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  Building2,
  CheckCircle2,
  Check,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup';
}

export default function AuthModal({
  isOpen,
  onClose,
  initialMode = 'signin',
}: AuthModalProps) {
  const {
    loginWithEmailOrPhone,
    signUpWithEmailOrPhone,
    signInWithGoogle,
    signInWithFacebook,
  } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [name, setName] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<'google' | 'facebook' | null>(null);
  const [isPolicyAccepted, setIsPolicyAccepted] = useState(false);

  // Sync mode with initialMode prop when modal opens
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setErrorMessage(null);
      setName('');
      setIdentifier('');
      setPassword('');
      setIsPolicyAccepted(false);
      setIsLoading(false);
      setSocialLoading(null);
    }
  }, [isOpen, initialMode]);

  // Handle escape key to dismiss
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent background scrolling while modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleToggleMode = (newMode: 'signin' | 'signup') => {
    setMode(newMode);
    setErrorMessage(null);
    setIsPolicyAccepted(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanIdentifier = identifier.trim();
    if (!cleanIdentifier) {
      setErrorMessage('Please enter your email or phone number.');
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (mode === 'signup' && !name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    if (mode === 'signup' && !isPolicyAccepted) {
      setErrorMessage('Please accept the Terms of Service and Privacy Policy to continue.');
      return;
    }

    setIsLoading(true);
    try {
      if (mode === 'signup') {
        await signUpWithEmailOrPhone(cleanIdentifier, password, name.trim());
      } else {
        await loginWithEmailOrPhone(cleanIdentifier, password);
      }
      onClose();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Authentication failed. Please verify your details.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    setSocialLoading('google');
    try {
      await signInWithGoogle();
      onClose();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Google sign-in failed. Please try again.');
    } finally {
      setSocialLoading(null);
    }
  };

  const handleFacebookSignIn = async () => {
    setErrorMessage(null);
    setSocialLoading('facebook');
    try {
      await signInWithFacebook();
      onClose();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Facebook sign-in failed. Please try again.');
    } finally {
      setSocialLoading(null);
    }
  };

  const isAnyLoading = isLoading || socialLoading !== null;

  return (
    <div
      id="auth-modal-overlay"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
    >
      {/* Modal Container */}
      <div
        id="auth-modal-card"
        className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 text-slate-800 dark:text-slate-100 transition-all my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isAnyLoading}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm shadow-emerald-500/20 shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
              {mode === 'signin' ? 'Sign In to Thikana' : 'Create an Account'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {mode === 'signin'
                ? 'Welcome back! Sign in to continue'
                : 'Join Thikana to find or list rental homes'}
            </p>
          </div>
        </div>

        {/* Mode Toggle Switch (Sign In vs Create Account) */}
        <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-5">
          <button
            type="button"
            onClick={() => handleToggleMode('signin')}
            disabled={isAnyLoading}
            className={`py-2 px-3 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              mode === 'signin'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => handleToggleMode('signup')}
            disabled={isAnyLoading}
            className={`py-2 px-3 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              mode === 'signup'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error Alert Box */}
        {errorMessage && (
          <div className="mb-4 p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
              <span className="flex-1 font-medium">{errorMessage}</span>
            </div>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Full Name input (Only shown when mode is Create Account) */}
          {mode === 'signup' && (
            <div>
              <label
                htmlFor="auth-fullname"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="auth-fullname"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Tanvir Ahmed"
                  disabled={isAnyLoading}
                  required={mode === 'signup'}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all disabled:opacity-50"
                />
              </div>
            </div>
          )}

          {/* Email or Phone Number input (Always visible) */}
          <div>
            <label
              htmlFor="auth-identifier"
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
            >
              Email or Phone Number
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="auth-identifier"
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="e.g. tanvir@example.com or 01712345678"
                disabled={isAnyLoading}
                required
                className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all disabled:opacity-50"
              />
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
              Supports email address or local/international phone numbers.
            </p>
          </div>

          {/* Password input (Always visible) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="auth-password"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Password
              </label>
              {mode === 'signup' && (
                <span className="text-[11px] text-slate-400">Min. 6 characters</span>
              )}
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="auth-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={isAnyLoading}
                required
                className="w-full pl-9 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isAnyLoading}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Explicit Terms & Privacy Consent Checkbox (Signup Mode) */}
          {mode === 'signup' && (
            <div className="pt-1">
              <label
                htmlFor="auth-policy-checkbox"
                className="flex items-start gap-2.5 cursor-pointer select-none group"
              >
                <div className="relative flex items-center justify-center mt-0.5 shrink-0">
                  <input
                    type="checkbox"
                    id="auth-policy-checkbox"
                    checked={isPolicyAccepted}
                    onChange={(e) => setIsPolicyAccepted(e.target.checked)}
                    disabled={isAnyLoading}
                    className="peer sr-only"
                  />
                  <div
                    className={`w-4 h-4 rounded-md border transition-all flex items-center justify-center ${
                      isPolicyAccepted
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                        : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 group-hover:border-emerald-500'
                    }`}
                  >
                    {isPolicyAccepted && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>
                <span className="text-xs text-slate-600 dark:text-slate-300 leading-snug">
                  I agree to the{' '}
                  <Link
                    to="/privacy"
                    onClick={(e) => {
                      e.stopPropagation();
                      onClose();
                    }}
                    className="font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 underline underline-offset-2 transition-colors"
                  >
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link
                    to="/privacy"
                    onClick={(e) => {
                      e.stopPropagation();
                      onClose();
                    }}
                    className="font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 underline underline-offset-2 transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </span>
              </label>
            </div>
          )}

          {/* Submit Button ("Continue" / "Sign Up") */}
          <button
            type="submit"
            disabled={isAnyLoading || (mode === 'signup' && !isPolicyAccepted)}
            className={`w-full mt-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm flex items-center justify-center gap-2 ${
              isAnyLoading || (mode === 'signup' && !isPolicyAccepted)
                ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed opacity-60 shadow-none'
                : 'bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white shadow-emerald-600/20 cursor-pointer'
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <span>{mode === 'signup' ? 'Sign Up' : 'Continue'}</span>
            )}
          </button>
        </form>

        {/* OR Divider */}
        <div className="relative my-4 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200 dark:border-slate-800" />
          </div>
          <div className="relative bg-white dark:bg-slate-900 px-3 text-[11px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-semibold">
            OR
          </div>
        </div>

        {/* Subtle text above social login */}
        <p className="text-center text-[11px] text-slate-400 dark:text-slate-500 leading-tight mb-2.5">
          By proceeding with social login, you agree to our{' '}
          <Link
            to="/privacy"
            onClick={onClose}
            className="text-emerald-600 dark:text-emerald-400 underline underline-offset-2 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium transition-colors"
          >
            Privacy Policy
          </Link>
        </p>

        {/* Social Authentication Buttons */}
        <div className="space-y-2.5">
          {/* Continue with Google */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isAnyLoading}
            className="w-full py-2.5 px-4 rounded-xl bg-white dark:bg-slate-800/90 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-semibold transition-all shadow-sm flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {socialLoading === 'google' ? (
              <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
            ) : (
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            )}
            <span>Continue with Google</span>
          </button>

          {/* Continue with Facebook */}
          <button
            type="button"
            onClick={handleFacebookSignIn}
            disabled={isAnyLoading}
            className="w-full py-2.5 px-4 rounded-xl bg-[#1877F2] hover:bg-[#166fe5] text-white text-xs sm:text-sm font-semibold transition-all shadow-sm flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {socialLoading === 'facebook' ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            )}
            <span>Continue with Facebook</span>
          </button>
        </div>

        {/* Footer Toggle text */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {mode === 'signin' ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              type="button"
              onClick={() => handleToggleMode(mode === 'signin' ? 'signup' : 'signin')}
              disabled={isAnyLoading}
              className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer disabled:opacity-50"
            >
              {mode === 'signin' ? 'Create Account' : 'Sign In'}
            </button>
          </p>

          {/* Discreet Legal Notice */}
          <p className="mt-3 text-[11px] text-slate-400 dark:text-slate-500 leading-tight">
            By continuing, you agree to Thikana&apos;s{' '}
            <Link
              to="/privacy"
              onClick={onClose}
              className="text-emerald-600 dark:text-emerald-400 underline underline-offset-2 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium transition-colors"
            >
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
