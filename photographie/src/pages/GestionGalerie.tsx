import OngletsGestionGalerie from "../components/OngletsGestionGalerie";
import Navbar from "../components/layout/navbar";
import Footer from "../components/layout/Footer";
import PageTitle from "../components/ui/PageTitle";

export default function GestionGalerie() {
  return (
    <div className="min-h-screen bg-[#0a0a10] text-white font-sans selection:bg-[#ffe992]/30">
      <Navbar />

      {/* Geometric Accents */}
      <div className="geometric-accent fixed top-0 left-0 w-full h-full pointer-events-none z-0 opacity-30" />

      <main className="max-w-7xl mx-auto py-12 px-6 pt-32 relative z-10">
        {/* Header Cinematic */}
        <PageTitle
          title="Gestion de la Galerie"
          subtitle="Administration des contenus et paramètres"
          showSeparator
        />

        <OngletsGestionGalerie />
      </main>

      <Footer />
    </div>
  );
}
