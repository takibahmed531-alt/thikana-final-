/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import GlobalLayout from './components/GlobalLayout';
import HomePage from './pages/HomePage';
import PropertyDetailsPage from './pages/PropertyDetailsPage';
import ChatInterface from './pages/ChatInterface';
import SavedPage from './pages/SavedPage';
import PostAdPage from './pages/PostAdPage';
import ProfilePage from './pages/ProfilePage';

export default function App() {
  return (
    <AuthProvider>
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
            {/* Catch-all redirect to Home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

