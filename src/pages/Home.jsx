import React, { useState, useEffect } from "react";
import HeroSection from "../components/home/HeroSection";
import StatsSection from "../components/home/StatsSection";
import FeaturesSection from "../components/home/FeaturesSection";
import CTASection from "../components/home/CTASection";
import BookingModal from "../components/BookingModal";
import CookieBanner from "../components/CookieBanner";

export default function Home() {
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingCategory, setBookingCategory] = useState(null);

  useEffect(() => {
    const handleOpenModal = (e) => {
      setBookingCategory(e.detail?.category || null);
      setBookingModalOpen(true);
    };
    window.addEventListener('openBookingModal', handleOpenModal);
    // Auto-open if navigated with ?booking=1
    const params = new URLSearchParams(window.location.search);
    if (params.get('booking') === '1') {
      setBookingModalOpen(true);
      window.history.replaceState({}, '', '/');
    }
    return () => window.removeEventListener('openBookingModal', handleOpenModal);
  }, []);

  return (
    <div>
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <CTASection />
      <BookingModal
        isOpen={bookingModalOpen}
        onClose={() => { setBookingModalOpen(false); setBookingCategory(null); }}
        preselectedCategory={bookingCategory}
      />
      <CookieBanner />
    </div>
  );
}