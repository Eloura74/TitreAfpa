import { motion } from "framer-motion";
import Navbar from "../components/layout/navbar";
import Footer from "../components/layout/Footer";

export default function MentionsLegales() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      <main className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl sm:text-5xl font-bold mb-8 bg-gradient-to-r from-[#d6c487] via-[#ffe992] to-[#c9b36f] bg-clip-text text-transparent">
              Mentions Légales
            </h1>

            <div className="space-y-8 text-gray-300">
              <section>
                <h2 className="text-2xl font-semibold text-[#ffe992] mb-4">
                  1. Informations légales
                </h2>
                <p className="mb-2">
                  <strong>Nom de l'entreprise :</strong> Photographe Pro
                </p>
                <p className="mb-2">
                  <strong>Forme juridique :</strong> [À compléter]
                </p>
                <p className="mb-2">
                  <strong>Adresse :</strong> [À compléter]
                </p>
                <p className="mb-2">
                  <strong>Email :</strong> fabien.licata@gmail.com
                </p>
                <p className="mb-2">
                  <strong>Téléphone :</strong> [À compléter]
                </p>
                <p className="mb-2">
                  <strong>SIRET :</strong> [À compléter]
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-[#ffe992] mb-4">
                  2. Directeur de la publication
                </h2>
                <p>
                  Le directeur de la publication du site est : [Nom du
                  directeur]
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-[#ffe992] mb-4">
                  3. Hébergement
                </h2>
                <p className="mb-2">
                  <strong>Hébergeur :</strong> Vercel Inc.
                </p>
                <p className="mb-2">
                  <strong>Adresse :</strong> 340 S Lemon Ave #4133, Walnut, CA
                  91789, USA
                </p>
                <p>
                  <strong>Site web :</strong>{" "}
                  <a
                    href="https://vercel.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#ffe992] hover:underline"
                  >
                    vercel.com
                  </a>
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-[#ffe992] mb-4">
                  4. Propriété intellectuelle
                </h2>
                <p>
                  L'ensemble du contenu de ce site (textes, images, vidéos,
                  logos) est protégé par le droit d'auteur. Toute reproduction,
                  même partielle, est interdite sans autorisation préalable.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-[#ffe992] mb-4">
                  5. Données personnelles
                </h2>
                <p className="mb-4">
                  Conformément au Règlement Général sur la Protection des
                  Données (RGPD), vous disposez d'un droit d'accès, de
                  rectification et de suppression de vos données personnelles.
                </p>
                <p>
                  Pour exercer ces droits, contactez-nous à :
                  fabien.licata@gmail.com
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-[#ffe992] mb-4">
                  6. Cookies
                </h2>
                <p>
                  Ce site utilise des cookies pour améliorer l'expérience
                  utilisateur et analyser le trafic. En continuant à naviguer
                  sur ce site, vous acceptez l'utilisation de cookies.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-[#ffe992] mb-4">
                  7. Crédits
                </h2>
                <p className="mb-2">
                  <strong>Conception et développement :</strong> [Nom du
                  développeur]
                </p>
                <p>
                  <strong>Photographies :</strong> © Photographe Pro - Tous
                  droits réservés
                </p>
              </section>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
