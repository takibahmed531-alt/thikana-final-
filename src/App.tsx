/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PreferencesProvider } from './context/PreferencesContext';
import { LanguageProvider } from './context/LanguageContext';
import GlobalLayout from './components/GlobalLayout';
import HomePage from './pages/HomePage';
import PropertyDetailsPage from './pages/PropertyDetailsPage';
import ChatInterface from './pages/ChatInterface';
import SavedPage from './pages/SavedPage';
import PostAdPage from './pages/PostAdPage';
import ProfilePage from './pages/ProfilePage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import FAQPage from './pages/FAQPage';
import UserManualPage from './pages/UserManualPage';
import SupportPage from './pages/SupportPage';

export default function App() {
  return (
    <AuthProvider>
      <PreferencesProvider>
        <LanguageProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<GlobalLayout />}>
                <Route index element={<HomePage />} />
                <Route path="property/:id" element={<PropertyDetailsPage />} />
                <Route path="messages" element={<ChatInterface />} />
                <Route path="chat" element={<Navigate to="/messages" replace />} />
                <Route path="saved" element={<SavedPage />} />
                <Route path="post-ad" element={<PostAdPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="privacy" element={<PrivacyPolicyPage />} />
                <Route path="faq" element={<FAQPage />} />
                <Route path="manual" element={<UserManualPage />} />
                <Route path="user-manual" element={<Navigate to="/manual" replace />} />
                <Route path="guide" element={<Navigate to="/manual" replace />} />
                <Route path="support" element={<SupportPage />} />
                <Route path="help" element={<Navigate to="/support" replace />} />
                {/* Catch-all redirect to Home */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </LanguageProvider>
      </PreferencesProvider>
    </AuthProvider>
  );
}

