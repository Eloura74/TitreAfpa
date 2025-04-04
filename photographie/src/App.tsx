import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Galerie from "./pages/Galerie";
import Evenements from "./pages/Evenements";
import GalerieForm from "./components/galerie/GalerieForm";
import CalendarTest from "../test/calendarTest";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/Galerie" element={<Galerie />} />
        <Route path="/evenements" element={<Evenements />} />
        <Route path="/galerie-form" element={<GalerieForm />} />
        {/* route test et debug */}
        <Route path="/calendar-test" element={<CalendarTest />} />
      </Routes>
    </Router>
  );
}

export default App;
