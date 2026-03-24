import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Navbar from "../components/layout/navbar";
import Footer from "../components/layout/Footer";
import SEO from "../components/SEO";
import { photographerSchema, createBreadcrumbSchema } from "../utils/schemas";
import "../styles/globals.css";
import PageTitle from "../components/ui/PageTitle";
import { getAboutData } from "../services/aboutService";

export default function About() {
  const [aboutData, setAboutData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [imageVersion, setImageVersion] = useState(Date.now());

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const data = await getAboutData();
      setAboutData(data);
      // Mettre à jour la version de l'image uniquement si l'URL a changé
      setImageVersion(Date.now());
    } catch (error) {
      console.error("Erreur chargement about data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
    },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a10] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#ffe992] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!aboutData) return null;

  return (
    <div className="min-h-screen bg-[#0a0a10] text-white font-sans selection:bg-[#ffe992]/30 flex flex-col">
      <SEO
        title="À Propos - Fabien Licata"
        description={
          aboutData.introduction || "Photographe professionnel based in France."
        }
        image={aboutData.image || "/images/about-preview.jpg"}
        type="profile"
        keywords={[
          "photographe professionnel",
          "graphiste",
          "Fabien Licata",
          "à propos",
          "parcours photographe",
          "artiste photographe",
        ]}
        schema={{
          ...photographerSchema,
          ...createBreadcrumbSchema([
            { name: "Accueil", url: "https://titre-afpa.vercel.app/" },
            { name: "À Propos", url: "https://titre-afpa.vercel.app/about" },
          ]),
        }}
      />
      <Navbar />

      {/* Geometric Accents */}
      <div className="geometric-accent fixed top-0 left-0 w-full h-full pointer-events-none z-0 opacity-30" />

      <main className="flex-grow pt-32 pb-20 px-6 md:px-12 max-w-7xl mx-auto w-full relative z-10">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="space-y-16"
        >
          {/* Header Section */}
          <PageTitle title="À Propos" />

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Image Section (Left) */}
            <motion.div
              variants={itemVariants}
              className="lg:col-span-5 relative group"
            >
              <div className="relative overflow-hidden rounded-2xl shadow-2xl shadow-black/50 border border-white/10 group-hover:border-[#ffe992]/30 transition-all duration-500">
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />
                <img
                  src={`${aboutData.image}${aboutData.image.includes("?") ? "&" : "?"}v=${imageVersion}`}
                  alt={aboutData.name}
                  className="w-full h-[600px] object-cover object-top transform transition-transform duration-700 group-hover:scale-105 filter grayscale-[20%] group-hover:grayscale-0"
                />

                {/* Caption */}
                <div className="absolute bottom-6 left-6 z-20">
                  <p className="text-[#ffe992] text-xs tracking-[0.2em] uppercase mb-2 font-medium">
                    {aboutData.jobTitle}
                  </p>
                  <h3 className="text-3xl font-serif text-white tracking-wide">
                    {aboutData.name}
                  </h3>
                </div>
              </div>

              {/* Background decorative element */}
              <div className="absolute -top-4 -left-4 w-full h-full border border-[#ffe992]/10 -z-10 rounded-2xl" />
            </motion.div>

            {/* Text Content (Right) */}
            <motion.div
              variants={itemVariants}
              className="lg:col-span-7 space-y-8"
            >
              {/* Introduction Card */}
              <div className="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
                <p className="text-xl text-white/90 font-light leading-relaxed">
                  {aboutData.introduction}
                </p>
              </div>

              {/* Section: Parcours */}
              {aboutData.parcours && (
                <div className="space-y-4 pl-6 border-l-2 border-[#ffe992]/30">
                  <h2 className="text-lg text-[#ffe992] font-medium tracking-[0.15em] uppercase">
                    {aboutData.parcours.title}
                  </h2>
                  <p className="text-gray-300 leading-relaxed font-light text-justify">
                    {aboutData.parcours.content}
                    {/* Note: If you stored HTML in DB, use dangerouslySetInnerHTML, but text is safer */}
                  </p>
                </div>
              )}

              {/* Section: Expertise */}
              {aboutData.expertise && (
                <div className="space-y-4 pl-6 border-l-2 border-[#ffe992]/30">
                  <h2 className="text-lg text-[#ffe992] font-medium tracking-[0.15em] uppercase">
                    {aboutData.expertise.title}
                  </h2>
                  <p className="text-gray-300 leading-relaxed font-light text-justify">
                    {aboutData.expertise.content}
                  </p>
                </div>
              )}

              {/* Section: Studio */}
              {aboutData.studio && (
                <div className="space-y-4 pl-6 border-l-2 border-[#ffe992]/30">
                  <h2 className="text-lg text-[#ffe992] font-medium tracking-[0.15em] uppercase">
                    {aboutData.studio.title}
                  </h2>
                  <p className="text-gray-300 leading-relaxed font-light text-justify">
                    {aboutData.studio.content}
                  </p>
                </div>
              )}

              {/* Quote Block */}
              {aboutData.quote && (
                <div className="relative py-8 px-8 bg-gradient-to-r from-[#ffe992]/10 to-transparent rounded-r-2xl mt-8 border-l-4 border-[#ffe992]">
                  <p className="text-white italic font-light text-lg leading-relaxed relative z-10">
                    {aboutData.quote}
                  </p>
                </div>
              )}

              {/* Section: Prints */}
              {aboutData.tirages && (
                <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10 mt-8">
                  <h2 className="text-sm text-[#ffe992] font-bold tracking-[0.15em] uppercase mb-3">
                    {aboutData.tirages.title}
                  </h2>
                  <p className="text-gray-400 text-sm leading-relaxed font-light">
                    {aboutData.tirages.content}
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
