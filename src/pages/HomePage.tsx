import React from 'react';
import Hero from '../components/Hero';
import WaitlistSection from '../components/WaitlistSection';
import FeaturedGame from '../components/FeaturedGame';
import LeaderboardPreview from '../components/LeaderboardPreview';
import RoadmapPreview from '../components/RoadmapPreview';
import Footer from '../components/Footer';

const HomePage = () => {
  return (
    <>
      <Hero />
      <WaitlistSection />
      <FeaturedGame />
      <LeaderboardPreview />
      <RoadmapPreview />
      <Footer />
    </>
  );
};

export default HomePage;