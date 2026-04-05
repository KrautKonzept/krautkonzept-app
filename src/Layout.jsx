import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Menu, X, LogIn, LogOut, Shield } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";

export default function Layout({ children, currentPageName }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const getDashboardUrl = () => {
    if (!user) return null;
    if (user.role === "admin" || user.role === "employee") return createPageUrl("EmployeeDashboard");
    return createPageUrl("CustomerDashboard");
  };

  const navLinks = [
    { label: "Startseite", page: "Home" },
    { label: "Über uns", page: "About" },
    { label: "Leistungen", page: "Services" },

  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800">
      <style>{`
        :root {
          --orange-500: #F97316;
          --orange-600: #EA580C;
          --orange-400: #FB923C;
          --gray-900: #111827;
          --gray-800: #1F2937;
          --gray-700: #374151;
        }
      `}</style>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to={createPageUrl("Home")} className="flex items-center gap-2 group">
              <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69aeab830dd5573c69dfd8e8/a4c9d9b3e_logo.png" alt="KrautKonzept Logo" style={{height: "48px"}} />
              <span className="font-bold text-base md:text-lg inline">
                <span style={{color: "#1a1a1a"}}>Kraut</span><span style={{color: "#f97316"}}>Konzept</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.page}
                  to={createPageUrl(link.page)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    currentPageName === link.page
                      ? "text-orange-600 bg-orange-50"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <button
                onClick={() => {
                  if (window.location.pathname === '/') {
                    window.dispatchEvent(new CustomEvent('openBookingModal'));
                  } else {
                    window.location.href = '/?booking=1';
                  }
                }}
                className="ml-4 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-semibold rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all shadow-md shadow-orange-500/20 hover:shadow-orange-500/40"
              >
                Jetzt anfragen
              </button>

              {user ? (
                <div className="flex items-center gap-2 ml-2">
                  {(user.role === "admin" || user.role === "employee") && (
                    <Link
                      to={createPageUrl("EmployeeDashboard")}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        currentPageName === "EmployeeDashboard"
                          ? "text-orange-600 bg-orange-50"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                      }`}
                    >
                      <Shield className="w-4 h-4" />
                      Mitarbeiter
                    </Link>
                  )}
                  {user.role === "admin" && (
                    <Link
                      to={createPageUrl("Admin")}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                        currentPageName === "Admin"
                          ? "bg-orange-500 text-white"
                          : "text-orange-600 border border-orange-200 hover:bg-orange-50"
                      }`}
                    >
                      Admin
                    </Link>
                  )}
                  {user.role === "user" && (
                    <Link
                      to={createPageUrl("CustomerDashboard")}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        currentPageName === "CustomerDashboard"
                          ? "text-orange-600 bg-orange-50"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                      }`}
                    >
                      <LogIn className="w-4 h-4" />
                      Mein Bereich
                    </Link>
                  )}
                  <button
                    onClick={() => base44.auth.logout()}
                    className="p-2 rounded-lg text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-all"
                    title="Abmelden"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="ml-2 flex flex-col sm:flex-row items-center gap-2">
                  <button
                    onClick={() => base44.auth.redirectToLogin(createPageUrl("CustomerDashboard"))}
                    className="flex items-center gap-1.5 px-6 py-3 rounded-xl text-base font-semibold text-white bg-gray-800 hover:bg-gray-900 border border-gray-300 transition-all min-h-[44px]"
                  >
                    <LogIn className="w-4 h-4" />
                    Kundenbereich
                  </button>
                  <button
                    onClick={() => base44.auth.redirectToLogin(createPageUrl("EmployeeDashboard"))}
                    className="flex items-center gap-1.5 px-6 py-3 rounded-xl text-base font-semibold text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-md shadow-orange-500/20 transition-all min-h-[44px]"
                  >
                    <Shield className="w-4 h-4" />
                    Mitarbeiterbereich
                  </button>
                </div>
              )}
            </nav>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden overflow-hidden border-t border-gray-100 bg-white"
            >
              <div className="px-6 py-4 space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.page}
                    to={createPageUrl(link.page)}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      currentPageName === link.page
                        ? "text-orange-600 bg-orange-50"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
                <Link
                  to={createPageUrl("Contact")}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block mt-3 px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-semibold rounded-xl text-center"
                >
                  Jetzt anfragen
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69aeab830dd5573c69dfd8e8/a4c9d9b3e_logo.png" alt="KrautKonzept Logo" style={{height: "40px", objectFit: "contain"}} />
              </div>
              <p className="text-sm leading-relaxed max-w-md">
                organisch. menschlich. intelligent. — Beratung, Marketing, Technologie & KI aus Bayern. © KrautKonzept
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Navigation</h4>
              <ul className="space-y-3">
                {navLinks.map((link) => (
                  <li key={link.page}>
                    <Link
                      to={createPageUrl(link.page)}
                      className="text-sm hover:text-orange-400 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Kontakt</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="mailto:info@krautkonzept.de" className="hover:text-orange-400 transition-colors">info@krautkonzept.de</a></li>
                <li><a href="tel:+49173842058" className="hover:text-orange-400 transition-colors">+49 173 8420586</a></li>
                <li>Meisenweg 2<br />85591 Vaterstetten</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8">
            <p className="text-xs mb-6">© 2026 KrautKonzept. Alle Rechte vorbehalten.</p>
            <div className="flex flex-wrap gap-4 text-sm">
              <Link to="/Datenschutz" className="hover:text-orange-400 transition-colors font-medium">Datenschutz</Link>
              <Link to={createPageUrl("Impressum")} className="hover:text-orange-400 transition-colors font-medium">Impressum</Link>
              <Link to={createPageUrl("AGB")} className="hover:text-orange-400 transition-colors font-medium">AGB</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}