import { useState, useEffect } from "react";
import { API_URL } from "../config/api";
import { Save, Loader2, FileText } from "lucide-react";
import { motion } from "framer-motion";

export default function GestionGraphismeDescription() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    titre: "",
    description: "",
  });

  useEffect(() => {
    fetchDescription();
  }, []);

  const fetchDescription = async () => {
    try {
      const response = await fetch(`${API_URL}/api/graphisme-description`, {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setFormData({
          titre: data.titre,
          description: data.description,
        });
      }
    } catch (error) {
      console.error("Erreur lors du chargement:", error);
      setMessage({
        type: "error",
        text: "Erreur lors du chargement de la description",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.titre.trim() || !formData.description.trim()) {
      setMessage({
        type: "error",
        text: "Le titre et la description sont requis",
      });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch(`${API_URL}/api/graphisme-description`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setMessage({
          type: "success",
          text: "Description mise à jour avec succès",
        });
        setTimeout(() => setMessage(null), 3000);
      } else {
        throw new Error("Erreur lors de la mise à jour");
      }
    } catch (error) {
      console.error("Erreur:", error);
      setMessage({
        type: "error",
        text: "Erreur lors de la mise à jour",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="w-12 h-12 text-[#ffe992] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <FileText className="w-6 h-6 text-[#ffe992]" />
        <h2 className="text-2xl font-bold text-[#ffe992]">
          Texte de la page "Découvrir le Graphisme"
        </h2>
      </div>

      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-lg ${
            message.type === "success"
              ? "bg-green-600/20 text-green-400 border border-green-600/30"
              : "bg-red-600/20 text-red-400 border border-red-600/30"
          }`}
        >
          {message.text}
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-[#1a1a20] rounded-xl border border-white/10 p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Titre de la section
              </label>
              <input
                type="text"
                value={formData.titre}
                onChange={(e) =>
                  setFormData({ ...formData, titre: e.target.value })
                }
                className="w-full px-4 py-2 bg-[#0a0a10] border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#ffe992]/50 transition-colors"
                placeholder="Le Graphisme selon Fabien"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={6}
                className="w-full px-4 py-2 bg-[#0a0a10] border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#ffe992]/50 transition-colors resize-none"
                placeholder="Le graphisme est l'art de communiquer visuellement..."
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.description.length} caractères
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-[#ffe992] text-black rounded-lg hover:bg-[#ffe992]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Enregistrement...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Enregistrer les modifications
              </>
            )}
          </button>
        </div>
      </form>

      <div className="bg-[#1a1a20] rounded-xl border border-white/10 p-6">
        <h3 className="text-lg font-bold text-[#ffe992] mb-4">
          Aperçu du rendu
        </h3>
        <div className="backdrop-blur-sm bg-black/20 border border-[#ffe992]/15 rounded-2xl p-8">
          <h2 className="text-2xl font-playfair-sc text-[#ffe992] mb-4 uppercase tracking-wider">
            {formData.titre || "Le Graphisme selon Fabien"}
          </h2>
          <p className="text-gray-300 leading-relaxed whitespace-pre-line">
            {formData.description ||
              "Le graphisme est l'art de communiquer visuellement des idées, des émotions et des messages à travers la composition, la typographie, les couleurs et les formes."}
          </p>
        </div>
      </div>
    </div>
  );
}
