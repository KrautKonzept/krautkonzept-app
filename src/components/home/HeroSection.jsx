import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import BookingModal from "../BookingModal";


export default function HeroSection() {
  const [bookingOpen, setBookingOpen] = useState(false);
  const [preselectedCategory, setPreselectedCategory] = useState(null);

  const dashboardItems = [
    { title: "Marketing & Brand", icon: "📊", bookingCategory: "Marketing & Community" },
    { title: "Strategie & Wachstum", icon: "📈", bookingCategory: "Strategie & Wachstum" },
    { title: "Digitale Infrastruktur", icon: "💻", bookingCategory: "Digitale Infrastruktur" },
    { title: "KI-Integration", icon: "🤖", bookingCategory: "KI-Integration" },
  ];

  const handleBookClick = (category) => {
    setPreselectedCategory(category);
    setBookingOpen(true);
  };

  return (
    <section className="relative overflow-hidden bg-white">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-orange-100/40 blur-3xl" />
        <div className="absolute top-20 -left-20 w-72 h-72 rounded-full bg-orange-50/60 blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-24 lg:py-36">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Text */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 border border-orange-200 mb-8">
              <span className="text-sm font-medium text-orange-700">organisch. menschlich. intelligent.</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-[1.1] tracking-tight">
              Struktur schafft Raum für{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600">
                Wachstum.
              </span>
            </h1>

            <p className="mt-8 text-lg text-gray-600 leading-relaxed max-w-lg">
              KrautKonzept ist Partner, nicht Dienstleister. Strategie, Marketing, Technologie und KI aus einer Hand.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                to={createPageUrl("Contact")}
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 group"
              >
                Jetzt anfragen
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to={createPageUrl("Services")}
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all"
              >
                Leistungen
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to={createPageUrl("Services")}
                className="inline-flex items-center gap-2 px-7 py-3.5 border-2 border-orange-500 text-orange-600 font-semibold rounded-xl hover:bg-orange-50 transition-all"
              >
                Tokens erkunden
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>


          </motion.div>

          {/* Dashboard Cards 2x2 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
            style={{display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1rem"}}
            className="hidden lg:grid"
          >
            {dashboardItems.map((item, idx) => (
              <div key={item.title} className="bg-white rounded-2xl border border-gray-200 p-8 shadow-md hover:shadow-lg transition-all flex flex-col">
                <h3 className="font-semibold text-gray-900 text-base mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-6 flex-1">
                  {item.title === "Marketing & Brand" && "Deine Marke kommuniziert Werte und schafft emotionale Verbindung."}
                  {item.title === "Strategie & Wachstum" && "Klare Ziele, fundierte Planung und messbare Erfolge für dein Unternehmen."}
                  {item.title === "Digitale Infrastruktur" && "Robuste technische Grundlagen für sichere und skalierbare Systeme."}
                  {item.title === "KI-Integration" && "Intelligente Automatisierung, die Zeit spart und neue Möglichkeiten schafft."}
                </p>
                <button
                  onClick={() => handleBookClick(item.bookingCategory)}
                  className="px-4 py-2 border border-orange-500 text-orange-600 text-xs font-medium rounded-lg hover:bg-orange-50 transition-all w-full"
                >
                  Jetzt buchen →
                </button>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      <BookingModal
        isOpen={bookingOpen}
        onClose={() => {
          setBookingOpen(false);
          setPreselectedCategory(null);
        }}
        preselectedCategory={preselectedCategory}
      />
    </section>
  );
}