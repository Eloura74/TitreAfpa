// Import des hooks React nécessaires
import { useEffect, useState } from "react";
// Import de la bibliothèque axios pour les appels HTTP
import axios from "axios";

// Définition de l'interface d'une œuvre graphique
interface OeuvreGraphique {
  _id?: string; // ID MongoDB (généré automatiquement)
  titre: string; // Titre de l'œuvre
  image: string; // Chemin ou URL de l’image
  prix: number; // Prix en euros
  description?: string; // Description (facultative)
}

// Déclaration du composant principal de gestion
export default function GestionGalerieGraphique() {
  // État contenant la liste des œuvres récupérées depuis le backend
  const [oeuvres, setOeuvres] = useState<OeuvreGraphique[]>([]);

  // État représentant les champs du formulaire (création/modif)
  const [form, setForm] = useState<OeuvreGraphique>({
    titre: "",
    image: "",
    prix: 0,
    description: "",
  });

  // ID de l’œuvre à modifier (null si création)
  const [editId, setEditId] = useState<string | null>(null);

  // Fichier image sélectionné à uploader
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Message de feedback utilisateur (succès ou erreur)
  const [message, setMessage] = useState<string | null>(null);

  // Indique si un chargement est en cours
  const [loading, setLoading] = useState(false);

  // useEffect qui charge la liste des œuvres au premier rendu
  useEffect(() => {
    fetchOeuvres();
  }, []);

  // Récupère toutes les œuvres via une requête GET
  async function fetchOeuvres() {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/oeuvres-graphique`
      );
      setOeuvres(data); // Met à jour l'état avec les données reçues
    } catch (err) {
      setMessage("Erreur lors du chargement des œuvres.");
    }
  }

  // Fonction utilitaire pour uploader une image
  async function handleUploadImage(file: File): Promise<string | null> {
    const formData = new FormData(); // Création du formulaire multipart
    formData.append("image", file); // Ajout du fichier image

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/oeuvres-graphique/upload`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      return res.data.imagePath; // Retour du chemin de l’image depuis le backend
    } catch {
      setMessage("Erreur lors de l’upload de l’image.");
      return null;
    }
  }

  // Gère l'envoi du formulaire pour ajouter ou modifier une œuvre
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); // Empêche le rechargement de la page
    setLoading(true); // Active l'état de chargement
    setMessage(null); // Réinitialise les messages d'erreur

    let imagePath = form.image; // Par défaut, on garde l’image existante

    // Validation : image obligatoire en création
    if (!editId && !imageFile) {
      setMessage("Merci de sélectionner une image à importer.");
      setLoading(false);
      return;
    }

    // Validation : champ titre obligatoire
    if (form.titre.trim() === "") {
      setMessage("Le titre est requis.");
      setLoading(false);
      return;
    }

    // Validation : prix strictement positif
    if (form.prix <= 0) {
      setMessage("Le prix doit être supérieur à 0.");
      setLoading(false);
      return;
    }

    // Si une nouvelle image a été sélectionnée, on l'upload
    if (imageFile) {
      const uploaded = await handleUploadImage(imageFile);
      if (!uploaded) {
        setLoading(false);
        return;
      }
      imagePath = uploaded; // Mise à jour du chemin d’image à utiliser
    }

    try {
      if (editId) {
        // --- Cas MODIFICATION ---
        const { data } = await axios.put(
          `${import.meta.env.VITE_API_URL}/api/oeuvres-graphique/${editId}`,
          { ...form, image: imagePath }
        );

        // Mise à jour dans la liste existante (remplace l'œuvre modifiée)
        setOeuvres((prev) => prev.map((o) => (o._id === editId ? data : o)));

        setMessage("Œuvre modifiée !");
        setEditId(null); // On sort du mode édition
      } else {
        // --- Cas AJOUT ---
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/oeuvres-graphique`,
          { ...form, image: imagePath }
        );

        // Ajout de l’œuvre dans la liste locale
        setOeuvres((prev) => [...prev, data]);
        setMessage("Œuvre ajoutée !");
      }

      // Réinitialisation du formulaire après ajout/modif
      setForm({ titre: "", image: "", prix: 0, description: "" });
      setImageFile(null);
    } catch {
      setMessage("Erreur lors de l’enregistrement.");
    } finally {
      setLoading(false); // Fin du chargement
    }
  }

  // Pré-remplit le formulaire pour modifier une œuvre existante
  function handleEdit(oeuvre: OeuvreGraphique) {
    setForm({
      titre: oeuvre.titre,
      image: oeuvre.image,
      prix: oeuvre.prix,
      description: oeuvre.description || "",
    });
    setEditId(oeuvre._id || null); // Active le mode édition avec l’ID
    setImageFile(null); // Vide le champ fichier
    setMessage(null); // Vide les messages
  }

  // Supprime une œuvre après confirmation
  async function handleDelete(id?: string) {
    if (!id) return; // Sécurité : si pas d’ID, on ne fait rien
    if (!window.confirm("Supprimer cette œuvre ?")) return; // Demande de confirmation

    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/oeuvres-graphique/${id}`
      );

      // Met à jour la liste locale en retirant l’élément supprimé
      setOeuvres((prev) => prev.filter((o) => o._id !== id));
      setMessage("Œuvre supprimée !");
    } catch {
      setMessage("Erreur lors de la suppression.");
    }
  }

  return (
    // Conteneur principal stylisé
    <div className="p-8 max-w-4xl mx-auto text-white bg-[#1a1a20] rounded-md shadow-md">
      
      {/* Titre principal */}
      <h2 className="text-2xl font-bold text-yellow-400 mb-6">Gestion de la Galerie Graphique</h2>
  
      {/* Formulaire d’ajout ou de modification */}
      <form className="grid grid-cols-1 gap-4 mb-6" onSubmit={handleSubmit}>
        
        {/* Champ fichier image (image locale à uploader) */}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              setImageFile(e.target.files[0]); // Met à jour le fichier sélectionné
            }
          }}
          className="mb-2"
        />
  
        {/* Aperçu de l’image locale (avant upload vers le backend) */}
        {imageFile && (
          <div className="mb-2 flex justify-center">
            <img
              src={URL.createObjectURL(imageFile)}
              alt="Aperçu"
              className="h-32 rounded shadow"
              style={{ objectFit: "contain" }}
            />
          </div>
        )}
  
        {/* Champ texte pour le titre de l’œuvre */}
        <input
          type="text"
          placeholder="Titre"
          value={form.titre}
          onChange={(e) =>
            setForm((f) => ({ ...f, titre: e.target.value }))
          }
          className="input"
          required
        />
  
        {/* Zone de texte pour la description (optionnelle) */}
        <textarea
          placeholder="Description"
          value={form.description}
          onChange={(e) =>
            setForm((f) => ({ ...f, description: e.target.value }))
          }
          className="input"
        />
  
        {/* Champ numérique pour le prix */}
        <input
          type="number"
          placeholder="Prix (€)"
          value={form.prix}
          onChange={(e) =>
            setForm((f) => ({ ...f, prix: Number(e.target.value) }))
          }
          className="input"
          required
        />
  
        {/* Message de validation si prix invalide */}
        {form.prix <= 0 && (
          <div className="text-red-400 text-xs">
            Le prix doit être supérieur à 0.
          </div>
        )}
  
        {/* Bouton de soumission du formulaire */}
        <button
          type="submit"
          className="bg-yellow-400 hover:bg-yellow-300 text-black font-bold py-2 px-4 rounded w-full transition"
          disabled={
            loading ||                       // Désactivé pendant chargement
            form.titre.trim() === "" ||      // Titre vide
            (!editId && !imageFile) ||       // Image requise en création
            form.prix <= 0                   // Prix invalide
          }
        >
          {editId ? "Modifier l’œuvre" : "Ajouter l’œuvre"}
        </button>
  
        {/* Message si aucune image n’est sélectionnée en mode création */}
        {!editId && !imageFile && (
          <div className="text-red-400 text-xs">
            Sélectionne une image à importer.
          </div>
        )}
  
        {/* Affichage du message global (erreur ou succès) */}
        {message && (
          <div className="text-center text-sm mt-2 text-yellow-400">
            {message}
          </div>
        )}
      </form>
  
      {/* Liste des œuvres graphiques */}
      <div className="space-y-4">
  
        {/* Message si la galerie est vide */}
        {oeuvres.length === 0 && (
          <div className="text-gray-400">
            Aucune œuvre graphique pour le moment.
          </div>
        )}
  
        {/* Affichage de chaque œuvre */}
        {oeuvres.map((oeuvre) => (
          <div
            key={oeuvre._id}
            className="flex items-center bg-gray-800 rounded shadow p-4"
          >
            {/* Image de l’œuvre */}
            <img
              src={oeuvre.image}
              alt={oeuvre.titre}
              className="w-16 h-16 object-cover rounded mr-4"
            />
  
            {/* Détails de l’œuvre */}
            <div className="flex-1">
              <span className="font-bold text-lg text-yellow-300">
                {oeuvre.titre}
              </span>
              {oeuvre.description && (
                <span className="block text-gray-400 ml-2">
                  {oeuvre.description}
                </span>
              )}
              <span className="block text-yellow-400 font-semibold">
                {oeuvre.prix} €
              </span>
            </div>
  
            {/* Bouton de modification */}
            <button
              onClick={() => handleEdit(oeuvre)}
              className="text-blue-400 hover:underline mr-4"
            >
              Modifier
            </button>
  
            {/* Bouton de suppression */}
            <button
              onClick={() => handleDelete(oeuvre._id)}
              className="text-red-400 hover:underline"
            >
              Supprimer
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}