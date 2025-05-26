// ==============================
//  Importations des modules et ressources
// ==============================
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Photographie from "./pages/Photographie";
import Graphisme from "./pages/Graphisme";
import About from "./pages/About";
import Galerie from "./pages/Galerie";
import GalerieGraphique from "./pages/GalerieGraphique"; // Galerie graphique unique
import Evenements from "./pages/Evenements";
import GalerieForm from "./components/galerie/GalerieForm";
// import CalendarTest from "../test/calendarTest";
import Panier from "./pages/Panier";
import Auth from "./pages/Auth";
import { PanierProvider } from "./store/panierContext";
import { UserProvider } from "./context/UserContext";
import GestionGalerie from "./pages/GestionGalerie";
import RouteAdminOnly from "./components/RouteAdminOnly";
import TirageEnLigne from "./pages/TirageEnLigne";

function App() {
  return (
    <UserProvider>
      <PanierProvider>
        <Router>
          <Routes>
            {/* Route pour la page d'accueil */}
            <Route path="/" element={<Home />} />
            {/* Univers Photographie */}
            <Route path="/photographie" element={<Photographie />} />
            {/* Univers Graphisme */}
            <Route path="/graphisme" element={<Graphisme />} />
            {/* Route pour la page "A propos" */}
            <Route path="/about" element={<About />} />
            {/* Route pour la page "Galerie" */}
            <Route path="/Galerie" element={<Galerie />} />
            {/* Route pour la page "Évenements" */}
            <Route path="/evenements" element={<Evenements />} />
            {/* Route pour la page "GalerieForm" */}
            <Route path="/galerie-form" element={<GalerieForm />} />
            {/* route test et debug */}
            {/* <Route path="/calendar-test" element={<CalendarTest />} /> */}
            {/* Route pour le panier */}
            <Route path="/panier" element={<Panier />} />
            {/* Route pour inscription/connexion */}
            <Route path="/inscription" element={<Auth />} />
            {/* Route protégée admin pour la gestion galerie */}
            <Route
              path="/admin/gestion-galerie"
              element={
                <RouteAdminOnly>
                  <GestionGalerie />
                </RouteAdminOnly>
              }
            />
            {/* Route pour la nouvelle galerie graphique unique */}
            <Route path="/galerie-graphique" element={<GalerieGraphique />} />
            {/* Route pour la page Tirage en ligne */}
            <Route path="/tirage" element={<TirageEnLigne />} />
          </Routes>
        </Router>
      </PanierProvider>
    </UserProvider>
  );
}

export default App;
