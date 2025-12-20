// ==============================
//  Importations des modules et ressources nécessaires pour le routing et les pages
// ==============================
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"; // Gestion des routes React
import Home from "./pages/Home";                           // Page d'accueil
import Photographie from "./pages/Photographie";           // Univers Photographie
import Graphisme from "./pages/Graphisme";                 // Univers Graphisme
import About from "./pages/About";                         // Page À propos
import Galerie from "./pages/Galerie";                     // Galerie photo classique
import GalerieGraphique from "./pages/GalerieGraphique";  // Galerie d'œuvres graphiques uniques
import Evenements from "./pages/Evenements";               // Page Événements
import GalerieForm from "./components/galerie/GalerieForm"; // Formulaire de gestion de galerie
// import CalendarTest from "../test/calendarTest";        // Route de test, commentée
import Panier from "./pages/Panier";                       // Page Panier
import Auth from "./pages/Auth";                           // Page Authentification (connexion / inscription)
import { PanierProvider } from "./store/panierContext";   // Provider pour gérer le panier globalement
import { UserProvider } from "./context/UserContext";     // Provider pour gérer le contexte utilisateur
import GestionGalerie from "./pages/GestionGalerie";       // Page admin gestion galerie
import RouteAdminOnly from "./components/RouteAdminOnly"; // Composant route protégée pour admin uniquement
import TirageEnLigne from "./pages/TirageEnLigne";         // Page Tirage en ligne
import GestionTarifs from "./components/GestionTarifs";     // Composant admin gestion tarifs

// ==============================
//  Composant principal App : configuration des routes
// ==============================
function App() {
  return (
    // On enveloppe toute l'application dans les providers pour partager le panier et l'utilisateur globalement
    <UserProvider>
      <PanierProvider>
        {/* Router React pour gérer les différentes URL */}
        <Router>
          {/* Définition des différentes routes accessibles dans l'app */}
          <Routes>
            {/* Route pour la page d'accueil */}
            <Route path="/" element={<Home />} />

            {/* Routes pour les univers spécifiques */}
            <Route path="/photographie" element={<Photographie />} />
            <Route path="/graphisme" element={<Graphisme />} />

            {/* Route pour la page "À propos" */}
            <Route path="/about" element={<About />} />

            {/* Route pour la galerie photo */}
            <Route path="/Galerie" element={<Galerie />} />

            {/* Route pour la page des événements */}
            <Route path="/evenements" element={<Evenements />} />

            {/* Route pour le formulaire de gestion de galerie */}
            <Route path="/galerie-form" element={<GalerieForm />} />

            {/* Route test (commentée pour ne pas être active) */}
            {/* <Route path="/calendar-test" element={<CalendarTest />} /> */}

            {/* Route pour la page panier */}
            <Route path="/panier" element={<Panier />} />

            {/* Route pour inscription / connexion */}
            <Route path="/inscription" element={<Auth />} />

            {/* Route protégée uniquement accessible aux admins pour la gestion galerie */}
            <Route
              path="/admin/gestion-galerie"
              element={
                // Le composant RouteAdminOnly bloque l'accès si l'utilisateur n'est pas admin
                <RouteAdminOnly>
                  <GestionGalerie />
                </RouteAdminOnly>
              }
            />

            {/* Route protégée uniquement accessible aux admins pour la gestion des tarifs */}
            <Route
              path="/admin/tarifs"
              element={
                // Le composant RouteAdminOnly bloque l'accès si l'utilisateur n'est pas admin
                <RouteAdminOnly>
                  <GestionTarifs />
                </RouteAdminOnly>
              }
            />

            {/* Route pour la nouvelle galerie graphique d'œuvres uniques */}
            <Route path="/galerie-graphique" element={<GalerieGraphique />} />

            {/* Route pour la page Tirage en ligne */}
            <Route path="/tirage" element={<TirageEnLigne />} />

            {/* Route pour la page de connexion */}
            <Route path="/connexion" element={<Auth />} />
          </Routes>
        </Router>
      </PanierProvider>
    </UserProvider>
  );
}

// Export par défaut du composant App pour le rendre accessible à l'extérieur
export default App;
