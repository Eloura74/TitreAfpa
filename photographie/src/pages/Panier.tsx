import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, ShoppingBag, CreditCard, ArrowRight } from "lucide-react";
import { Helmet } from "react-helmet-async";
import Navbar from "../components/layout/navbar";
import Footer from "../components/layout/Footer";
import { usePanier } from "../store/panierContext";
import { API_URL } from "../config/api";

const Panier: React.FC = () => {
  const { articles, total, viderPanier, retirerArticle } = usePanier();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 },
    },
    exit: { x: -50, opacity: 0, transition: { duration: 0.3 } },
  };

  // Helper pour l'URL de l'image
  const getImageUrl = (image?: string) => {
    if (!image) return "/images/placeholder.jpg";
    if (image.startsWith("http")) return image;
    if (image.startsWith("/uploads/")) return `${API_URL}${image}`;
    if (image.startsWith("/images/")) return image;
    return `/images/${image}`;
  };

  return (
    <div className="min-h-screen !mt-6 bg-[#0a0a10] text-white font-sans selection:bg-[#ffe992]/30 flex flex-col">
      <Helmet>
        <title>Mon Panier | Fabien Licata</title>
      </Helmet>

      <Navbar />

      {/* Geometric Accents */}
      <div className="geometric-accent fixed top-0 left-0 w-full h-full pointer-events-none z-0 opacity-30" />

      <main className="flex-grow pt-20 pb-20 px-4 md:px-8 max-w-7xl mx-auto w-full relative z-10">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="space-y-12"
        >
          {/* Header */}
          <div className="flex flex-col items-center mb-8">
            <h1 className="hero-title !mb-0 !ml-0 text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-center">
              <span className="hero-title-gradient bg-clip-text text-transparent bg-gradient-to-r from-[#d6c487] via-[#ffe992] to-[#c9b36f]">
                Mon Panier
              </span>
            </h1>
          </div>

          {articles.length === 0 ? (
            <motion.div
              variants={itemVariants}
              className="text-center py-20 space-y-8 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 max-w-2xl mx-auto"
            >
              <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                <ShoppingBag size={48} className="text-[#ffe992]/50" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-serif text-white">
                  Votre panier est vide
                </h2>
                <p className="text-gray-400 font-light">
                  Il semblerait que vous n'ayez pas encore trouvé votre bonheur.
                </p>
              </div>
              <Link to="/galerie">
                <button className="px-8 py-3 bg-[#ffe992] text-black font-medium hover:bg-white transition-all duration-300 rounded-full uppercase tracking-widest text-sm flex items-center gap-2 mx-auto">
                  Découvrir la galerie <ArrowRight size={16} />
                </button>
              </Link>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Liste des articles */}
              <div className="lg:col-span-2 space-y-4">
                <AnimatePresence mode="popLayout">
                  {articles.map((article) => (
                    <motion.div
                      key={article.id}
                      variants={itemVariants}
                      layout
                      className="group relative bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-2xl flex flex-col sm:flex-row gap-6 items-center hover:bg-white/10 hover:border-[#ffe992]/30 transition-all duration-300"
                    >
                      {/* Image */}
                      <div className="relative w-full sm:w-32 h-32 flex-shrink-0 overflow-hidden rounded-xl">
                        <img
                          src={getImageUrl(article.image)}
                          alt={article.nom}
                          className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-110"
                        />
                      </div>

                      {/* Infos */}
                      <div className="flex-grow text-center sm:text-left space-y-2">
                        <h3 className="text-lg font-serif tracking-wide text-white">
                          {article.nom}
                        </h3>
                        <div className="text-sm text-gray-400 space-y-1 font-light">
                          {article.format && (
                            <p>
                              Format :{" "}
                              <span className="text-white/80">
                                {article.format}
                              </span>
                            </p>
                          )}
                          <p>
                            Quantité :{" "}
                            <span className="text-white/80">
                              {article.quantite}
                            </span>
                          </p>
                        </div>
                      </div>

                      {/* Prix & Actions */}
                      <div className="flex flex-col items-center sm:items-end gap-4">
                        <span className="text-xl font-medium text-[#ffe992]">
                          {article.prix} €
                        </span>
                        <button
                          onClick={() => retirerArticle(article.id)}
                          className="text-white/40 hover:text-red-400 transition-colors p-2 rounded-full hover:bg-white/5"
                          title="Retirer du panier"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Résumé de commande */}
              <motion.div
                variants={itemVariants}
                className="lg:col-span-1 h-fit bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-2xl space-y-8 sticky top-32 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]"
              >
                <h2 className="text-xl font-serif tracking-wide text-white border-b border-white/10 pb-4">
                  Récapitulatif
                </h2>

                <div className="space-y-4 text-sm font-light">
                  <div className="flex justify-between text-gray-400">
                    <span>Sous-total</span>
                    <span className="text-white">{total.toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Livraison</span>
                    <span className="text-xs italic text-[#ffe992]/80">
                      Calculé à l'étape suivante
                    </span>
                  </div>
                  <div className="pt-4 border-t border-white/10 flex justify-between items-end">
                    <span className="text-white font-medium uppercase tracking-wide">
                      Total
                    </span>
                    <span className="text-3xl font-serif text-[#ffe992]">
                      {total.toFixed(2)} €
                    </span>
                  </div>
                </div>

                <div className="space-y-4 pt-4">
                  <Link to="/checkout" className="block">
                    <button className="w-full py-4 bg-[#ffe992] text-black font-bold uppercase tracking-widest hover:bg-white transition-colors duration-300 flex items-center justify-center gap-2 rounded-xl shadow-lg shadow-[#ffe992]/20">
                      Paiement <CreditCard size={18} />
                    </button>
                  </Link>

                  <button
                    onClick={viderPanier}
                    className="w-full py-2 text-xs text-gray-500 hover:text-red-400 uppercase tracking-widest transition-colors"
                  >
                    Vider le panier
                  </button>

                  <Link to="/galerie" className="block text-center">
                    <span className="text-xs text-[#ffe992]/60 hover:text-[#ffe992] uppercase tracking-widest border-b border-transparent hover:border-[#ffe992] transition-all pb-1">
                      Continuer mes achats
                    </span>
                  </Link>
                </div>
              </motion.div>
            </div>
          )}
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default Panier;
