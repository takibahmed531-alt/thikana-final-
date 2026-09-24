import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  HelpCircle,
  Search,
  ChevronDown,
  KeyRound,
  Building,
  ShieldCheck,
  Mail,
  ShieldAlert,
  BadgeCheck,
  DollarSign,
  UserCheck,
  MessageSquare,
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface FAQItem {
  id: string;
  category: 'login' | 'posting' | 'safety';
  question: string;
  answer: string | React.ReactNode;
  icon: React.ElementType;
}

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState<'all' | 'login' | 'posting' | 'safety'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [openIds, setOpenIds] = useState<string[]>(['login-1', 'posting-1', 'safety-1']);

  const faqData: FAQItem[] = [
    // Login & Authentication
    {
      id: 'login-1',
      category: 'login',
      question: 'How do I create an account or sign in to Bhara Hobe?',
      icon: KeyRound,
      answer:
        'You can sign up or sign in instantly with one click using "Continue with Google". This securely links your verified account without requiring you to remember a separate password. If your email or phone is already registered, you can also sign in directly using your credentials.',
    },
    {
      id: 'login-2',
      category: 'login',
      question: 'Why do I need to verify my email address before posting ads?',
      icon: Mail,
      answer:
        'Email verification is a key anti-fraud shield. Requiring verified email addresses prevents spam bots and duplicate fake accounts from publishing misleading rental advertisements, ensuring tenants only communicate with authentic landlords.',
    },
    {
      id: 'login-3',
      category: 'login',
      question: 'Can I switch between Tenant and Landlord roles?',
      icon: UserCheck,
      answer:
        'Yes! On your Profile page, you can freely switch your primary role between Tenant, Landlord, or Property Agent. Your role helps personalize your home screen and listing management features.',
    },
    {
      id: 'login-4',
      category: 'login',
      question: 'What should I do if I did not receive the verification email?',
      icon: HelpCircle,
      answer:
        'Check your spam or junk mail folder. You can also visit your Profile page and click the "Resend Verification Link" button in the verification alert banner to dispatch a fresh verification email immediately.',
    },

    // Posting Ads & Listings
    {
      id: 'posting-1',
      category: 'posting',
      question: 'How do I post a rental property ad on Bhara Hobe?',
      icon: Building,
      answer:
        'Click "Post Ad" in the navigation bar. If logged in with a verified account, you will see a simple 3-step listing builder. You can specify property type (Family, Bachelor/Sublet, Apartment, Commercial), monthly rent, location area, amenities, and upload property photos.',
    },
    {
      id: 'posting-2',
      category: 'posting',
      question: 'Is there any fee or commission to post a rental listing?',
      icon: DollarSign,
      answer:
        'No. Posting standard rental property ads on Bhara Hobe is 100% free of charge for landlords, homeowners, and sublet hosts. We do not deduct middleman brokerage commissions.',
    },
    {
      id: 'posting-3',
      category: 'posting',
      question: 'How can I update my ad or mark it as "Rented"?',
      icon: Building,
      answer:
        'Navigate to your Profile page or open your listing page. As the verified listing owner, you have one-click controls to toggle status between "Available" and "Rented", edit rental rates, or delete the ad once rented.',
    },
    {
      id: 'posting-4',
      category: 'posting',
      question: 'What are the photo requirements for a listing?',
      icon: Sparkles,
      answer:
        'We recommend uploading at least 3-5 clear, well-lit photos showing the bedroom, bathroom, kitchen, and balcony/entrance. High-quality realistic images receive up to 4x more tenant inquiries.',
    },

    // Safety & Scam Prevention
    {
      id: 'safety-1',
      category: 'safety',
      question: 'How does Bhara Hobe protect tenants from rental advance scams?',
      icon: ShieldAlert,
      answer:
        'Golden Rule: Never transfer advance booking money, bKash, or security deposits before visiting the property in person and verifying the physical premises with the landlord. Bhara Hobe provides built-in reporting tools on every listing to instantly flag suspicious claims.',
    },
    {
      id: 'safety-2',
      category: 'safety',
      question: 'What does the "Verified User" checkmark mean?',
      icon: BadgeCheck,
      answer:
        'A user with a Verified badge has verified their identity credentials with Bhara Hobe. Verified landlords and tenants are distinguished with an emerald shield badge across listing cards and messages.',
    },
    {
      id: 'safety-3',
      category: 'safety',
      question: 'How does in-app chat protect my privacy?',
      icon: MessageSquare,
      answer:
        'Bhara Hobe\'s built-in chat allows tenants and landlords to discuss rent, scheduling visits, and inquiries without sharing personal phone numbers or social media handles prematurely until both parties are comfortable.',
    },
    {
      id: 'safety-4',
      category: 'safety',
      question: 'How do I report a fake listing or suspicious account?',
      icon: ShieldCheck,
      answer:
        'Every property details page features a "Report this Listing" button. Select the reason (Fraud/Advance Scam, Misleading Photos, Inaccurate Price, etc.) and submit. Our Trust and Safety moderation team reviews flagged listings within 24 hours.',
    },
  ];

  const toggleAccordion = (id: string) => {
    setOpenIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const filteredFaqs = useMemo(() => {
    return faqData.filter((item) => {
      const matchesCategory =
        activeCategory === 'all' || item.category === activeCategory;
      const matchesSearch =
        searchQuery.trim() === '' ||
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (typeof item.answer === 'string' &&
          item.answer.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 md:py-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-4 border border-emerald-200 dark:border-emerald-800">
          <HelpCircle className="w-3.5 h-3.5" />
          Frequently Asked Questions
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          How can we help you?
        </h1>
        <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400">
          Find instant answers to common questions about accounts, posting rental ads, and safety on Bhara Hobe.
        </p>

        {/* Search Bar */}
        <div className="mt-6 relative max-w-md mx-auto">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions (e.g. login, verify, rent, safety)..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 shadow-xs transition-all"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
        <button
          type="button"
          onClick={() => setActiveCategory('all')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            activeCategory === 'all'
              ? 'bg-emerald-600 text-white shadow-xs shadow-emerald-600/20'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          All Topics
        </button>

        <button
          type="button"
          onClick={() => setActiveCategory('login')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            activeCategory === 'login'
              ? 'bg-emerald-600 text-white shadow-xs shadow-emerald-600/20'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <KeyRound className="w-3.5 h-3.5" />
          <span>Login &amp; Accounts</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveCategory('posting')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            activeCategory === 'posting'
              ? 'bg-emerald-600 text-white shadow-xs shadow-emerald-600/20'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Building className="w-3.5 h-3.5" />
          <span>Posting Ads</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveCategory('safety')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            activeCategory === 'safety'
              ? 'bg-emerald-600 text-white shadow-xs shadow-emerald-600/20'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Safety &amp; Trust</span>
        </button>
      </div>

      {/* Accordion List */}
      <div className="space-y-3">
        {filteredFaqs.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
            <HelpCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              No matching questions found
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Try different keywords or submit a ticket directly to our support team.
            </p>
          </div>
        ) : (
          filteredFaqs.map((faq) => {
            const isOpen = openIds.includes(faq.id);
            const Icon = faq.icon;

            return (
              <div
                key={faq.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-2xs transition-all"
              >
                <button
                  type="button"
                  onClick={() => toggleAccordion(faq.id)}
                  className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        isOpen
                          ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white">
                      {faq.question}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-emerald-600' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800/60 mt-1">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Need more help banner */}
      <div className="mt-12 p-6 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
            Still have questions or need assistance?
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Our Bhara Hobe Support team is ready to assist you with account verification, listings, or technical help.
          </p>
        </div>
        <Link
          to="/support"
          className="shrink-0 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm transition-all flex items-center gap-2 shadow-xs cursor-pointer"
        >
          <span>Open Support Center</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
