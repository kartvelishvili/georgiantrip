import React from 'react';
import HeroSection from '@/components/home/HeroSection';
import PopularToursSection from '@/components/home/PopularToursSection';
import PopularTransfersSection from '@/components/home/PopularTransfersSection';
import ValueIcons from '@/components/home-sections/ValueIcons';
import HowItWorksSection from '@/components/home/HowItWorksSection';
import OurStorySection from '@/components/home/OurStorySection';
import DriverRegistrationSection from '@/components/home/DriverRegistrationSection';
import Testimonials from '@/components/home-sections/Testimonials';
import InstagramFeedSection from '@/components/home-sections/InstagramFeedSection';
import BottomCTA from '@/components/home-sections/BottomCTA';
import FAQAccordion from '@/components/customer/FAQAccordion';

const HomePage = () => {
  return (
    <div className="flex flex-col w-full">
      <HeroSection />
      
      {/* Moved Up as requested in similar flows for better engagement */}
      <PopularTransfersSection />
      <PopularToursSection />
      
      {/* New Section */}
      <OurStorySection />
      
      <HowItWorksSection />
      <ValueIcons />
      <DriverRegistrationSection />
      <Testimonials />
      
      {/* New Section */}
      <InstagramFeedSection />
      
      <FAQAccordion />
      <BottomCTA />
    </div>
  );
};

export default HomePage;