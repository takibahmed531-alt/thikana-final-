import { useState, useEffect } from 'react';
import {
  Bookmark,
  Search,
  Bell,
  Trash2,
  Send,
  CheckCircle2,
  AlertCircle,
  Plus,
  Loader2,
  Mail,
  ShieldCheck,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { SearchAlert } from '../types';
import {
  getUserSearchAlerts,
  deleteSearchAlert,
  createSearchAlert,
  sendSamplePropertyAlert,
} from '../services/alertService';

export default function SavedPage() {
  const { user, signInWithGoogle } = useAuth();
  const [activeTab, setActiveTab] = useState<'bookmarks' | 'alerts'>('alerts');
  const [alerts, setAlerts] = useState<SearchAlert[]>([]);
  const [loadingAlerts, setLoadingAlerts] = useState(false);
  const [testSending, setTestSending] = useState(false);
  const [testSuccessMessage, setTestSuccessMessage] = useState<string | null>(null);

  // New alert form state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newArea, setNewArea] = useState('Dhanmondi');
  const [newCategory, setNewCategory] = useState('apartment');
  const [newMaxRent, setNewMaxRent] = useState('');
  const [savingAlert, setSavingAlert] = useState(false);

  useEffect(() => {
    if (user?.uid) {
      loadAlerts();
    }
  }, [user?.uid]);

  const loadAlerts = async () => {
    if (!user?.uid) return;
    setLoadingAlerts(true);
    try {
      const userAlerts = await getUserSearchAlerts(user.uid);
      setAlerts(userAlerts);
    } catch (err) {
      console.warn('Failed to load user search alerts:', err);
    } finally {
      setLoadingAlerts(false);
    }
  };

  const handleDeleteAlert = async (alertId?: string) => {
    if (!alertId || !user?.uid) return;
    const confirmed = window.confirm('Are you sure you want to remove this property search alert?');
    if (!confirmed) return;

    const success = await deleteSearchAlert(alertId, user.uid);
    if (success) {
      setAlerts((prev) => prev.filter((a) => a.id !== alertId && a.alertId !== alertId));
    }
  };

  const handleCreateNewAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid) return;

    setSavingAlert(true);
    try {
      await createSearchAlert(user.uid, newArea, newCategory, {
        userEmail: user.email || '',
        maxRent: newMaxRent ? Number(newMaxRent) : undefined,
        emailNotifications: true,
      });
      setShowAddModal(false);
      setNewArea('Dhanmondi');
      setNewCategory('apartment');
      setNewMaxRent('');
      await loadAlerts();
    } catch (err) {
      console.error('Error creating alert:', err);
    } finally {
      setSavingAlert(false);
    }
  };

  const handleSendTestEmail = async () => {
    if (!user?.email || !user?.uid) return;
    setTestSending(true);
    setTestSuccessMessage(null);
    try {
      const res = await sendSamplePropertyAlert(user.email, user.uid, {
        title: 'Sample 3-BHK Modern Flat with Lake View',
        rentAmount: 35000,
        category: 'apartment',
        location: 'Dhanmondi 8/A, Dhaka',
        adId: 'THK-SAMPLE',
      });
      setTestSuccessMessage(res.message || 'Sample property alert email sent successfully!');
      setTimeout(() => setTestSuccessMessage(null), 6000);
    } catch (err: any) {
      console.error('Error sending test email:', err);
    } finally {
      setTestSending(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 mb-6 gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <Bell className="w-6 h-6 text-emerald-600" />
            Alerts & Saved Preferences
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your automated email alerts and saved property preferences.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('alerts')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'alerts'
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5" />
              Email Alerts
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('bookmarks')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'bookmarks'
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Bookmark className="w-3.5 h-3.5" />
              Saved Listings
            </span>
          </button>
        </div>
      </div>

      {activeTab === 'alerts' && (
        <div className="space-y-6">
          {/* Automated Notification Service Banner */}
          <div className="bg-gradient-to-r from-emerald-900 to-teal-800 text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
            <div className="max-w-xl space-y-2">
              <div className="inline-flex items-center gap-1.5 bg-emerald-700/60 text-emerald-100 px-2.5 py-1 rounded-full text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                Automated Cloud Notification Engine
              </div>
              <h2 className="text-xl font-bold">Instant Property Match Alerts</h2>
              <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
                Whenever landlords post properties matching your favorite neighborhoods, categories, or rent budget, Thikana immediately sends an automated email alert to your inbox.
              </p>
            </div>

            {user && (
              <div className="mt-4 pt-4 border-t border-emerald-700/50 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs text-emerald-200">
                  <Mail className="w-4 h-4 text-emerald-300" />
                  <span>Subscribed Email: <strong>{user.email || 'Google Account'}</strong></span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSendTestEmail}
                    disabled={testSending}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 active:scale-95 text-white text-xs font-semibold rounded-lg transition-all"
                  >
                    {testSending ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5 text-emerald-300" />
                    )}
                    Send Test Alert Email
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowAddModal(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-emerald-950 text-xs font-bold rounded-lg transition-all shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    New Search Alert
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Test Email Success Feedback */}
          {testSuccessMessage && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{testSuccessMessage}</span>
            </div>
          )}

          {!user ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-4 shadow-sm">
              <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto">
                <Bell className="w-7 h-7" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h2 className="text-base font-semibold text-slate-800">Sign in to manage email alerts</h2>
                <p className="text-xs text-slate-500">
                  Save your search preferences and get automated email notifications the instant matching rentals are posted.
                </p>
              </div>
              <button
                type="button"
                onClick={() => signInWithGoogle()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors"
              >
                Sign In with Google
              </button>
            </div>
          ) : loadingAlerts ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
              <p className="text-xs">Loading your saved search alerts...</p>
            </div>
          ) : alerts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-4 shadow-sm">
              <div className="w-14 h-14 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
                <Bell className="w-7 h-7" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h2 className="text-base font-semibold text-slate-800">No active property alerts</h2>
                <p className="text-xs text-slate-500">
                  Set up your preferred areas (like Dhanmondi, Banani, Uttara) and budget. We will email you automatically when landlords post matching listings.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Create Property Alert
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Active Search Alerts ({alerts.length})
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {alerts.map((alert) => (
                  <div
                    key={alert.id || alert.alertId}
                    className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col justify-between gap-3 hover:border-emerald-300 transition-colors"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="inline-block bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-0.5 rounded-full capitalize">
                          {alert.category || 'All Categories'}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDeleteAlert(alert.id || alert.alertId)}
                          className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                          title="Delete Alert"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <h4 className="font-semibold text-slate-800 text-sm">
                        📍 Area: {alert.area || 'All Areas'}
                      </h4>

                      {alert.maxRent && (
                        <p className="text-xs text-slate-500 mt-1">
                          Max Budget: <strong>৳{alert.maxRent.toLocaleString()}</strong>/month
                        </p>
                      )}

                      <p className="text-xs text-emerald-600 mt-2 flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        Automated email alerts active
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Instant match enabled</span>
                      <NavLink
                        to={`/?q=${encodeURIComponent(alert.area || '')}`}
                        className="text-emerald-600 hover:underline font-semibold"
                      >
                        Search Now →
                      </NavLink>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add Alert Modal */}
          {showAddModal && (
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                    <Bell className="w-5 h-5 text-emerald-600" />
                    Configure New Property Alert
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleCreateNewAlert} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Target Area / Neighborhood
                    </label>
                    <input
                      type="text"
                      value={newArea}
                      onChange={(e) => setNewArea(e.target.value)}
                      placeholder="e.g. Dhanmondi, Banani, Uttara, Mirpur"
                      required
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Property Category
                    </label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-emerald-500"
                    >
                      <option value="apartment">Family Apartment</option>
                      <option value="bachelor_sublet">Bachelor / Sublet</option>
                      <option value="house">Independent House</option>
                      <option value="hostel">Hostel / Mess</option>
                      <option value="commercial">Commercial Space</option>
                      <option value="All">Any Category</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Maximum Monthly Rent Budget (BDT ৳) (Optional)
                    </label>
                    <input
                      type="number"
                      value={newMaxRent}
                      onChange={(e) => setNewMaxRent(e.target.value)}
                      placeholder="e.g. 35000"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="bg-emerald-50 text-emerald-800 p-3 rounded-xl text-[11px] flex items-start gap-2">
                    <Mail className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      Alerts will be sent automatically to <strong>{user?.email || 'your email'}</strong> immediately when a landlord posts a match.
                    </span>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="px-4 py-2 text-slate-600 hover:text-slate-800 font-semibold text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={savingAlert}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs shadow-sm transition-colors flex items-center gap-1.5"
                    >
                      {savingAlert ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                      Save Alert
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'bookmarks' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
            <Bookmark className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h2 className="text-base font-semibold text-slate-800">No saved properties yet</h2>
            <p className="text-xs text-slate-500">
              Browse through listings on Thikana and click the bookmark icon to keep track of your favorite apartments.
            </p>
          </div>
          <div className="pt-2">
            <NavLink
              to="/"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors"
            >
              <Search className="w-3.5 h-3.5" />
              Explore Properties
            </NavLink>
          </div>
        </div>
      )}
    </div>
  );
}
