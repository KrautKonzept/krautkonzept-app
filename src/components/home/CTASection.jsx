import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function CTASection() {
  return (
    <section className="py-16 lg:py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-12">

        {/* Über uns Teaser */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-3xl border border-gray-100 p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 shadow-sm"
        >
          <div className="w-20 h-20 rounded-2xl bg-white flex items-center justify-center flex-shrink-0">
            <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69aeab830dd5573c69dfd8e8/a4c9d9b3e_logo.png" alt="KrautKonzept Logo" style={{height: "80px", width: "80px", objectFit: "contain"}} />
          </div>
          <div className="flex-1 text-center md:text-left">
            <div className="text-sm font-semibold text-orange-500 uppercase tracking-wider mb-2">Über uns</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Warum KrautKonzept?</h3>
            <p className="text-gray-500 leading-relaxed">
              Wir treiben die grüne Wirtschaft voran. KrautKonzept begleitet Cannabis-Unternehmen, Start-ups und Gründer beim Aufbau — von der ersten Idee bis zum wachsenden Betrieb. Strategie, Marketing, Technologie und Netzwerk aus einer Hand.
            </p>
            <Link
              to={createPageUrl("About")}
              className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition-all text-sm"
            >
              Über uns
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>

        {/* CTA Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-8 py-16 md:px-16 md:py-20"
        >
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-orange-500/10 blur-3xl" />

          <div className="relative text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
              Bereit für echtes Wachstum?
            </h2>
            <p className="mt-6 text-gray-300 text-lg leading-relaxed">
              Kein Standardpaket. Kein leeres Versprechen. Wir arbeiten mit dir — nicht für dich.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link
                to={createPageUrl("Contact")}
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg shadow-orange-500/25 group"
              >
                Gespräch vereinbaren
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <p className="mt-8 text-xs text-gray-500">
              <span className="text-gray-400">1 Token = 25 Euro = ca. 40 Min. Beratung</span>
            </p>
          </div>
        </motion.div>

      </div>
    </section>
  );
}