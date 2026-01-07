import OngletsGestionGalerie from "../components/OngletsGestionGalerie";
import Navbar from "../components/layout/navbar";
import Footer from "../components/layout/Footer";

export default function GestionGalerie() {
  return (
    <div className="min-h-screen bg-[#0a0a10] text-white font-sans selection:bg-[#ffe992]/30">
      <Navbar />

      {/* Geometric Accents */}
      <div className="geometric-accent fixed top-0 left-0 w-full h-full pointer-events-none z-0 opacity-30" />

      <main className="max-w-7xl mx-auto py-12 px-6 pt-32 relative z-10">
        {/* Header Cinematic */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight font-['Cinzel']">
            <span className="hero-title-gradient bg-clip-text text-transparent bg-gradient-to-r from-[#d6c487] via-[#ffe992] to-[#c9b36f]">
              Gestion de la Galerie
            </span>
          </h1>
          <div className="h-1 w-24 bg-gradient-to-r from-transparent via-[#ffe992] to-transparent mx-auto mb-6 opacity-50" />
          <p className="text-gray-400 text-sm uppercase tracking-widest font-light">
            Administration des contenus et paramètres
          </p>
        </div>

        <OngletsGestionGalerie />
      </main>

      <Footer />
    </div>
  );
}
