// Importations des modules nécessaires
// useEffect et useState : hooks React pour la gestion du cycle de vie et de l'état
// useNavigate : hook React Router pour la navigation programmatique
// galerieData : données locales de la galerie (JSON)
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import galerieData from "../../config/galerie.json";

// --- TYPE PRINCIPAL DU FORMULAIRE ---
interface FormType {
  src: string;
  alt: string;
  titre: string;
  description: string;
  categorie: string;
  tarifs: TarifOeuvre[];
  // Le prix n'est plus demandé car il est déterminé par le format choisi
}

// --- TYPE POUR UN TARIF (FORMAT/SUPPORT/PRIX) ---
interface TarifOeuvre {
  id: string;
  format: string;
  support: string;
  prix: number;
}

// --- TYPE POUR UN TARIF PRÉDÉFINI ---
interface TarifPredefini {
  _id: string;
  id: string;
  nom: string;
  type: string;
  format: string;
  prix: number;
  support: string;
  actif: boolean;
}

// --- FORMULAIRE INITIAL AVEC TARIFS VIDE ---
const formInitial: FormType = {
  src: "",
  alt: "",
  titre: "",
  description: "",
  categorie: "",
  tarifs: [],
  // Le prix n'est plus demandé car il est déterminé par le format choisi
};

// Interface pour les photos (structure des objets photo)
interface Photo {
  _id?: string; // ID optionnel (défini par MongoDB)
  src: string; // URL ou chemin de l'image
  alt: string; // Texte alternatif pour l'accessibilité
  titre: string; // Titre de la photo
  description: string; // Description détaillée
  prix: number; // Prix par défaut (optionnel, pour compat)
  categorie: string; // Catégorie de la photo
  tarifs: TarifOeuvre[]; // Liste des formats/supports/prix
}

