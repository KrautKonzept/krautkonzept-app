import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasConsent = localStorage.getItem("cookieConsent");
    if (!hasConsent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookieConsent", "accepted");
    setIsVisible(false);
  };

  const handleReject = () => {
    localStorage.setItem("cookieConsent", "rejected");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-2xl"
    >
      <div className="max-w-7xl mx-auto px-6 py-4 md:py-5 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-sm text-gray-700 flex-1">
          <p className="font-semibold text-gray-900 mb-1">Cookies und DSGVO</p>
          <p className="text-xs md:text-sm">
            Wir nutzen Cookies für ein optimales Nutzungserlebnis und Analyse. Durch Klick auf "Akzeptieren" stimmen Sie zu.
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReject}
            className="text-xs md:text-sm"
          >
            Ablehnen
          </Button>
          <Button
            onClick={handleAccept}
            className="bg-orange-500 hover:bg-orange-600 text-white text-xs md:text-sm"
          >
            Akzeptieren
          </Button>
        </div>
      </div>
    </motion.div>
  );
}