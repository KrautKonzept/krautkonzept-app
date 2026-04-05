import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { Shield, TrendingUp, Code, ArrowRight, MapPin, Calendar, Users } from "lucide-react";

const team = [
  { name: "Emanuel", role: "Gründer & CEO", initials: "EB", description: "Vorstand des Bayerischen Cannabis Social Club Verbands. Hintergrund in Pflege, Medizin und Unternehmensberatung." },
  { name: "Andrea", role: "Community & Marketing", initials: "AF", description: "Verantwortlich für Markenentwicklung, digitale Strategien und Community-Management." },
  { name: "Luc", role: "Backoffice & Assistenz", initials: "LW", description: "Buchhaltung, Finanzplanung und administrative Unterstützung für CSC-Verbände." },
  { name: "Dietrich", role: "COO — Communication & Tech", initials: "DS", description: "Verantwortlich für digitale Kommunikation, technische Infrastruktur und den Einsatz moderner Tools." },
  { name: "Vincent", role: "Entwicklung", initials: "VB", description: "Entwicklung digitaler Produkte und technischer Infrastruktur für KrautKonzept." },
];

const services = [
  {
    icon: TrendingUp,
    title: "Unternehmensberatung & Strategie",
    description: "Business-Pläne, Finanzierungskonzepte, Investorenpräsentationen und Wachstumsstrategien für Startups und Unternehmen.",
  },
  {
    icon: Users,
    title: "Netzwerk & Verbindungen",
    description: "Wir vernetzen Gründer, Partner und Investoren — und öffnen Türen, die ohne das richtige Netzwerk verschlossen bleiben.",
  },
  {
    icon: Code,
    title: "Digitale Entwicklung",
    description: "Website-Aufbau, digitale Infrastruktur, KI-gestützte Prozesse und maßgeschneiderte Tools für moderne Unternehmen.",
  },
  {
    icon: Shield,
    title: "Compliance & Branchenspezialisierung",
    description: "Rechtssichere Strukturen und spezialisiertes Know-how — u. a. für regulierte Branchen wie Cannabis, Medizin und Finanzen.",
  },
];

const stats = [
  { value: "2025", label: "Gegründet", icon: Calendar },
  { value: "10+", label: "Verbundene Projekte", icon: Users },
  { value: "Bayern", label: "Standort", icon: MapPin },
];

export default function About() {
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
              Über uns
            </span>
            <h1 className="mt-4 text-4xl md:text-5xl font-bold text-gray-900 tracking-tight leading-tight">
              Netzwerk &{" "}
              <span className="text-orange-500">Unternehmensberatung</span>
            </h1>
            <p className="mt-6 text-lg text-gray-500 leading-relaxed">
              Wir bringen Unternehmen voran. KrautKonzept begleitet Gründer, Start-ups und Unternehmen in Wachstumsphasen — von der ersten Idee bis zum skalierbaren Betrieb. Strategie, Marketing, Technologie und Netzwerk aus einer Hand.
            </p>
          </motion.div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-6 max-w-xl">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                className="text-center"
              >
                <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center mx-auto mb-3">
                  <stat.icon className="w-5 h-5 text-orange-500" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Unsere Leistungen</h2>
            <p className="mt-4 text-gray-500">
              Alles aus einer Hand — von der Gründung bis zum erfolgreichen Betrieb eures Unternehmens.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-2xl p-8 border border-gray-100 hover:shadow-lg transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center mb-6">
                  <service.icon className="w-6 h-6 text-orange-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{service.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{service.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Beratungsmodell */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="text-sm font-semibold text-orange-500 uppercase tracking-wider">Transparenz</span>
              <h2 className="mt-4 text-3xl font-bold text-gray-900 tracking-tight">
                Unser Beratungsmodell
              </h2>
              <p className="mt-6 text-gray-500 leading-relaxed">
                Wir arbeiten token-basiert: <strong className="text-gray-900">1 Token = 25 Euro.</strong> Transparent, flexibel und leistungsgerecht. Jeder CSC kennt zu jedem Zeitpunkt seinen Kontostand — keine versteckten Kosten, kein Kleingedrucktes.
              </p>
              <div className="mt-8 space-y-4">
                {["CSC-Gründung & Genehmigung", "Compliance & Recht", "Strategie & Finanzierung", "Digitale Infrastruktur"].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-orange-500 flex-shrink-0" />
                    <span className="text-gray-700 text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-3xl p-10"
            >
              <div className="text-center">
                <div className="text-6xl font-black text-orange-500 mb-2">25€</div>
                <div className="text-lg font-semibold text-gray-900 mb-1">pro Token</div>
                <div className="text-sm text-gray-500 mb-8">Einfach. Transparent. Fair.</div>
                <div className="space-y-3 text-left">
                  {[
                    { label: "Beratungsgespräch", tokens: "2 Token" },
                    { label: "Dokumente & Vorlagen", tokens: "5–10 Token" },
                    { label: "Gründungspaket komplett", tokens: "ab 40 Token" },
                    { label: "Laufende Betreuung", tokens: "monatliches Kontingent" },
                  ].map((item) => (
                    <div key={item.label} className="flex justify-between items-center bg-white rounded-xl px-4 py-3">
                      <span className="text-sm text-gray-700">{item.label}</span>
                      <span className="text-sm font-semibold text-orange-600">{item.tokens}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Unser Team</h2>
            <p className="mt-4 text-gray-500">
              Experten für jeden Bereich — von Recht und Compliance bis Technik und Marketing.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {team.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-300 group"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-100 to-orange-200 group-hover:from-orange-200 group-hover:to-orange-300 flex items-center justify-center transition-all duration-300 flex-shrink-0">
                    <span className="text-lg font-bold text-orange-600">{member.initials}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{member.name}</h3>
                    <p className="text-sm text-orange-500 font-medium">{member.role}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed">{member.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
            Bereit für echtes Wachstum?
          </h2>
          <p className="mt-4 text-gray-500 text-lg">
            Wir begleiten Startups, Gründer und Unternehmen in Wachstumsphasen — von der ersten Idee bis zum skalierbaren Betrieb.
          </p>
          <Link
            to={createPageUrl("Contact")}
            className="mt-8 inline-flex items-center gap-2 px-7 py-3.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg shadow-orange-500/25 group"
          >
            Beratung anfragen
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>
    </div>
  );
}