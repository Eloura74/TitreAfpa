import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Galerie from "./pages/Galerie";
import Evenements from "./pages/Evenements";
import GalerieForm from "./components/galerie/GalerieForm";
import CalendarTest from "../test/calendarTest";
import Panier from "./pages/Panier";
import { PanierProvider } from "./store/panierContext";

function App() {
  return (
    <PanierProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/Galerie" element={<Galerie />} />
          <Route path="/evenements" element={<Evenements />} />
          <Route path="/galerie-form" element={<GalerieForm />} />
          {/* route test et debug */}
          <Route path="/calendar-test" element={<CalendarTest />} />
          {/* Route pour le panier */}
          <Route path="/panier" element={<Panier />} />
        </Routes>
      </Router>
    </PanierProvider>
  );
}

export default App;
