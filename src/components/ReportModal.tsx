import React, { useState, useEffect } from 'react';
import { Flag, AlertTriangle, X, CheckCircle2, Loader2, ShieldAlert, LogIn } from 'lucide-react';
import { submitReport } from '../services/reportService';
import { useAuth } from '../context/AuthContext';

export interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetId: string;
  targetType: 'property' | 'user';
}

const REPORT_REASONS = [
  {
    value: 'Fake Listing/Spam',
    label: 'Fake Listing / Spam',
    description: 'Non-existent address, duplicate ad, commercial spam, or phishing.',
  },
  {
    value: 'Fraud/Scammer',
    label: 'Fraud / Scammer Activity',
    description: 'Demanding advance payment or bKash deposit before physical visit.',
  },
  {
    value: 'Inappropriate Content',
    label: 'Inappropriate Content',
    description: 'Offensive images, harassment, hate speech, or explicit text.',
  },
  {
    value: 'Wrong Information',
    label: 'Wrong or Misleading Information',
    description: 'Inaccurate rent price, misleading photos, or false amenities.',
  },
];

export default function ReportModal({
  isOpen,
  onClose,
  targetId,
  targetType,
}: ReportModalProps) {
  const { user, signInWithGoogle } = useAuth();

  const [selectedReason, setSelectedReason] = useState<string>(REPORT_REASONS[0].value);
  const [description, setDescription] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Reset modal state whenever it is opened or closed
  useEffect(() => {
    if (isOpen) {
      setSelectedReason(REPORT_REASONS[0].value);
      setDescription('');
      setIsSubmitting(false);
      setIsSuccess(false);
      setErrorMessage(null);
    }
  }, [isOpen]);

  // Handle ESC key to dismiss modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReason) {
      setErrorMessage('Please select a reason for reporting.');
      return;
    }

    if (!user) {
      setErrorMessage('You must be signed in to submit a report.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await submitReport(
        targetId,
        targetType,
        selectedReason,
        description.trim(),
        user.uid
      );

      setIsSuccess(true);
      // Automatically close the modal after showing the success state
      setTimeout(() => {
        onClose();
      }, 1800);
    } catch (err: any) {
      console.error('Failed to submit report:', err);
      setErrorMessage(
        err?.message || 'Failed to submit the report. Please try again.'
      );
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-modal-title"
    >
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-auto transition-all">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
              <Flag className="w-4 h-4" />
            </div>
            <div>
              <h2
                id="report-modal-title"
                className="text-base font-bold text-slate-900"
              >
                Report {targetType === 'property' ? 'Listing' : 'User'}
              </h2>
              <p className="text-xs text-slate-500">
                Help keep the Thikana rental community trustworthy
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors disabled:opacity-40 cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Success State View */}
          {isSuccess ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Report Submitted Successfully
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
                Thank you for notifying us. Our safety and verification team will
                investigate this {targetType === 'property' ? 'listing' : 'user account'}{' '}
                and take necessary action.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Not Signed In Warning Prompt */}
              {!user && (
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-start gap-3 text-amber-900 text-xs">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="flex-1 space-y-2">
                    <p className="font-medium">
                      Authentication required to file reports.
                    </p>
                    <button
                      type="button"
                      onClick={signInWithGoogle}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs shadow-xs transition-colors"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      <span>Sign in with Google</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Error Notice */}
              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Task 2: Reason Selection (Radio list) */}
              <div className="space-y-2.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Reason for Reporting <span className="text-rose-500">*</span>
                </label>
                <div className="space-y-2">
                  {REPORT_REASONS.map((reason) => {
                    const isChecked = selectedReason === reason.value;
                    return (
                      <label
                        key={reason.value}
                        className={`flex items-start gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${
                          isChecked
                            ? 'bg-rose-50/50 border-rose-300 ring-1 ring-rose-400/40'
                            : 'bg-white border-slate-200 hover:bg-slate-50/70'
                        }`}
                      >
                        <input
                          type="radio"
                          name="reportReason"
                          value={reason.value}
                          checked={isChecked}
                          onChange={() => setSelectedReason(reason.value)}
                          className="mt-0.5 text-rose-600 focus:ring-rose-500"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-slate-900">
                            {reason.label}
                          </p>
                          <p className="text-[11px] text-slate-500 leading-normal mt-0.5">
                            {reason.description}
                          </p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Task 3: Additional Details Textarea */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="report-description"
                    className="block text-xs font-bold text-slate-700 uppercase tracking-wider"
                  >
                    Additional Details{' '}
                    <span className="text-[11px] text-slate-400 font-normal normal-case">
                      (Optional)
                    </span>
                  </label>
                  <span className="text-[10px] text-slate-400">
                    {description.length}/1000
                  </span>
                </div>
                <textarea
                  id="report-description"
                  rows={3}
                  maxLength={1000}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe specific details, transaction messages, or evidence to assist our safety team..."
                  disabled={isSubmitting}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 focus:bg-white transition-all resize-none"
                />
              </div>

              {/* Notice regarding malicious reports */}
              <p className="text-[11px] text-slate-500 flex items-start gap-1.5 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <AlertTriangle className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span>
                  All reports are logged with your user ID to prevent fraudulent or abusive reports. False reports may result in account penalties.
                </span>
              </p>

              {/* Modal Footer Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  Cancel
                </button>

                {/* Task 4: Submit Button with Loading State */}
                <button
                  type="submit"
                  disabled={isSubmitting || !user}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-rose-600/20 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Submitting Report...</span>
                    </>
                  ) : (
                    <>
                      <Flag className="w-4 h-4" />
                      <span>Submit Report</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
