import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  LifeBuoy,
  Send,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Compass,
  ShieldCheck,
  Mail,
  Loader2,
  Clock,
  ArrowRight,
  LogIn,
  Ticket
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { submitSupportTicket } from '../services/supportService';
import { SupportTicket } from '../types';

export default function SupportPage() {
  const { user, openAuthModal } = useAuth();

  const [email, setEmail] = useState('');
  const [category, setCategory] = useState('account');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState<SupportTicket | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Pre-fill email when authenticated user is loaded
  useEffect(() => {
    if (user?.email && !user.email.endsWith('@bharahobe.app') && !user.email.endsWith('@thikana.app')) {
      setEmail(user.email);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!user) {
      openAuthModal('signin');
      return;
    }

    if (!email.trim()) {
      setErrorMessage('Please provide a valid contact email.');
      return;
    }

    if (!subject.trim()) {
      setErrorMessage('Please enter a brief subject for your ticket.');
      return;
    }

    if (!message.trim()) {
      setErrorMessage('Please describe the issue or inquiry.');
      return;
    }

    setSubmitting(true);
    try {
      const fullSubject = `[${category.toUpperCase()}] ${subject.trim()}`;
      const ticket = await submitSupportTicket(user.uid, email, fullSubject, message);
      setSubmittedTicket(ticket);
      // Reset form fields
      setSubject('');
      setMessage('');
    } catch (err: any) {
      setErrorMessage(
        err?.message || 'Failed to submit your support ticket. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setSubmittedTicket(null);
    setSubject('');
    setMessage('');
    setErrorMessage(null);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 md:py-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-4 border border-emerald-200 dark:border-emerald-800">
          <LifeBuoy className="w-3.5 h-3.5" />
          Customer Care &amp; Help Desk
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Bhara Hobe Support Center
        </h1>
        <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
          Need help with your property listing, account verification, or have a safety concern? Our team is here to assist.
        </p>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <Link
          to="/faq"
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 hover:shadow-md transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <HelpCircle className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors flex items-center justify-between">
            <span>Knowledge Base &amp; FAQ</span>
            <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all" />
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            Instant answers for account login, posting ads, and verification guidelines.
          </p>
        </Link>

        <Link
          to="/manual"
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 hover:shadow-md transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <Compass className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex items-center justify-between">
            <span>User Manual &amp; Guides</span>
            <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all" />
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            Step-by-step visual tutorial on search filters, secure chat, and ad management.
          </p>
        </Link>

        <Link
          to="/privacy"
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 hover:shadow-md transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors flex items-center justify-between">
            <span>Privacy &amp; Data Security</span>
            <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all" />
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            Understand how NID and contact numbers are cryptographically isolated in Firestore.
          </p>
        </Link>
      </div>

      {/* Main Ticket Submission Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-5 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
              <Ticket className="w-5 h-5 text-emerald-600" />
              <span>Submit a Support Ticket</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Directly connects to our operations team. We typically respond within 24 hours.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 w-fit">
            <Clock className="w-3.5 h-3.5 text-emerald-600" />
            <span>Support Hours: 9 AM – 9 PM BST</span>
          </div>
        </div>

        {/* Not Logged In Warning Banner */}
        {!user && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900 dark:text-amber-200">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
              <span>
                Please sign in to submit and track support tickets linked to your verified account.
              </span>
            </div>
            <button
              type="button"
              onClick={() => openAuthModal('signin')}
              className="shrink-0 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs transition-all w-fit"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In to Continue</span>
            </button>
          </div>
        )}

        {/* Successful Submission View */}
        {submittedTicket ? (
          <div className="py-8 px-4 text-center space-y-4 max-w-lg mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Support Ticket Created Successfully!
            </h3>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-left space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Ticket ID:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {submittedTicket.ticketId}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Status:</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-semibold uppercase tracking-wider text-[10px]">
                  {submittedTicket.status}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Contact Email:</span>
                <span className="text-slate-800 dark:text-slate-200 font-semibold">
                  {submittedTicket.email}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Subject:</span>
                <p className="text-slate-800 dark:text-slate-200 font-semibold mt-0.5">
                  {submittedTicket.subject}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Our support specialists have received your inquiry. A confirmation receipt has been recorded and follow-up updates will be sent to your registered email.
            </p>

            <button
              type="button"
              onClick={handleResetForm}
              className="mt-4 px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-semibold text-xs sm:text-sm hover:opacity-90 transition-opacity cursor-pointer"
            >
              Submit Another Inquiry
            </button>
          </div>
        ) : (
          /* Submission Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Category */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Inquiry Topic
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  disabled={submitting}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  <option value="account">Account &amp; Email Verification</option>
                  <option value="listing">Posting or Updating an Ad</option>
                  <option value="safety">Report Fraud or Safety Concern</option>
                  <option value="technical">Bug or Technical Issue</option>
                  <option value="billing">Feedback &amp; Suggestions</option>
                  <option value="other">General Question</option>
                </select>
              </div>

              {/* Contact Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Contact Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    disabled={submitting}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs sm:text-sm placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Ticket Subject
              </label>
              <input
                type="text"
                required
                maxLength={150}
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Brief summary of your request (e.g., Cannot verify email for landlord listing)"
                disabled={submitting}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs sm:text-sm placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Message Description */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Detailed Description
                </label>
                <span className="text-[11px] text-slate-400">
                  {message.length} / 1500 chars
                </span>
              </div>
              <textarea
                required
                rows={5}
                maxLength={1500}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Please describe your question or issue in detail. If referring to a specific property listing, please include the 6-character Ad ID..."
                disabled={submitting}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs sm:text-sm placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 resize-y"
              />
            </div>

            {/* Submit Action */}
            <div className="pt-2 flex items-center justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-xs shadow-emerald-600/20 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting Ticket...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Ticket</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Emergency / Urgent Direct Contacts */}
      <div className="mt-8 text-center text-xs text-slate-500 dark:text-slate-400">
        For immediate safety or fraud emergencies, email our Trust Desk at{' '}
        <a
          href="mailto:support@bharahobe.app"
          className="text-emerald-600 dark:text-emerald-400 font-semibold underline underline-offset-2"
        >
          support@bharahobe.app
        </a>
      </div>
    </div>
  );
}
