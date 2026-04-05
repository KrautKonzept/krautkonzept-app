import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import {
  Palette, Code, TrendingUp, Megaphone, Search, Smartphone,
  ArrowRight, Check, CalendarCheck
} from "lucide-react";
import BookingModal from "../components/BookingModal";

const services = [
  {
    icon: Palette,
    title: "Branding & Design",
    description: "Wir kreieren visuelle Identitäten, die Ihre Marke einzigartig und wiedererkennbar machen.",
    features: ["Logo-Design", "Corporate Identity", "Brand Guidelines", "Print-Design"],
    accent: "orange",
    bookingCategory: "Marketing & Community",
  },
  {
    icon: Code,
    title: "Webentwicklung",
    description: "Performante Websites und Web-Applikationen mit modernster Technologie und Best Practices.",
    features: ["Responsive Websites", "E-Commerce", "CMS-Lösungen", "Web-Apps"],
    accent: "gray",
    bookingCategory: "Digitale Infrastruktur",
  },
  {
    icon: Smartphone,
    title: "App-Entwicklung",
    description: "Native und Cross-Platform Apps für iOS und Android — intuitiv und leistungsstark.",
    features: ["iOS Apps", "Android Apps", "Cross-Platform", "UI/UX Design"],
    accent: "orange",
    bookingCategory: "Digitale Infrastruktur",
  },
  {
    icon: TrendingUp,
    title: "Digitale Strategie",
    description: "Datengetriebene Strategien für nachhaltiges Wachstum und messbare Ergebnisse.",
    features: ["Marktanalyse", "Conversion-Optimierung", "Analytics", "KPI-Tracking"],
    accent: "gray",
    bookingCategory: "Strategie & Wachstum",
  },
  {
    icon: Megaphone,
    title: "Online Marketing",
    description: "Zielgerichtete Kampagnen, die Ihre Reichweite erhöhen und Kunden gewinnen.",
    features: ["Social Media", "Content Marketing", "E-Mail Marketing", "Paid Ads"],
    accent: "orange",
    bookingCategory: "Marketing & Community",
  },
  {
    icon: Search,
    title: "SEO & SEA",
    description: "Sichtbarkeit in Suchmaschinen steigern und qualifizierten Traffic generieren.",
    features: ["On-Page SEO", "Off-Page SEO", "Google Ads", "Keyword-Analyse"],
    accent: "gray",
    bookingCategory: "Marketing & Community",
  },
];

const accentMap = {
  orange: {
    iconBg: "bg-orange-50",
    iconColor: "text-orange-500",
    check: "text-orange-500",
    hoverBorder: "hover:border-orange-200",
  },
  gray: {
    iconBg: "bg-gray-100",
    iconColor: "text-gray-600",
    check: "text-gray-600",
    hoverBorder: "hover:border-gray-300",
  },
};

export default function Services() {
  const [selectedService, setSelectedService] = useState(null);
  const [preselectedCategory, setPreselectedCategory] = useState(null);

  const handleBookClick = (category) => {
    setPreselectedCategory(category);
    setSelectedService(true);
  };

  return (
    <div>
      {/* Hero */}
      <section className="bg-white py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <span className="text-sm font-semibold text-orange-500 uppercase tracking-wider">
              Leistungen
            </span>
            <h1 className="mt-4 text-4xl md:text-5xl font-bold text-gray-900 tracking-tight leading-tight">
              Unsere{" "}
              <span className="text-orange-500">Expertise</span>
              {" "}für Ihren Erfolg
            </h1>
            <p className="mt-6 text-lg text-gray-500 leading-relaxed">
              Von Branding über Webentwicklung bis hin zu digitalem Marketing —
              wir bieten Ihnen ein umfassendes Leistungsspektrum für Ihren digitalen Auftritt.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-12 pb-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => {
              const colors = accentMap[service.accent];
              return (
                <motion.div
                  key={service.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className={`bg-white rounded-2xl p-8 border border-gray-100 ${colors.hoverBorder} hover:shadow-lg transition-all duration-300 h-full flex flex-col`}>
                    <div className={`w-12 h-12 rounded-xl ${colors.iconBg} flex items-center justify-center mb-6`}>
                      <service.icon className={`w-6 h-6 ${colors.iconColor}`} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">{service.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed mb-6">{service.description}</p>
                    <ul className="space-y-2.5 mb-8">
                      {service.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2.5">
                          <Check className={`w-4 h-4 ${colors.check} flex-shrink-0`} />
                          <span className="text-sm text-gray-600">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-auto space-y-2">
                      <button
                        onClick={() => handleBookClick(service.bookingCategory)}
                        className="w-full px-4 py-2.5 rounded-lg border border-orange-500 text-orange-600 text-sm font-medium hover:bg-orange-50 transition-all flex items-center justify-center gap-2"
                      >
                        Jetzt buchen <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Unser Prozess</h2>
            <p className="mt-4 text-gray-500">
              In vier Schritten zu Ihrem erfolgreichen Projekt.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: "01", title: "Analyse", text: "Wir lernen Ihr Unternehmen, Ihre Ziele und Ihre Zielgruppe kennen." },
              { step: "02", title: "Konzept", text: "Wir entwickeln eine maßgeschneiderte Strategie und ein kreatives Konzept." },
              { step: "03", title: "Umsetzung", text: "Unser Team setzt das Konzept in die Tat um — präzise und termingerecht." },
              { step: "04", title: "Optimierung", text: "Wir analysieren die Ergebnisse und optimieren kontinuierlich." },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className="text-center"
              >
                <div className="text-4xl font-bold text-orange-500/20 mb-4">{item.step}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
            Interesse geweckt?
          </h2>
          <p className="mt-4 text-gray-500 text-lg">
            Lassen Sie uns über Ihr Projekt sprechen — unverbindlich und kostenlos.
          </p>
          <Link
            to={createPageUrl("Contact")}
            className="mt-8 inline-flex items-center gap-2 px-7 py-3.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg shadow-orange-500/25 group"
          >
            Kostenlose Beratung anfragen
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      <BookingModal
        isOpen={!!selectedService}
        onClose={() => {
          setSelectedService(null);
          setPreselectedCategory(null);
        }}
        preselectedCategory={preselectedCategory}
      />
    </div>
  );
}