export default function GalerieForm() {
  // État pour la liste des photos (tableau d'objets Photo)
  const [photos, setPhotos] = useState<Photo[]>([]);
  // État pour le formulaire (photo en cours de création ou d'édition)
  const [form, setForm] = useState<FormType>(formInitial); // Initialisation des tarifs
  // État pour la liste des tarifs prédéfinis disponibles
  const [tarifsPredéfinis, setTarifsPredéfinis] = useState<TarifPredefini[]>(
    []
  );
  // État pour les tarifs sélectionnés (IDs)
  const [tarifsSélectionnés, setTarifsSélectionnés] = useState<string[]>([]);

  // Note: La gestion des tarifs personnalisés a été simplifiée
  // Nous utilisons maintenant uniquement les tarifs prédéfinis

  // État pour savoir si on édite une photo (sinon null)
  const [editId, setEditId] = useState<string | null>(null);
  // URL de l'API backend pour la galerie
  const API_URL = "http://localhost:5001/api/galerie";
  // Hook pour rediriger l'utilisateur après une action
  const navigate = useNavigate();

  // Chargement des photos et des tarifs prédéfinis au montage du composant
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Récupération des photos
        const resPhotos = await fetch(API_URL);
        const dataPhotos = await resPhotos.json();
        setPhotos(dataPhotos);

        // Récupération des tarifs prédéfinis
        const resTarifs = await fetch("http://localhost:5001/api/tarifs");
        const dataTarifs = await resTarifs.json();
        console.log("Tarifs prédéfinis récupérés:", dataTarifs);
        setTarifsPredéfinis(dataTarifs.filter((t: TarifPredefini) => t.actif));
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
      }
    };

    fetchData();
  }, []);

  // Gestion des changements dans le formulaire (tous les champs)
  // Gestion des changements dans le formulaire (tous les champs sauf tarifs)
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: name === "prix" ? parseFloat(value || "0") : value, // Conversion en nombre pour le prix
    });
  };

  // Soumission du formulaire : ajout ou modification d'une photo
  const handleSubmit = async () => {
    // Vérification des champs obligatoires
    if (
      !form.src ||
      !form.src.startsWith("/uploads/") ||
      !form.titre ||
      !form.alt ||
      !form.description ||
      !form.categorie
    ) {
      alert("Veuillez remplir tous les champs correctement.");
      return;
    }
    console.log(form);
    try {
      // Vérification que des tarifs sont sélectionnés
      if (tarifsSélectionnés.length === 0) {
        alert("Veuillez sélectionner au moins un tarif pour cette photo.");
        return;
      }

      // Préparation des tarifs sélectionnés pour l'envoi
      console.log("Tarifs sélectionnés (IDs):", tarifsSélectionnés);
      console.log("Tarifs prédéfinis disponibles:", tarifsPredéfinis);

      const tarifsÀEnvoyer = tarifsSélectionnés
        .map((id) => {
          const tarifTrouvé = tarifsPredéfinis.find(
            (t) => t._id === id || t.id === id
          );
          console.log(`Recherche du tarif avec ID ${id}:`, tarifTrouvé);

          if (tarifTrouvé) {
            const tarifFormaté = {
              id: tarifTrouvé._id || tarifTrouvé.id,
              format: tarifTrouvé.format,
              support: tarifTrouvé.support,
              prix: tarifTrouvé.prix,
            };
            console.log("Tarif formaté pour l'envoi:", tarifFormaté);
            return tarifFormaté;
          }
          return null;
        })
        .filter((t) => t !== null) as TarifOeuvre[];

      console.log("Tarifs finaux à envoyer:", tarifsÀEnvoyer);

      // Mise à jour du formulaire avec les tarifs sélectionnés
      // Création d'un objet simple et plat pour l'envoi
      const formAvecTarifs = {
        src: form.src,
        alt: form.alt,
        titre: form.titre,
        description: form.description,
        categorie: form.categorie,
        tarifs: tarifsÀEnvoyer,
      };

      // Log du formulaire pour debug
      console.log("Formulaire envoyé:", formAvecTarifs);
      console.log("JSON à envoyer:", JSON.stringify(formAvecTarifs));

      try {
        if (editId) {
          // Si editId existe, on modifie une photo existante (PUT)
          const res = await fetch(`${API_URL}/${editId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formAvecTarifs),
          });
          if (!res.ok) {
            const err = await res.text();
            alert("Erreur serveur: " + err);
            return;
          }
          const updated = await res.json();
          setPhotos(
            photos.map((photo) => (photo._id === editId ? updated : photo))
          );
          setEditId(null); // On sort du mode édition
        } else {
          // SOLUTION EN DEUX TEMPS - D'abord créer une photo minimale, puis ajouter les tarifs
          console.log(
            "Création en deux temps - Étape 1: photo minimale sans tarifs",
            formAvecTarifs
          );
          
          // Étape 1: Création d'une photo SANS les tarifs (qui posent problème)
          const photoMinimale = {
            src: formAvecTarifs.src,
            alt: formAvecTarifs.alt,
            titre: formAvecTarifs.titre,
            description: formAvecTarifs.description,
            categorie: formAvecTarifs.categorie
            // tarifs volontairement omis ici
          };
          
          // Envoi de la requête minimale
          const res = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(photoMinimale),
          });

          // Récupération du texte de la réponse pour analyse
          const responseText = await res.text();
          console.log("Réponse brute du serveur étape 1:", responseText);

          // Si la réponse n'est pas OK pour l'étape 1
          if (!res.ok) {
            let errorMessage = `Erreur étape 1 - ${res.status}: ${res.statusText}`;
            try {
              // Essayer de parser comme JSON si possible
              const errorJson = JSON.parse(responseText);
              errorMessage += `\n\nDétails: ${JSON.stringify(
                errorJson,
                null,
                2
              )}`;
            } catch (e) {
              // Sinon utiliser le texte brut
              errorMessage += `\n\nDétails: ${responseText}`;
            }

            console.error("Détails de l'erreur étape 1:", errorMessage);
            alert(errorMessage);
            return;
          }
          
          // Étape 1 réussie : Photo créée sans tarifs
          let photoCreee = JSON.parse(responseText);
          console.log("Photo créée avec succès (sans tarifs):", photoCreee);

          try {
            // ÉTAPE 2: Mise à jour de la photo avec les tarifs
            console.log("Création en deux temps - Étape 2: ajout des tarifs", formAvecTarifs.tarifs);
            
            // Si la photo a bien été créée et a un ID
            if (photoCreee && photoCreee._id) {
              // Requête PUT pour mettre à jour la photo avec les tarifs
              const updateRes = await fetch(`${API_URL}/${photoCreee._id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ tarifs: formAvecTarifs.tarifs }),
              });
              
              const updateResponseText = await updateRes.text();
              console.log("Réponse brute du serveur étape 2:", updateResponseText);
              
              if (!updateRes.ok) {
                console.warn("Attention: Les tarifs n'ont pas pu être ajoutés, mais la photo a été créée.");
                // On continue quand même car la photo existe déjà
              } else {
                // Mise à jour réussie
                try {
                  photoCreee = JSON.parse(updateResponseText);
                  console.log("Photo mise à jour avec succès (avec tarifs):", photoCreee);
                } catch (e) {
                  console.error("Erreur de parsing de la réponse étape 2:", e);
                }
              }
            }
          } catch (updateErr) {
            console.warn("Erreur lors de la mise à jour avec les tarifs:", updateErr);
            // On continue quand même car la photo existe déjà
          }
          
          // Dans tous les cas, on ajoute la photo créée à la liste
          setPhotos((prevPhotos) => [...prevPhotos, photoCreee]);
        }
      } catch (err) {
        alert("Erreur réseau ou serveur: " + err);
        return;
      }

      // Réinitialisation complète du formulaire après succès
      setForm(formInitial);
      setTarifsSélectionnés([]);

      alert("Photo enregistrée avec succès !");
    } catch (error) {
      console.error("Erreur lors de l'enregistrement :", error);
      alert("Une erreur est survenue.");
    }
  };

  // Préparation du formulaire pour l'édition d'une photo existante
  const handleEdit = (photo: Photo) => {
    setEditId(photo._id!);
    setForm({
      src: photo.src,
      alt: photo.alt,
      titre: photo.titre,
      description: photo.description,
      categorie: photo.categorie,
      tarifs: photo.tarifs || [],
    });

    // Récupération des IDs des tarifs associés à cette photo
    if (photo.tarifs && photo.tarifs.length > 0) {
      const tarifIds = photo.tarifs.map((t) => t.id);
      setTarifsSélectionnés(tarifIds);
    } else {
      setTarifsSélectionnés([]);
    }
  };

  // Suppression d'une photo par son ID
  const handleDelete = async (id: string) => {
    await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    setPhotos(photos.filter((photo) => photo._id !== id));
  };

  // Génération de la liste des catégories uniques (issues des photos et des données locales)
  const allCategories = [
    ...new Set([
      ...photos.map((p) => p.categorie),
      ...galerieData.map((p) => p.categorie), // Typage minimal, pas Photo
    ]),
  ].sort((a, b) => a.localeCompare(b));

  // Rendu du formulaire et de la liste des photos
  return (
    <div className="p-8 max-w-4xl mx-auto text-white bg-[#1a1a20] rounded-md shadow-md">
      {/* En-tête du formulaire */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#ffe992]">
          Gestion de la Galerie
        </h2>
        <button
          onClick={() => navigate("/galerie")}
          className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded"
        >
          ⬅ Retour à la galerie
        </button>
      </div>

      {/* Sélection des tarifs prédéfinis */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold">
            Tarifs applicables à cette photo
          </span>
          <a
            href="/admin/tarifs"
            target="_blank"
            className="text-blue-400 hover:text-blue-300 text-sm"
          >
            Gérer les tarifs
          </a>
        </div>

        {tarifsPredéfinis.length === 0 ? (
          <div className="text-yellow-200 text-sm mb-2">
            Aucun tarif disponible. Veuillez en créer dans la section "Gestion
            des tarifs".
          </div>
        ) : (
          <>
            {tarifsSélectionnés.length === 0 && (
              <div className="text-yellow-200 text-sm mb-2">
                Sélectionnez au moins un tarif pour cette photo.
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto p-2 border border-gray-700 rounded">
              {tarifsPredéfinis.map((tarif) => (
                <div
                  key={tarif._id || tarif.id}
                  className="flex items-center gap-2 p-2 hover:bg-gray-800 rounded"
                >
                  <input
                    type="checkbox"
                    id={`tarif-${tarif._id || tarif.id}`}
                    checked={tarifsSélectionnés.includes(tarif._id || tarif.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setTarifsSélectionnés([
                          ...tarifsSélectionnés,
                          tarif._id || tarif.id,
                        ]);
                      } else {
                        setTarifsSélectionnés(
                          tarifsSélectionnés.filter(
                            (id) => id !== (tarif._id || tarif.id)
                          )
                        );
                      }
                    }}
                    className="h-4 w-4"
                  />
                  <label
                    htmlFor={`tarif-${tarif._id || tarif.id}`}
                    className="flex-1 cursor-pointer"
                  >
                    <div className="font-medium">{tarif.nom}</div>
                    <div className="text-sm text-gray-400">
                      {tarif.format} - {tarif.support} -{" "}
                      <span className="text-yellow-300">{tarif.prix}€</span>
                    </div>
                  </label>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Formulaire */}
      <div className="grid grid-cols-1 gap-4 mb-6">
        <input
          type="file"
          accept="image/*"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;

            const formData = new FormData();
            formData.append("image", file);

            try {
              const res = await fetch(`${API_URL}/upload`, {
                method: "POST",
                body: formData,
              });

              const data = await res.json();
              setForm((prev) => ({ ...prev, src: data.imagePath }));
            } catch (err) {
              alert("Erreur lors de l'envoi de l'image.");
              console.error(err);
            }
          }}
          className="input"
        />

        {form.src && (
          <img
            src={
              form.src.startsWith("http")
                ? form.src
                : form.src.startsWith("/")
                ? `http://localhost:5001${form.src}`
                : `http://localhost:5001/uploads/${form.src}`
            }
            alt="Aperçu"
            className="w-64 h-auto mt-2 rounded border border-gray-600"
          />
        )}

        <input
          name="alt"
          placeholder="Texte alternatif"
          value={form.alt}
          onChange={handleChange}
          className="input"
        />
        <input
          name="titre"
          placeholder="Titre"
          value={form.titre}
          onChange={handleChange}
          className="input"
        />
        <textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          className="input"
        />
        <input
          list="categories"
          name="categorie"
          placeholder="Catégorie"
          value={form.categorie}
          onChange={handleChange}
          className="input"
        />

        <datalist id="categories">
          {allCategories.map((cat, index) => (
            <option key={index} value={cat} />
          ))}
        </datalist>

        <button
          onClick={handleSubmit}
          disabled={
            !form.src ||
            !form.src.startsWith("/uploads/") ||
            !form.titre ||
            !form.alt ||
            !form.description ||
            !form.categorie // ||
            // form.prix <= 0
          }
          className={`px-4 py-2 rounded font-bold transition w-full ${
            !form.src ||
            !form.src.startsWith("/uploads/") ||
            !form.titre ||
            !form.alt ||
            !form.description ||
            !form.categorie // ||
              ? // form.prix <= 0
                "bg-gray-600 cursor-not-allowed"
              : "bg-yellow-400 text-black hover:bg-yellow-500"
          }`}
        >
          {editId ? "Modifier" : "Valider"}
        </button>
      </div>

      {/* Liste avec miniatures */}
      <div className="space-y-4">
        {photos.map((photo) => (
          <div
            key={photo._id}
            className="p-4 border border-gray-700 rounded flex justify-between items-center gap-4"
          >
            <div className="flex items-center gap-4">
              {photo.src && (
                <img
                  src={
                    photo.src.startsWith("http")
                      ? photo.src
                      : photo.src.startsWith("/")
                      ? `http://localhost:5001${photo.src}`
                      : `http://localhost:5001/uploads/${photo.src}`
                  }
                  alt={photo.alt || ""}
                  className="w-16 h-16 object-cover rounded shadow"
                />
              )}
              <div>
                <strong>{photo.titre}</strong> — <em>{photo.categorie}</em>
                {/* Affichage des tarifs dynamiques */}
                {Array.isArray(photo.tarifs) && photo.tarifs.length > 0 ? (
                  <ul className="mt-1 text-sm">
                    {photo.tarifs.map((tarif) => (
                      <li
                        key={
                          tarif.id ||
                          `${tarif.format}-${tarif.support}-${tarif.prix}`
                        }
                        className="text-yellow-200"
                      >
                        <span className="font-bold">{tarif.format}</span> —{" "}
                        {tarif.support} : {tarif.prix}€
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-gray-400 text-xs">
                    Aucun format disponible.
                  </div>
                )}
              </div>
            </div>
            <div className="space-x-2">
              <button
                onClick={() => handleEdit(photo)}
                className="text-blue-300 hover:text-blue-500"
              >
                Modifier
              </button>
              <button
                onClick={() => handleDelete(photo._id!)}
                className="text-red-400 hover:text-red-600"
              >
                Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
