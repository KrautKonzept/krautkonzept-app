import React, { useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Phone, MapPin, Send, CheckCircle2, Clock } from "lucide-react";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const contactInfo = [
    { icon: Mail, label: "E-Mail", value: "info@krautkonzept.de" },
    { icon: Phone, label: "Telefon", value: "+49 173 8420586" },
    { icon: MapPin, label: "Adresse", value: "Meisenweg 2, 85591 Vaterstetten" },
    { icon: Clock, label: "Bürozeiten", value: "Mo–Fr 9:00 – 18:00 Uhr" },
  ];

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
              Kontakt
            </span>
            <h1 className="mt-4 text-4xl md:text-5xl font-bold text-gray-900 tracking-tight leading-tight">
              Lassen Sie uns{" "}
              <span className="text-orange-500">sprechen</span>
            </h1>
            <p className="mt-6 text-lg text-gray-500 leading-relaxed">
              Haben Sie ein Projekt im Kopf oder möchten Sie einfach mehr über uns erfahren?
              Wir freuen uns auf Ihre Nachricht.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="pb-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-12 lg:gap-16">
            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="lg:col-span-2"
            >
              <div className="space-y-8">
                {contactInfo.map((item) => (
                  <div key={item.label} className="flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-5 h-5 text-orange-500" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-400 mb-1">{item.label}</div>
                      <div className="text-gray-900 font-medium">{item.value}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Map placeholder */}
              <div className="mt-12 rounded-2xl bg-gray-100 h-64 flex items-center justify-center overflow-hidden">
                <div className="text-center">
                  <MapPin className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">Vaterstetten, Bayern</p>
                </div>
              </div>
            </motion.div>

            {/* Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-3"
            >
              {submitted ? (
                <div className="bg-gray-50 rounded-2xl p-12 text-center h-full flex flex-col items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    Nachricht gesendet!
                  </h3>
                  <p className="text-gray-500 max-w-sm">
                    Vielen Dank für Ihre Anfrage. Wir melden uns innerhalb von 24 Stunden bei Ihnen.
                  </p>
                  <Button
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
                    }}
                    variant="outline"
                    className="mt-8"
                  >
                    Neue Nachricht senden
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="bg-gray-50 rounded-2xl p-8 md:p-10 space-y-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Nachricht senden</h3>

                  <div className="grid md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        placeholder="Ihr Name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        className="bg-white border-gray-200 focus:border-orange-400 focus:ring-orange-400"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">E-Mail *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="ihre@email.de"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        className="bg-white border-gray-200 focus:border-orange-400 focus:ring-orange-400"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefon</Label>
                      <Input
                        id="phone"
                        placeholder="+49 ..."
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="bg-white border-gray-200 focus:border-orange-400 focus:ring-orange-400"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject">Betreff *</Label>
                      <Select
                        value={formData.subject}
                        onValueChange={(value) => setFormData({ ...formData, subject: value })}
                        required
                      >
                        <SelectTrigger className="bg-white border-gray-200 focus:border-orange-400 focus:ring-orange-400">
                          <SelectValue placeholder="Bitte wählen" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="branding">Branding & Design</SelectItem>
                          <SelectItem value="web">Webentwicklung</SelectItem>
                          <SelectItem value="app">App-Entwicklung</SelectItem>
                          <SelectItem value="marketing">Online Marketing</SelectItem>
                          <SelectItem value="seo">SEO & SEA</SelectItem>
                          <SelectItem value="other">Sonstiges</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Nachricht *</Label>
                    <Textarea
                      id="message"
                      placeholder="Erzählen Sie uns von Ihrem Projekt..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required
                      rows={6}
                      className="bg-white border-gray-200 focus:border-orange-400 focus:ring-orange-400 resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-xl shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 transition-all"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Nachricht senden
                  </Button>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}