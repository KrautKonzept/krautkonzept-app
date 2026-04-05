import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { TrendingUp, Users, Shield, Zap, Network, CheckCircle, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  { num: 1, title: "Marketing & Community", icon: Users, desc: "Markenaufbau, Content-Strategie, Community Management" },
  { num: 2, title: "Strategie & Finanzierung", icon: TrendingUp, desc: "Businesspläne, Kapitalstruktur, Wachstum" },
  { num: 3, title: "Digitale Infrastruktur", icon: Shield, desc: "Tech-Stack, Automation, Security" },
  { num: 4, title: "KI-Integration", icon: Zap, desc: "Prozesse intelligent automatisieren" },
  { num: 5, title: "Netzwerk & Partner", icon: Network, desc: "Investoren, Experten, Ökosystem" },
  { num: 6, title: "CSC-Compliance", icon: CheckCircle, desc: "Rechtssicherheit, Standards" },
];

export default function FeaturesSection() {
  return (
    <section className="py-20 lg:py-28 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
            6 Säulen deines Erfolgs
          </h2>
          <p className="mt-4 text-gray-600 text-lg leading-relaxed">
            Von der Strategie über Technologie bis zur Compliance — alles aus einer Hand.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
            >
              <div className="bg-white rounded-2xl border border-gray-200 p-7 h-full shadow-sm hover:shadow-lg transition-all group">
                <div className="flex items-start justify-between mb-4">
                  <feature.icon className="w-6 h-6 text-orange-500" />
                  <span className="text-sm font-bold text-gray-400">{feature.num}</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}