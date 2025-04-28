// ==============================
//  Importations des modules et ressources
// ==============================
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Galerie from "./pages/Galerie";
import Evenements from "./pages/Evenements";
import GalerieForm from "./components/galerie/GalerieForm";
import CalendarTest from "../test/calendarTest";
import Panier from "./pages/Panier";
import Auth from "./pages/Auth";
import { PanierProvider } from "./store/panierContext";
import { UserProvider } from "./context/UserContext";
import GestionGalerie from "./pages/GestionGalerie";
import RouteAdminOnly from "./components/RouteAdminOnly";

function App() {
  return (
    <UserProvider>
      <PanierProvider>
        <Router>
          <Routes>
            {/* Route pour la page d'accueil */}
            <Route path="/" element={<Home />} />
            {/* Route pour la page "A propos" */}
            <Route path="/about" element={<About />} />
            {/* Route pour la page "Galerie" */}
            <Route path="/Galerie" element={<Galerie />} />
            {/* Route pour la page "Évenements" */}
            <Route path="/evenements" element={<Evenements />} />
            {/* Route pour la page "GalerieForm" */}
            <Route path="/galerie-form" element={<GalerieForm />} />
            {/* route test et debug */}
            <Route path="/calendar-test" element={<CalendarTest />} />
            {/* Route pour le panier */}
            <Route path="/panier" element={<Panier />} />
            {/* Route pour inscription/connexion */}
            <Route path="/inscription" element={<Auth />} />
            {/* Route protégée admin pour la gestion galerie */}
            <Route path="/admin/gestion-galerie" element={
              <RouteAdminOnly>
                <GestionGalerie />
              </RouteAdminOnly>
            } />
          </Routes>
        </Router>
      </PanierProvider>
    </UserProvider>
  );
}

export default App;
