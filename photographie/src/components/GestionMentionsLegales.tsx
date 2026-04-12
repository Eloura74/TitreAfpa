import { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../config/api";
import { Check, X, Save, FileText, Scale } from "lucide-react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

export default function GestionMentionsLegales() {
  const [mentionsLegales, setMentionsLegales] = useState("");
  const [cgv, setCgv] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [derniereModification, setDerniereModification] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"mentions" | "cgv">("mentions");

  useEffect(() => {
    loadMentionsLegales();
  }, []);

  const loadMentionsLegales = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/mentions-legales`);
      if (res.data.success) {
        setMentionsLegales(res.data.mentionsLegales || "");
        setCgv(res.data.cgv || "");
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

    // Nettoyer le HTML vide de Quill (ex: '<p><br></p>')
    const cleanMentions =
      mentionsLegales?.replace(/<p><br><\/p>/g, "").trim() || "";
    const cleanCgv = cgv?.replace(/<p><br><\/p>/g, "").trim() || "";

    // Validation : au moins un contenu doit être rempli
    if (!cleanMentions && !cleanCgv) {
      setError(
        "Veuillez remplir au moins un des deux contenus (Mentions Légales ou CGV)",
      );
      setLoading(false);
      return;
    }

    try {
      const res = await axios.put(
        `${API_URL}/api/mentions-legales`,
        { mentionsLegales: mentionsLegales || "", cgv: cgv || "" },
        { withCredentials: true },
      );

      if (res.data.success) {
        setSuccess("Mentions légales et CGV enregistrées avec succès !");
        setDerniereModification(res.data.derniereModification);
      }
    } catch (err: any) {
      console.error("Erreur sauvegarde mentions légales:", err);
      const errorMessage =
        err?.response?.data?.message ||
        "Erreur lors de la sauvegarde des mentions légales";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ align: [] }],
      ["link"],
      ["clean"],
    ],
  };

  const quillFormats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "list",
    "align",
    "link",
  ];

  return (
    <div className="bg-[#12121a]/50 backdrop-blur-md rounded-2xl border border-white/5 shadow-xl p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/5">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-[#ffe992] to-[#d6c487] bg-clip-text text-transparent">
            Gestion des Mentions Légales et CGV
          </h2>
          <p className="text-gray-400 text-sm mt-2">
            Éditez le contenu des mentions légales et des conditions générales
            de vente
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

      {/* Onglets pour basculer entre Mentions Légales et CGV */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab("mentions")}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
            activeTab === "mentions"
              ? "bg-[#ffe992] text-black shadow-lg"
              : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
          }`}
        >
          <FileText size={18} />
          Mentions Légales
        </button>
        <button
          onClick={() => setActiveTab("cgv")}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
            activeTab === "cgv"
              ? "bg-[#ffe992] text-black shadow-lg"
              : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
          }`}
        >
          <Scale size={18} />
          Conditions Générales de Vente
        </button>
      </div>

      {/* Éditeur WYSIWYG */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-3">
          {activeTab === "mentions"
            ? "Contenu des mentions légales"
            : "Contenu des CGV"}
        </label>
        <div className="bg-white rounded-lg overflow-hidden quill-editor-wrapper">
          <ReactQuill
            theme="snow"
            value={activeTab === "mentions" ? mentionsLegales : cgv}
            onChange={activeTab === "mentions" ? setMentionsLegales : setCgv}
            modules={quillModules}
            formats={quillFormats}
            className="min-h-[500px]"
            placeholder={
              activeTab === "mentions"
                ? "Rédigez vos mentions légales ici..."
                : "Rédigez vos conditions générales de vente ici..."
            }
          />
        </div>
        <p className="text-gray-500 text-xs mt-2">
          💡 Utilisez la barre d'outils pour formater votre texte : titres,
          gras, italique, listes, etc.
        </p>
      </div>

      <style>{`
        .quill-editor-wrapper .ql-editor {
          color: #000000 !important;
          min-height: 500px;
        }
        .quill-editor-wrapper .ql-editor.ql-blank::before {
          color: #9ca3af !important;
        }
      `}</style>

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
