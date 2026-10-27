import {useEffect} from 'react';
import {OperationalProvider,useOperational} from './context/OperationalContext';
import {trackPage} from './lib/analytics';
import React from 'react';
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

const PublicSite: React.FC = () => {
  const { currentPage } = useSamsat();
  const {analyticsReady}=useOperational();
  useEffect(()=>{if(analyticsReady)trackPage(currentPage);},[currentPage,analyticsReady]);

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

export default function App() {
  return (
    <SamsatProvider>
      <OperationalProvider><PublicSite /></OperationalProvider>
    </SamsatProvider>
  );
}


