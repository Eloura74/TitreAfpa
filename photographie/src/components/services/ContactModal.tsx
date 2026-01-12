import React, { useState, useEffect } from "react";
import { Service } from "../../types/service";

interface ContactModalProps {
  service: Service;
  onClose: () => void;
}

export const ContactModal: React.FC<ContactModalProps> = ({
  service,
  onClose,
}) => {
  const [formData, setFormData] = useState({
    nom: "",
    email: "",
    message: `Bonjour, je suis intéressé par votre service "${service.titre}".`,
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulation d'envoi d'email (mailto pour l'instant pour faire simple et robuste sans backend mailer complexe)
    // Dans une V2, on pourrait appeler une route API /api/contact
    setTimeout(() => {
      window.location.href = `mailto:contact@exemple.com?subject=Demande pour ${
        service.titre
      }&body=${encodeURIComponent(
        `Nom: ${formData.nom}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`
      )}`;
      setLoading(false);
      setSuccess(true);
      setTimeout(onClose, 2000);
    }, 1000);
  };

  // Gestion de la touche Escape pour fermer le modal (accessibilité)
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center bg-black/60 z-50 backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <div 
        className="bg-[#181824] border border-[#ffe992]/20 rounded-lg shadow-2xl p-6 w-full max-w-md relative"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="contact-modal-title"
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-white transition"
          aria-label="Fermer la fenêtre de contact"
        >
          ✕
        </button>

        <h3 id="contact-modal-title" className="text-xl font-bold mb-4 text-[#ffe992] text-center">
          Contacter pour "{service.titre}"
        </h3>

        {success ? (
          <div className="text-center py-8">
            <p className="text-green-400 text-lg mb-2">
              Message prêt à l'envoi !
            </p>
            <p className="text-gray-400 text-sm">
              Votre client de messagerie va s'ouvrir.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Votre Nom
              </label>
              <input
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                className="w-full bg-[#232336] border border-white/10 rounded px-3 py-2 text-white focus:border-[#ffe992]/50 outline-none transition"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Votre Email
              </label>
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-[#232336] border border-white/10 rounded px-3 py-2 text-white focus:border-[#ffe992]/50 outline-none transition"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Message
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                className="w-full bg-[#232336] border border-white/10 rounded px-3 py-2 text-white h-32 resize-none focus:border-[#ffe992]/50 outline-none transition"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#ffe992] text-black font-bold py-2 rounded hover:bg-[#d6c487] transition disabled:opacity-50"
            >
              {loading ? "Préparation..." : "Envoyer la demande"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
