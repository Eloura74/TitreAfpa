import { useEffect, useState } from "react";

export default function Footer() {
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [copied, setCopied] = useState(false); // État pour le feedback de copie

  const email = "fabien.licata@gmail.com"; // Variable pour éviter les erreurs de frappe

  useEffect(() => {
    if (!isContactOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsContactOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isContactOpen]);

  // Réinitialiser l'état "copié" quand on ferme la modale
  useEffect(() => {
    if (!isContactOpen) setCopied(false);
  }, [isContactOpen]);

  const openContact = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsContactOpen(true);
  };

  const closeContact = () => setIsContactOpen(false);

  // Fonction pour copier l'email dans le presse-papier
  const handleCopy = () => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    // Remettre le bouton à son état normal après 2 secondes
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      {/* FOOTER */}
      <footer className="absolute bottom-4 md:bottom-10 w-full px-6 md:px-16 z-30 flex flex-col md:flex-row justify-between items-center gap-4 md:gap-0 opacity-50 hover:opacity-100 transition-opacity duration-1000">
        <p className="text-[8px] md:text-[9px] uppercase tracking-[0.3em] md:tracking-[0.5em] font-extralight">
          © 2026 Fabien Licata
        </p>

        <div className="flex gap-8 md:gap-12 text-[10px] md:text-[12px] uppercase tracking-[0.3em] md:tracking-[0.5em] font-extralight">
          <a
            href="https://www.instagram.com/fabien.licata.photographiste/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-yellow-400 transition-colors border-b border-transparent hover:border-yellow-400"
          >
            Instagram
          </a>

          <span className="border-b border-transparent select-none">|</span>

          <a
            href="https://www.facebook.com/FabienLicata"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-yellow-400 transition-colors border-b border-transparent hover:border-yellow-400"
          >
            Facebook
          </a>

          <span className="border-b border-transparent select-none">|</span>

          {/* CONTACT (ouvre la modale) */}
          <a
            href="#"
            onClick={openContact}
            className="hover:text-yellow-400 transition-colors border-b border-transparent hover:border-yellow-400"
          >
            Contact
          </a>
        </div>
      </footer>

      {/* MODALE CONTACT */}
      {isContactOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center px-6">
          {/* Overlay cliquable */}
          <button
            type="button"
            aria-label="Fermer la fenêtre de contact"
            onClick={closeContact}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-default"
          />

          {/* Contenu modale */}
          <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-gradient-to-b from-white/10 to-black/70 backdrop-blur-xl text-white shadow-2xl p-6 md:p-8">
            {/* Glow discret */}
            <div className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-r from-yellow-400/10 via-transparent to-yellow-400/10" />

            <div className="relative">
              <div className="flex items-start justify-between gap-4">
                <div className="flex flex-col">
                  <h2 className="text-base md:text-lg uppercase tracking-[0.35em] font-extralight">
                    Contact
                  </h2>
                  <div className="mt-2 h-px w-24 bg-gradient-to-r from-yellow-400/40 to-transparent" />
                </div>

                <button
                  type="button"
                  onClick={closeContact}
                  className="rounded-lg px-3 py-2 text-[10px] md:text-xs uppercase tracking-[0.25em] font-extralight border border-white/10 bg-white/5 hover:bg-white/10 hover:text-yellow-400 transition-colors"
                >
                  Fermer
                </button>
              </div>

              {/* Blocs infos */}
              <div className="mt-6 space-y-3 text-sm md:text-base font-extralight">
                {/* Nom */}
                <div className="rounded-xl border border-white/10 bg-black/40 px-4 py-3">
                  <span className="block text-white/60 text-[10px] uppercase tracking-[0.35em]">
                    Nom / Prénom
                  </span>
                  <span className="mt-1 block text-yellow-100">
                    Fabien Licata
                  </span>
                </div>

                {/* Téléphone */}
                <div className="rounded-xl border border-white/10 bg-black/40 px-4 py-3">
                  <span className="block text-white/60 text-[10px] uppercase tracking-[0.35em]">
                    Téléphone
                  </span>
                  <a
                    href="tel:+33782080607"
                    className="mt-1 inline-flex items-center gap-2 rounded-lg px-2 py-1 -ml-2 hover:bg-white/5 hover:text-yellow-400 transition-colors"
                  >
                    +33 7 82 08 06 07
                  </a>
                </div>

                {/* Email */}
                <div className="rounded-xl border border-white/10 bg-black/40 px-4 py-3">
                  <span className="block text-white/60 text-[10px] uppercase tracking-[0.35em]">
                    Email
                  </span>
                  <a
                    href={`mailto:${email}`}
                    className="mt-1 inline-flex items-center gap-2 rounded-lg px-2 py-1 -ml-2 hover:bg-white/5 hover:text-yellow-400 transition-colors break-all"
                  >
                    {email}
                  </a>
                </div>
              </div>

              {/* Actions - DOUBLE BOUTONS POUR UX OPTIMALE */}
              <div className="mt-8 grid grid-cols-2 gap-3">
                {/* Bouton Copier */}
                <button
                  type="button"
                  onClick={handleCopy}
                  className={`inline-flex items-center justify-center rounded-xl px-4 py-3 text-xs uppercase tracking-[0.15em] font-extralight border transition-all duration-300
                    ${
                      copied
                        ? "bg-green-500/20 border-green-500/50 text-green-200"
                        : "border-white/20 bg-white/5 hover:bg-white/10 text-white"
                    }`}
                >
                  {copied ? "Email Copié !" : "Copier l'email"}
                </button>

                {/* Bouton Mailto */}
                <a
                  href={`mailto:${email}?subject=Contact%20site`}
                  className="inline-flex items-center justify-center rounded-xl px-4 py-3 text-xs uppercase tracking-[0.15em] font-extralight
                        border border-yellow-400/30 bg-yellow-400/10 hover:bg-yellow-400/20 hover:border-yellow-400/60 hover:text-yellow-200
                        transition-colors text-center"
                >
                  Ouvrir Mail
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
