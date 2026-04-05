import React from "react";

export default function Impressum() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white py-16">
      <div className="max-w-3xl mx-auto px-6">
        <h1 className="text-4xl font-bold text-gray-900 mb-12">Impressum</h1>

        <div className="bg-white rounded-2xl border border-gray-200 p-8 space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Angaben gemäß § 5 TMG</h2>
            <div className="text-gray-700 space-y-2">
              <p><strong>Inhaltlich verantwortlich:</strong></p>
              <p>Emanuel Burghard</p>
              <p>KrautKonzept</p>
              <p>Meisenweg 2</p>
              <p>85591 Vaterstetten</p>
              <p>Bayern</p>
              <p className="mt-4"><strong>Unternehmensform:</strong> Einzelunternehmen</p>
              <p><strong>USt-ID:</strong> nicht vorhanden</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Kontaktinformationen</h2>
            <div className="text-gray-700 space-y-2">
              <p><strong>E-Mail:</strong> <a href="mailto:info@krautkonzept.de" className="text-orange-500 hover:text-orange-600">info@krautkonzept.de</a></p>
              <p><strong>Telefon:</strong> <a href="tel:+49173842058" className="text-orange-500 hover:text-orange-600">+49 173 8420586</a></p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Haftungsausschluss</h2>
            <p className="text-gray-700 text-sm leading-relaxed">
              Die Inhalte dieser Website wurden sorgfältig erstellt und überprüft. Wir sind jedoch nicht verantwortlich für die Verfügbarkeit, Richtigkeit und Vollständigkeit der bereitgestellten Informationen. Eine Haftung ist ausgeschlossen, soweit nicht grobe Fahrlässigkeit oder Vorsatz vorliegt.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Externe Links</h2>
            <p className="text-gray-700 text-sm leading-relaxed">
              Die Website enthält Links zu Websites Dritter. Für deren Inhalte sind wir nicht verantwortlich. Wir haben keine Kontrolle über die verlinkten Inhalte und übernehmen keine Haftung für fehlerhafte, unvollständige oder illegale Inhalte.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Urheberrecht</h2>
            <p className="text-gray-700 text-sm leading-relaxed">
              Alle auf dieser Website veröffentlichten Inhalte unterliegen dem Urheberrecht. Eine Vervielfältigung, Verbreitung oder Verarbeitung ist ohne ausdrückliche Genehmigung nicht gestattet.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}