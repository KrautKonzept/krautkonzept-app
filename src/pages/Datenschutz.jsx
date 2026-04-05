import React from "react";
import { motion } from "framer-motion";

const Section = ({ title, children }) => (
  <div className="mb-10">
    <h2 className="text-xl font-bold text-gray-900 mb-3">{title}</h2>
    <div className="text-gray-600 leading-relaxed space-y-3">{children}</div>
  </div>
);

export default function Datenschutz() {
  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-3xl mx-auto px-6 lg:px-8 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="text-sm font-semibold text-orange-500 uppercase tracking-wider">Rechtliches</span>
          <h1 className="mt-3 text-4xl font-bold text-gray-900 mb-2">Datenschutzerklärung</h1>
          <p className="text-gray-500 mb-12">Stand: März 2026</p>

          <Section title="1. Verantwortlicher">
            <p>Verantwortlicher im Sinne der Datenschutz-Grundverordnung (DSGVO) ist:</p>
            <p>
              <strong className="text-gray-800">Emanuel Burghard</strong><br />
              KrautKonzept<br />
              Meisenweg 2<br />
              85591 Vaterstetten<br />
              Deutschland<br /><br />
              E-Mail: <a href="mailto:info@krautkonzept.de" className="text-orange-500 hover:underline">info@krautkonzept.de</a><br />
              Telefon: +49 173 8420586
            </p>
          </Section>

          <Section title="2. Datenerhebung auf dieser Website">
            <p>
              Beim Besuch unserer Website werden automatisch Informationen an den Server übermittelt, auf dem die Website gespeichert ist. Diese Informationen werden temporär in sogenannten Server-Log-Files gespeichert:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>IP-Adresse des anfragenden Rechners</li>
              <li>Datum und Uhrzeit des Zugriffs</li>
              <li>Name und URL der abgerufenen Datei</li>
              <li>Browser-Typ und verwendetes Betriebssystem</li>
              <li>Name des Internet-Service-Providers</li>
            </ul>
            <p>
              Die Verarbeitung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse). Diese Daten werden nicht mit anderen Datenquellen zusammengeführt und nach spätestens 7 Tagen gelöscht.
            </p>
          </Section>

          <Section title="3. Kontaktformular & E-Mail-Kontakt">
            <p>
              Wenn Sie uns über das Kontaktformular oder per E-Mail kontaktieren, werden die von Ihnen angegebenen Daten (Name, E-Mail-Adresse, Nachricht) zur Bearbeitung Ihrer Anfrage gespeichert. Die Verarbeitung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO (Vertragsanbahnung) bzw. Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse).
            </p>
            <p>
              Die Daten werden nicht an Dritte weitergegeben und nach vollständiger Bearbeitung Ihrer Anfrage gelöscht, sofern keine gesetzlichen Aufbewahrungspflichten bestehen.
            </p>
          </Section>

          <Section title="4. Cookies">
            <p>
              Unsere Website verwendet technisch notwendige Cookies, die für den Betrieb der Website erforderlich sind. Diese Cookies speichern keine personenbezogenen Daten und dienen ausschließlich der Funktionsfähigkeit der Website.
            </p>
            <p>
              Sofern wir Analyse- oder Marketing-Cookies einsetzen, werden Sie zuvor um Ihre ausdrückliche Einwilligung gebeten. Die Rechtsgrundlage für technisch notwendige Cookies ist Art. 6 Abs. 1 lit. f DSGVO, für optionale Cookies Art. 6 Abs. 1 lit. a DSGVO.
            </p>
          </Section>

          <Section title="5. Hosting">
            <p>
              Diese Website wird bei einem externen Dienstleister gehostet (Hoster). Personenbezogene Daten, die auf dieser Website erfasst werden, werden auf den Servern des Hosters gespeichert. Hierbei kann es sich um IP-Adressen, Kontaktanfragen, Meta- und Kommunikationsdaten, Vertragsdaten, Kontaktdaten, Namen, Websitezugriffe und sonstige Daten handeln.
            </p>
            <p>
              Der Einsatz des Hosters erfolgt zum Zwecke der Vertragserfüllung gegenüber unseren potenziellen und bestehenden Kunden (Art. 6 Abs. 1 lit. b DSGVO) und im Interesse einer sicheren, schnellen und effizienten Bereitstellung unseres Online-Angebots (Art. 6 Abs. 1 lit. f DSGVO).
            </p>
          </Section>

          <Section title="6. Ihre Rechte als betroffene Person">
            <p>Sie haben gegenüber uns folgende Rechte hinsichtlich Ihrer personenbezogenen Daten:</p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li><strong className="text-gray-800">Recht auf Auskunft</strong> (Art. 15 DSGVO)</li>
              <li><strong className="text-gray-800">Recht auf Berichtigung</strong> (Art. 16 DSGVO)</li>
              <li><strong className="text-gray-800">Recht auf Löschung</strong> (Art. 17 DSGVO)</li>
              <li><strong className="text-gray-800">Recht auf Einschränkung der Verarbeitung</strong> (Art. 18 DSGVO)</li>
              <li><strong className="text-gray-800">Recht auf Datenübertragbarkeit</strong> (Art. 20 DSGVO)</li>
              <li><strong className="text-gray-800">Widerspruchsrecht</strong> (Art. 21 DSGVO)</li>
            </ul>
            <p>
              Zur Ausübung Ihrer Rechte wenden Sie sich bitte an:{" "}
              <a href="mailto:info@krautkonzept.de" className="text-orange-500 hover:underline">info@krautkonzept.de</a>
            </p>
            <p>
              Zudem steht Ihnen ein Beschwerderecht bei der zuständigen Datenschutz-Aufsichtsbehörde zu. Die zuständige Behörde für Bayern ist das Bayerische Landesamt für Datenschutzaufsicht (BayLDA), Promenade 18, 91522 Ansbach.
            </p>
          </Section>

          <Section title="7. Datensicherheit">
            <p>
              Diese Website nutzt aus Sicherheitsgründen und zum Schutz der Übertragung vertraulicher Inhalte eine SSL- bzw. TLS-Verschlüsselung. Eine verschlüsselte Verbindung erkennen Sie daran, dass die Adresszeile des Browsers von „http://" auf „https://" wechselt.
            </p>
          </Section>

          <Section title="8. Aktualität und Änderung dieser Datenschutzerklärung">
            <p>
              Diese Datenschutzerklärung ist aktuell gültig und hat den Stand März 2026. Wir behalten uns vor, diese Datenschutzerklärung anzupassen, damit sie stets den aktuellen rechtlichen Anforderungen entspricht oder um Änderungen unserer Leistungen umzusetzen.
            </p>
          </Section>
        </motion.div>
      </div>
    </div>
  );
}