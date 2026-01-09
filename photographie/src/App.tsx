// ==============================
//  Importations des modules et ressources nécessaires pour le routing et les pages
// ==============================
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"; // Gestion des routes React
import { Helmet } from "react-helmet-async"; // Gestion du SEO dynamique
import Home from "./pages/Home"; // Page d'accueil
import Photographie from "./pages/Photographie"; // Univers Photographie
import Graphisme from "./pages/Graphisme"; // Univers Graphisme
import About from "./pages/About"; // Page À propos
import Galerie from "./pages/Galerie"; // Galerie photo classique
import GalerieGraphique from "./pages/GalerieGraphique"; // Galerie d'œuvres graphiques uniques
import Evenements from "./pages/Evenements"; // Page Événements
import Services from "./pages/Services"; // Page Prestations (Services)
import ServiceDetail from "./pages/ServiceDetail"; // Page Détail Prestation
import GalerieForm from "./components/galerie/GalerieForm"; // Formulaire de gestion de galerie
// import CalendarTest from "../test/calendarTest";        // Route de test, commentée
import Panier from "./pages/Panier"; // Page Panier
import Auth from "./pages/Auth"; // Page Authentification (connexion / inscription)
import VerifyEmail from "./pages/VerifyEmail"; // Page de vérification d'email
import { PanierProvider } from "./store/panierContext"; // Provider pour gérer le panier globalement
import { UserProvider } from "./context/UserContext"; // Provider pour gérer le contexte utilisateur
import GestionGalerie from "./pages/GestionGalerie"; // Page admin gestion galerie
import RouteAdminOnly from "./components/RouteAdminOnly"; // Composant route protégée pour admin uniquement
import TirageEnLigne from "./pages/TirageEnLigne"; // Page Tirage en ligne
import GestionTarifs from "./components/GestionTarifs"; // Composant admin gestion tarifs
import MonCompte from "./pages/MonCompte"; // Page Espace Client
import ClientEvenement from "./pages/ClientEvenement"; // Page Événement Client (Photos)
import Checkout from "./pages/Checkout"; // Page de paiement
import { ToastProvider } from "./components/Toast"; // Provider pour les notifications Toast
// import { useState } from "react"; // Hook pour gérer l'état local
// import IntroVideo from "./components/intro/IntroVideo"; // Composant vidéo d'intro

// ==============================
//  Composant principal App : configuration des routes
// ==============================
function App() {
  // État pour gérer l'affichage de la vidéo d'intro
  // On initialise à true pour afficher la vidéo au chargement
  // const [showIntro, setShowIntro] = useState(true);

  // Fonction pour masquer l'intro une fois terminée
  // const handleIntroEnd = () => {
  //   setShowIntro(false);
  // };

  return (
    // On enveloppe toute l'application dans les providers pour partager le panier et l'utilisateur globalement
    <UserProvider>
      <PanierProvider>
        <ToastProvider>
          {/* Configuration SEO par défaut */}
          <Helmet
            defaultTitle="Fabien Licata | Photographe & Graphiste"
            titleTemplate="%s | Fabien Licata"
          >
            <meta
              name="description"
              content="Portfolio de Fabien Licata, Photographe et Graphiste. Découvrez mes galeries d'art, tirages photos et créations graphiques uniques."
            />
            <meta property="og:type" content="website" />
            <meta property="og:site_name" content="Fabien Licata" />
          </Helmet>

          {/* Affichage conditionnel de la vidéo d'intro */}
          {/* {showIntro && <IntroVideo onEnded={handleIntroEnd} />} */}

          {/* Le reste de l'application n'est affiché (ou du moins visible) que si l'intro est finie
              Cependant, pour éviter un "flash" ou re-render complet, on peut soit :
              1. Ne rien rendre d'autre tant que showIntro est true (simple)
              2. Rendre l'app en dessous (cachée par le z-index de l'intro) pour qu'elle soit prête.
              
              Ici, l'IntroVideo a un z-index élevé et un fond opaque, donc elle couvre tout.
              On peut laisser l'app se monter en arrière-plan pour que ce soit fluide à la fin de la vidéo.
          */}

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
              <Route path="/galerie" element={<Galerie />} />

              {/* Route pour la page des événements */}
              <Route path="/evenements" element={<Evenements />} />

              {/* Route pour la page des prestations (services) */}
              <Route path="/services" element={<Services />} />
              <Route path="/services/:id" element={<ServiceDetail />} />

              {/* Route pour le formulaire de gestion de galerie */}
              <Route path="/galerie-form" element={<GalerieForm />} />

              {/* Route test (commentée pour ne pas être active) */}
              {/* <Route path="/calendar-test" element={<CalendarTest />} /> */}

              {/* Route pour la page panier */}
              <Route path="/panier" element={<Panier />} />

              {/* Route pour inscription / connexion */}
              <Route path="/inscription" element={<Auth />} />

              {/* Route pour la vérification d'email */}
              <Route path="/verify-email" element={<VerifyEmail />} />

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

              {/* Route pour l'espace client */}
              <Route path="/mon-compte" element={<MonCompte />} />

              {/* Route pour le paiement */}
              <Route path="/checkout" element={<Checkout />} />

              {/* Route pour l'événement client spécifique */}
              <Route
                path="/client/evenement/:id"
                element={<ClientEvenement />}
              />
            </Routes>
          </Router>
        </ToastProvider>
      </PanierProvider>
    </UserProvider>
  );
}

// Export par défaut du composant App pour le rendre accessible à l'extérieur
export default App;
