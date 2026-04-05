import { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../config/api";
import { Check, X, Save } from "lucide-react";

export default function GestionMentionsLegales() {
  const [contenu, setContenu] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [derniereModification, setDerniereModification] = useState<string>("");

  useEffect(() => {
    loadMentionsLegales();
  }, []);

  const loadMentionsLegales = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/mentions-legales`);
      if (res.data.success) {
        setContenu(res.data.contenu);
        setDerniereModification(res.data.derniereModification);
      }
    } catch (err) {
      console.error("Erreur chargement mentions légales:", err);
      setError("Erreur lors du chargement des mentions légales");
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await axios.put(
        `${API_URL}/api/mentions-legales`,
        { contenu },
        { withCredentials: true },
      );

      if (res.data.success) {
        setSuccess("Mentions légales enregistrées avec succès !");
        setDerniereModification(res.data.derniereModification);
      }
    } catch (err) {
      console.error("Erreur sauvegarde mentions légales:", err);
      setError("Erreur lors de la sauvegarde des mentions légales");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#12121a]/50 backdrop-blur-md rounded-2xl border border-white/5 shadow-xl p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/5">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-[#ffe992] to-[#d6c487] bg-clip-text text-transparent">
            Gestion des Mentions Légales
          </h2>
          <p className="text-gray-400 text-sm mt-2">
            Éditez le contenu des mentions légales de votre site
          </p>
          {derniereModification && (
            <p className="text-gray-500 text-xs mt-1">
              Dernière modification :{" "}
              {new Date(derniereModification).toLocaleString("fr-FR")}
            </p>
          )}
        </div>
      </div>

      {/* Messages de feedback */}
      {error && (
        <div className="bg-red-500/10 text-red-400 p-4 rounded-lg mb-6 border border-red-500/20 flex items-center gap-3">
          <X size={20} /> {error}
        </div>
      )}
      {success && (
        <div className="bg-green-500/10 text-green-400 p-4 rounded-lg mb-6 border border-green-500/20 flex items-center gap-3">
          <Check size={20} /> {success}
        </div>
      )}

      {/* Éditeur de texte HTML */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Contenu des mentions légales (HTML)
        </label>
        <textarea
          value={contenu}
          onChange={(e) => setContenu(e.target.value)}
          className="w-full min-h-[500px] bg-[#232336] border border-[#ffe992]/30 rounded-lg px-4 py-3 text-white font-mono text-sm focus:border-[#ffe992] outline-none transition-colors resize-y"
          placeholder="<h2>1. Informations légales</h2>
<p><strong>Nom de l'entreprise :</strong> Photographe Pro</p>
..."
        />
        <p className="text-gray-500 text-xs mt-2">
          💡 Astuce : Vous pouvez utiliser du HTML pour formater votre texte.
          Les balises courantes : &lt;h2&gt;, &lt;p&gt;, &lt;strong&gt;, &lt;a
          href=""&gt;, etc. Les retours à la ligne sont préservés.
        </p>
      </div>

      {/* Bouton de sauvegarde */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-3 bg-[#ffe992] hover:bg-[#d6c487] text-black font-semibold rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save size={18} />
          {loading ? "Enregistrement..." : "Enregistrer les modifications"}
        </button>
      </div>
    </div>
  );
}
