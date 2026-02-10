import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import HeroSection from '@/components/about/HeroSection';
import MissionVisionSection from '@/components/about/MissionVisionSection';
import StatsSection from '@/components/about/StatsSection';
import TeamSection from '@/components/about/TeamSection';
import ValuesSection from '@/components/about/ValuesSection';
import GallerySection from '@/components/about/GallerySection';
import CTASection from '@/components/about/CTASection';

const AboutPage = () => {
  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-white">
       <Helmet>
          <title>About Us | GeorgianTrip - Our Story & Mission</title>
          <meta name="description" content="Learn about GeorgianTrip, our story, values, and the team dedicated to making your Georgian adventure unforgettable." />
       </Helmet>

       <HeroSection />
       <MissionVisionSection />
       <StatsSection />
       <ValuesSection />
       <TeamSection />
       <GallerySection />
       <CTASection />
    </div>
  );
};

export default AboutPage;