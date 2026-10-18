import React from 'react';
import { HeroSection } from '../home/HeroSection';
import { QuickServiceCards } from '../home/QuickServiceCards';
import { LatestAnnouncements } from '../home/LatestAnnouncements';
import { PublicSatisfactionStats } from '../home/PublicSatisfactionStats';
import { WhyChooseUs } from '../home/WhyChooseUs';

export const HomePage: React.FC = () => {
  return (
    <div className="space-y-0">
      <HeroSection />
      <QuickServiceCards />
      <WhyChooseUs />
      <LatestAnnouncements />
      <PublicSatisfactionStats />
    </div>
  );
};
