/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { FeedView } from './components/FeedView';
import { SearchView } from './components/SearchView';
import { ChatView } from './components/ChatView';
import { ProfileView } from './components/ProfileView';
import { ItemDetailModal } from './components/ItemDetailModal';
import { AddItemModal } from './components/AddItemModal';
import { AuthModal } from './components/AuthModal';
import { CheckoutModal } from './components/CheckoutModal';
import { FavoritesModal } from './components/FavoritesModal';
import { EditProfileModal } from './components/EditProfileModal';
import { ToastContainer } from './components/ToastContainer';

const MainLayout: React.FC = () => {
  const { activeTab, dir } = useApp();

  return (
    <div 
      dir={dir} 
      className="min-h-screen bg-[#F8FAFD] text-slate-900 flex flex-col font-['Rubik',sans-serif] selection:bg-purple-100 selection:text-purple-900"
    >
      {/* Toast Notifications (Floating at top) */}
      <ToastContainer />

      {/* Top Application Header with Brand and Favorites Heart Button */}
      <Navbar />

      {/* Main Content Area - Mobile & Desktop Responsive */}
      <main className="flex-1 w-full max-w-lg md:max-w-2xl mx-auto px-4 py-3">
        {activeTab === 'feed' && <FeedView />}
        {activeTab === 'search' && <SearchView />}
        {activeTab === 'chat' && <ChatView />}
        {activeTab === 'profile' && <ProfileView />}
      </main>

      {/* Fixed Bottom Navigation Bar with Circular Plus Button */}
      <BottomNav />

      {/* Interactive Modals */}
      <FavoritesModal />
      <ItemDetailModal />
      <AddItemModal />
      <EditProfileModal />
      <AuthModal />
      <CheckoutModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
