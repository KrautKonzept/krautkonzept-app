import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Leaf, Target, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

function getQuest(user) {
  const email = (user?.email || "").toLowerCase();
  const name = (user?.full_name || "").toLowerCase();

  if (email.includes("emanuel") || name.includes("emanuel")) {
    return "Heute 1 Sache delegieren die du sonst selbst machst. Du bist CEO.";
  }
  if (email.includes("andrea")) {
    return "Einen Content-Post fertigstellen. Terra Mota Seeds Rebrand nicht vergessen.";
  }
  if (email.includes("dietrich")) {
    return "H4L EU-Checkout einen Schritt weiterbringen.";
  }
  return "Was ist heute deine wichtigste Aufgabe?";
}

function getFirstName(user) {
  if (user?.full_name) return user.full_name.split(" ")[0];
  const email = user?.email || "";
  return email.split("@")[0].split(".")[0];
}

function formatDate() {
  return new Date().toLocaleDateString("de-DE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function WelcomeModal({ user, onClose }) {
  const quest = getQuest(user);
  const firstName = getFirstName(user);
  const dateStr = formatDate();

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        >
          {/* Green header */}
          <div className="bg-gradient-to-br from-green-600 to-green-700 px-8 pt-8 pb-10 text-white relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/20 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-semibold text-green-100">KrautKonzept</span>
            </div>

            <p className="text-green-200 text-sm mb-1">{dateStr}</p>
            <h2 className="text-2xl font-bold">
              Willkommen zurück, {firstName}!
            </h2>
          </div>

          {/* Quest section — overlapping */}
          <div className="px-8 -mt-5">
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-orange-100 flex items-center justify-center">
                  <Target className="w-4 h-4 text-orange-500" />
                </div>
                <span className="text-xs font-semibold text-orange-500 uppercase tracking-wider">Heutige Quest</span>
              </div>
              <p className="text-gray-800 font-medium leading-relaxed">
                {quest}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 py-6 flex items-center gap-3">
            <Button
              onClick={onClose}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-xl h-11"
            >
              <Star className="w-4 h-4 mr-2" />
              Los geht's!
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}