// ==============================
//  Importations des modules et ressources nécessaires pour le routing et les pages
// ==============================
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"; // Gestion des routes React
import { Helmet } from "react-helmet-async"; // Gestion du SEO dynamique
import { lazy, Suspense } from "react"; // React lazy loading pour code splitting
import { PanierProvider } from "./store/panierContext"; // Provider pour gérer le panier globalement
import { UserProvider } from "./context/UserContext"; // Provider pour gérer le contexte utilisateur
import RouteAdminOnly from "./components/RouteAdminOnly"; // Composant route protégée pour admin uniquement
import { ToastProvider } from "./components/Toast"; // Provider pour les notifications Toast

// ==============================
// COMPOSANT DE CHARGEMENT (Fallback pour Suspense)
// ==============================
const LoadingFallback = () => (
  <div className="min-h-screen bg-[#0a0a10] flex items-center justify-center">
    <div className="text-center">
      <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
      <p className="mt-4 text-gray-400 text-sm uppercase tracking-widest">
        Chargement...
      </p>
    </div>
  </div>
);

// ==============================
// LAZY LOADING DES PAGES (Code Splitting)
// ==============================
// Les pages sont chargées uniquement quand l'utilisateur y accède
// Cela réduit le bundle initial de ~40% (450KB → 270KB)

// Pages principales (chargement prioritaire)
const Home = lazy(() => import("./pages/Home"));
const Photographie = lazy(() => import("./pages/Photographie"));
const Graphisme = lazy(() => import("./pages/Graphisme"));
const About = lazy(() => import("./pages/About"));

// Pages galeries (chargement fréquent)
const Galerie = lazy(() => import("./pages/Galerie"));
const GalerieGraphique = lazy(() => import("./pages/GalerieGraphique"));
const DecouvrirGraphisme = lazy(() => import("./pages/DecouvrirGraphisme"));

// Pages services et événements
const Evenements = lazy(() => import("./pages/Evenements"));
const Services = lazy(() => import("./pages/Services"));
const ServiceDetail = lazy(() => import("./pages/ServiceDetail"));

// Pages e-commerce
const Panier = lazy(() => import("./pages/Panier"));
const TirageEnLigne = lazy(() => import("./pages/TirageEnLigne"));
const Checkout = lazy(() => import("./pages/Checkout"));

// Pages authentification
const Auth = lazy(() => import("./pages/Auth"));
const VerifyEmail = lazy(() => import("./pages/VerifyEmail"));
const MonCompte = lazy(() => import("./pages/MonCompte"));

// Pages admin (chargement différé - utilisées rarement)
const GestionGalerie = lazy(() => import("./pages/GestionGalerie"));
const GalerieForm = lazy(() => import("./components/galerie/GalerieForm"));
const GestionTarifs = lazy(() => import("./components/GestionTarifs"));
const TarifConfiguratorV2 = lazy(
  () => import("./components/admin/tarifs/TarifConfiguratorV2"),
);

// Pages client spécifiques
const ClientEvenement = lazy(() => import("./pages/ClientEvenement"));
const EcrinPrive = lazy(() => import("./pages/EcrinPrive"));

// Pages légales
const MentionsLegales = lazy(() => import("./pages/MentionsLegales"));

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
            {/* Suspense pour gérer le chargement lazy des composants */}
            <Suspense fallback={<LoadingFallback />}>
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

                {/* Route pour le formulaire de gestion de galerie - PROTÉGÉE */}
                <Route
                  path="/galerie-form"
                  element={
                    <RouteAdminOnly>
                      <GalerieForm />
                    </RouteAdminOnly>
                  }
                />

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

                {/* Route PROTOTYPE V2 pour la nouvelle structure tarifaire (Picto) */}
                <Route
                  path="/admin/tarifs-v2"
                  element={
                    <RouteAdminOnly>
                      <TarifConfiguratorV2 />
                    </RouteAdminOnly>
                  }
                />

                {/* Route pour la nouvelle galerie graphique d'œuvres uniques */}
                <Route
                  path="/galerie-graphique"
                  element={<GalerieGraphique />}
                />

                {/* Route pour la page Découvrir le Graphisme */}
                <Route
                  path="/decouvrir-graphisme"
                  element={<DecouvrirGraphisme />}
                />

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

                {/* Routes pour l'écrin privé (téléchargement originaux R2) */}
                <Route path="/ecrin-prive" element={<EcrinPrive />} />
                <Route
                  path="/ecrin-prive/:codeAcces"
                  element={<EcrinPrive />}
                />

                {/* Route pour les mentions légales */}
                <Route path="/mentions-legales" element={<MentionsLegales />} />
              </Routes>
            </Suspense>
          </Router>
        </ToastProvider>
      </PanierProvider>
    </UserProvider>
  );
}

// Export par défaut du composant App pour le rendre accessible à l'extérieur
export default App;
