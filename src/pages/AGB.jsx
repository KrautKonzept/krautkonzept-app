import React from "react";

export default function AGB() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white py-16">
      <div className="max-w-3xl mx-auto px-6">
        <h1 className="text-4xl font-bold text-gray-900 mb-12">Allgemeine Geschäftsbedingungen</h1>

        <div className="bg-white rounded-2xl border border-gray-200 p-8 space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Geltungsbereich und Leistungen</h2>
            <p className="text-gray-700 text-sm leading-relaxed">
              Diese Allgemeinen Geschäftsbedingungen regeln die Zusammenarbeit zwischen KrautKonzept und den Kunden. KrautKonzept erbringt Beratungsleistungen in den Bereichen Strategie, Marketing, digitale Infrastruktur und KI-Integration. Die Leistungen werden auf Basis eines Token-Systems abgerechnet.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Token-System</h2>
            <div className="text-gray-700 text-sm space-y-3">
              <p>Alle Beratungsleistungen werden in Tokens abgerechnet. Ein Token entspricht einem definierten Zeiteinsatz und wird zum aktuellen Stundenhonorar berechnet. Verfügbare Token-Pakete:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>1 Token: 25€</li>
                <li>4 Tokens: 100€</li>
                <li>8 Tokens: 200€</li>
                <li>16 Tokens: 400€</li>
                <li>32 Tokens: 800€</li>
              </ul>
              <p className="mt-3">Gekaufte Tokens verfallen nicht und können unbegrenzt lange verwendet werden.</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Leistungserbringung</h2>
            <p className="text-gray-700 text-sm leading-relaxed">
              KrautKonzept erbringt Beratungsleistungen nach bestem Wissen und Gewissen. Die Kunden erklären sich damit einverstanden, dass eine absolute Erfolgsgarantie nicht gegeben werden kann. Änderungen im Umfang erfordern eine schriftliche Vereinbarung.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Zahlungsbedingungen</h2>
            <p className="text-gray-700 text-sm leading-relaxed">
              Alle Token-Pakete werden als Prepayment eingezogen. Nach erfolgreicher Zahlung stehen die Tokens zur Verfügung. Rechnungen werden monatlich ausgestellt und müssen innerhalb von 14 Tagen bezahlt werden.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Stornierung und Rücktritt</h2>
            <p className="text-gray-700 text-sm leading-relaxed">
              Termine können bis 48 Stunden vorher kostenfrei storniert werden. Bei späteren Stornierungen oder Nichterscheinen werden 50% der Token-Kosten berechnet. Gekaufte Token-Pakete sind nicht rückerstattbar.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Datenschutz und Vertraulichkeit</h2>
            <p className="text-gray-700 text-sm leading-relaxed">
              KrautKonzept behandelt alle Kundendaten vertraulich und gemäß DSGVO. Eine Weitergabe an Dritte erfolgt nicht ohne ausdrückliche Genehmigung. Details finden Sie in unserer Datenschutzerklärung.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Haftung</h2>
            <p className="text-gray-700 text-sm leading-relaxed">
              KrautKonzept haftet für Schäden aus grober Fahrlässigkeit oder Vorsatz. Für indirekte Schäden oder entgangenen Gewinn wird keine Haftung übernommen. Die Haftung ist auf die gezahlten Honorare des laufenden Monats begrenzt.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Gerichtsstand und Anwendbares Recht</h2>
            <p className="text-gray-700 text-sm leading-relaxed">
              Diese AGB unterliegen dem Recht der Bundesrepublik Deutschland, insbesondere den Gesetzen des Freistaates Bayern. Gerichtsstand ist München.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Schlussbestimmungen</h2>
            <p className="text-gray-700 text-sm leading-relaxed">
              Sollte eine Bestimmung dieser AGB ungültig sein, wird die Gültigkeit der übrigen Bestimmungen nicht berührt. KrautKonzept behält sich das Recht vor, diese AGB jederzeit anzupassen. Änderungen werden per E-Mail mitgeteilt.
            </p>
          </section>

          <p className="text-gray-600 text-xs pt-6 border-t border-gray-200">
            Gültig ab: März 2026 | Version 1.0
          </p>
        </div>
      </div>
    </div>
  );
}