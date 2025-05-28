// Import du composant OngletsGestionGalerie qui gère l'affichage des différents onglets
import OngletsGestionGalerie from "../components/OngletsGestionGalerie";

// Composant principal GestionGalerie
export default function GestionGalerie() {
  return (
    // Conteneur principal avec paddings et largeur max centrée
    <div className="py-8 px-4 max-w-5xl mx-auto">
      {/* Titre principal centré et avec une taille de police large */}
      <h1 className="text-3xl font-bold mb-6 text-center">
        Gestion de la Galerie
      </h1>

      {/* Inclusion du composant OngletsGestionGalerie qui affichera les différents onglets de gestion */}
      <OngletsGestionGalerie />
    </div>
  );
}
