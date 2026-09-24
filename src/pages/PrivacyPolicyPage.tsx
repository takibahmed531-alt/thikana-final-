import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Lock,
  EyeOff,
  FileText,
  UserCheck,
  Server,
  HelpCircle,
  ArrowRight,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 md:py-12">
      {/* Header */}
      <div className="mb-10 text-center sm:text-left border-b border-slate-200 dark:border-slate-800 pb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-4 border border-emerald-200 dark:border-emerald-800">
          <ShieldCheck className="w-3.5 h-3.5" />
          Trust & Security Standards
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Privacy Policy & Data Security
        </h1>
        <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
          How Bhara Hobe protects your personal identity, rental agreements, and sensitive credentials with isolated Firestore cloud security.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
          <span>Effective Date: September 2026</span>
          <span>•</span>
          <span>Version 2.4</span>
          <span>•</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-medium">Compliance: Cloud Security Verified</span>
        </div>
      </div>

      {/* Highlights / Executive Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-3">
            <Lock className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Dual-Collection Isolation</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
            NID and phone records are quarantined in a restricted Firestore collection, unreachable by public viewers.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-950/80 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-3">
            <EyeOff className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Zero Third-Party Sharing</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
            We never sell or distribute your contact details or rental search history to external marketers or brokers.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="w-9 h-9 rounded-lg bg-purple-100 dark:bg-purple-950/80 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-3">
            <UserCheck className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Landlord-Tenant Trust</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
            Identity verification badges prove verified credentials without exposing the underlying document numbers.
          </p>
        </div>
      </div>

      {/* Main Content Sections */}
      <div className="space-y-10 text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
        {/* Section 1 */}
        <section id="isolation-architecture" className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <Server className="w-5 h-5 text-emerald-600 shrink-0" />
            1. Dedicated Architecture: How NID & Phone Numbers Are Isolated
          </h2>
          <p>
            Unlike traditional rental listing boards where user contact info and identification numbers are bundled into a single database record, Bhara Hobe implements an isolated <strong>Dual-Tier Security Architecture</strong> on Google Cloud Firestore:
          </p>

          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 text-slate-200 border border-slate-800 my-4 space-y-4">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-emerald-900/60 text-emerald-300 border border-emerald-700/50">
                publicProfiles/{'{uid}'}
              </span>
              <span className="text-xs text-slate-400">Public Information</span>
            </div>
            <p className="text-xs text-slate-300 pl-4 border-l-2 border-emerald-500">
              Contains strictly safe public display data: <code className="text-emerald-400">displayName</code>, <code className="text-emerald-400">photoURL</code>, role (<code className="text-emerald-400">tenant</code>, <code className="text-emerald-400">landlord</code>, or <code className="text-emerald-400">agent</code>), and verification status flag (<code className="text-emerald-400">isVerified</code>). This collection contains <strong>zero PII</strong>.
            </p>

            <div className="flex items-center gap-3 pt-2 border-t border-slate-800">
              <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-amber-900/60 text-amber-300 border border-amber-700/50">
                privateUsers/{'{uid}'}
              </span>
              <span className="text-xs text-slate-400">Confidential Identity Vault</span>
            </div>
            <p className="text-xs text-slate-300 pl-4 border-l-2 border-amber-500">
              Securely holds high-sensitivity identity data: National Identity Number (<code className="text-amber-400">nidNumber</code>), personal phone numbers (<code className="text-amber-400">phoneNumber</code>), Date of Birth (<code className="text-amber-400">dateOfBirth</code>), and permanent address records.
            </p>
          </div>

          <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 rounded-xl p-4 text-xs text-emerald-900 dark:text-emerald-200 flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Cryptographically Enforced Firestore Rules:</span>
              <p className="mt-1">
                Access to <code className="font-mono bg-emerald-100 dark:bg-emerald-900/60 px-1 py-0.5 rounded">privateUsers/{'{uid}'}</code> is enforced strictly by Firestore Security Rules using <code className="font-mono font-bold">isOwner(uid)</code> verification:
                <br />
                <code className="font-mono text-[11px] block mt-1.5 p-2 bg-slate-900 text-emerald-300 rounded-lg">
                  allow read, write: if request.auth != null &amp;&amp; request.auth.uid == uid;
                </code>
                No external query, search crawler, or unauthorized user can view or list this collection under any circumstances.
              </p>
            </div>
          </div>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-emerald-600 shrink-0" />
            2. Real Estate Rental Data & Property Listings
          </h2>
          <p>
            When landlords, home owners, or sublet providers post a rental ad on Bhara Hobe:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            <li>
              <strong>Property Location:</strong> The listing public view showcases the neighborhood, area, and general vicinity coordinates so tenants can explore nearby transit and amenities.
            </li>
            <li>
              <strong>Landlord Direct Contact:</strong> Landlords can choose whether to display their verified contact phone number or require initial contact via Bhara Hobe&apos;s secured in-app chat.
            </li>
            <li>
              <strong>Listing Ownership:</strong> Only the authenticated user whose <code className="font-mono">landlordUid</code> matches the listing can update, edit pricing, or toggle availability status.
            </li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <Lock className="w-5 h-5 text-emerald-600 shrink-0" />
            3. In-App Messaging & Rental Negotiation Privacy
          </h2>
          <p>
            Conversations conducted between tenants and property owners on Bhara Hobe are protected by strict participant-level access controls:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            <li>
              Only the two designated participants in a conversation (<code className="font-mono">tenantUid</code> and <code className="font-mono">landlordUid</code>) have permission to read or transmit messages.
            </li>
            <li>
              All chat messages are timestamped and linked to specific property inquiries for auditability and spam prevention.
            </li>
            <li>
              Bhara Hobe does not use your private chat messages for advertising or behavioral targeting.
            </li>
          </ul>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            4. Fraud Prevention, Safety & Dispute Investigation
          </h2>
          <p>
            To maintain a trustworthy marketplace free of fake listings and advance-fee scams, Bhara Hobe maintains a report handling pipeline:
          </p>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            When a property or user is reported for suspicious activity, our security review team inspects the reported listing and incident notes. Reported accounts may undergo mandatory identity verification before continuing to publish advertisements.
          </p>
        </section>

        {/* Section 5 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <UserCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            5. Your Data Rights & Deletion Requests
          </h2>
          <p>
            You retain full ownership of your personal information on Bhara Hobe. You may:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            <li>Review and update your profile and confidential phone numbers anytime from your Profile settings.</li>
            <li>Delete active property listings immediately when rented or withdrawn.</li>
            <li>Request full account and associated record deletion by submitting a support ticket.</li>
          </ul>
        </section>
      </div>

      {/* Support / Contact DPO Banner */}
      <div className="mt-12 p-6 rounded-2xl bg-gradient-to-r from-emerald-900 to-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
        <div className="space-y-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2 text-emerald-400 font-semibold text-xs tracking-wider uppercase">
            <HelpCircle className="w-4 h-4" />
            Data Protection & Inquiries
          </div>
          <h3 className="text-base sm:text-lg font-bold">Have questions regarding your rental privacy?</h3>
          <p className="text-xs text-slate-300 max-w-md">
            Our Trust and Safety team is here to answer any queries regarding NID handling or security protocols.
          </p>
        </div>
        <Link
          to="/support"
          className="shrink-0 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm transition-all flex items-center gap-2 shadow-sm"
        >
          <span>Contact Support</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
