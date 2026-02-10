import React from 'react';
import HeroSection from '@/components/home/HeroSection';
import PopularToursSection from '@/components/home/PopularToursSection';
import PopularTransfersSection from '@/components/home/PopularTransfersSection';
import { Helmet } from 'react-helmet';

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>GeorgianTrip - Explore Georgia with Comfort</title>
        <meta name="description" content="Book transfers and tours in Georgia. Best prices for Kazbegi, Kakheti, and more." />
      </Helmet>
      
      <HeroSection />
      
      <div className="space-y-20 pb-20">
        <PopularToursSection />
        <PopularTransfersSection />
      </div>
    </div>
  );
};

export default Home;