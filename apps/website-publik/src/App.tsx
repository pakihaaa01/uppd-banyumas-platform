import React, { useState, useEffect } from 'react';
import { SamsatProvider, useSamsat } from './context/SamsatContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HomePage } from './components/pages/HomePage';
import { ProfilePage } from './components/pages/ProfilePage';
import { ServicesPage } from './components/pages/ServicesPage';
import { PublicInfoPage } from './components/pages/PublicInfoPage';
import { FaqPage } from './components/pages/FaqPage';
import { ContactPage } from './components/pages/ContactPage';
import { SamsatChatbot } from './components/chatbot/SamsatChatbot';
import { AdminGate } from './components/admin/AdminGate';

const PublicSite: React.FC = () => {
  const { currentPage } = useSamsat();

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-black font-sans selection:bg-[#005BAC] selection:text-white">
      <Navbar />

      <main className="flex-grow">
        {currentPage === 'home' && <HomePage />}
        {currentPage === 'profile' && <ProfilePage />}
        {currentPage === 'services' && <ServicesPage />}
        {currentPage === 'public-info' && <PublicInfoPage />}
        {currentPage === 'faq' && <FaqPage />}
        {currentPage === 'contact' && <ContactPage />}
      </main>

      <Footer />
      <SamsatChatbot />
    </div>
  );
};

// Root-level router: keeps the Admin Dashboard fully separated from the
// public-facing site (its own shell, no shared Navbar/Footer), reached via
// the #admin URL hash so it can be bookmarked / opened directly.
const RootRouter: React.FC = () => {
  const [hash, setHash] = useState<string>(window.location.hash);

  useEffect(() => {
    const handleHashChange = () => setHash(window.location.hash);
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const isAdminRoute = hash.startsWith('#admin') || window.location.pathname.startsWith('/admin');

  return isAdminRoute ? <AdminGate /> : <PublicSite />;
};

export default function App() {
  return (
    <SamsatProvider>
      <RootRouter />
    </SamsatProvider>
  );
}

