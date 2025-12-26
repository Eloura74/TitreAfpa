import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, ShoppingBag, CreditCard } from "lucide-react";
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
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-yellow-500/30 flex flex-col">
      <Helmet>
        <title>Mon Panier | Fabien Licata</title>
      </Helmet>

      <Navbar />

      <main className="flex-grow pt-32 pb-20 px-4 md:px-8 max-w-7xl mx-auto w-full">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="space-y-12"
        >
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-3xl md:text-5xl font-thin tracking-[0.2em] uppercase text-yellow-500">
              Mon <span className="text-yellow-500">Panier</span>
            </h1>
            <div className="w-16 h-[1px] bg-yellow-500 mx-auto" />
          </div>

          {articles.length === 0 ? (
            <motion.div
              variants={itemVariants}
              className="text-center py-20 space-y-6"
            >
              <ShoppingBag size={64} className="mx-auto text-gray-600" />
              <p className="text-gray-400 text-lg font-light">
                Votre panier est vide pour le moment.
              </p>
              <Link to="/galerie">
                <button className="px-8 py-3 border border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black transition-all duration-300 rounded-sm uppercase tracking-widest text-sm">
                  Découvrir la galerie
                </button>
              </Link>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Liste des articles */}
              <div className="lg:col-span-2 space-y-6">
                <AnimatePresence mode="popLayout">
                  {articles.map((article) => (
                    <motion.div
                      key={article.id}
                      variants={itemVariants}
                      layout
                      className="group relative bg-[#121218] border border-white/5 p-4 rounded-sm flex flex-col sm:flex-row gap-6 items-center hover:border-yellow-500/30 transition-colors duration-300"
                    >
                      {/* Image */}
                      <div className="relative w-full sm:w-32 h-32 flex-shrink-0 overflow-hidden rounded-sm">
                        <img
                          src={getImageUrl(article.image)}
                          alt={article.nom}
                          className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-110"
                        />
                      </div>

                      {/* Infos */}
                      <div className="flex-grow text-center sm:text-left space-y-2">
                        <h3 className="text-lg font-light tracking-wide text-white uppercase">
                          {article.nom}
                        </h3>
                        <div className="text-sm text-gray-400 space-y-1">
                          {article.format && <p>Format : {article.format}</p>}
                          <p>Quantité : {article.quantite}</p>
                        </div>
                      </div>

                      {/* Prix & Actions */}
                      <div className="flex flex-col items-center sm:items-end gap-4">
                        <span className="text-xl font-normal text-yellow-500">
                          {article.prix} €
                        </span>
                        <button
                          onClick={() => retirerArticle(article.id)}
                          className="text-gray-500 hover:text-red-400 transition-colors p-2"
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
                className="lg:col-span-1 h-fit bg-[#121218] border border-white/5 p-8 rounded-sm space-y-8 sticky top-32"
              >
                <h2 className="text-xl font-light tracking-[0.15em] uppercase text-white border-b border-white/10 pb-4">
                  Récapitulatif
                </h2>

                <div className="space-y-4 text-sm">
                  <div className="flex justify-between text-gray-400">
                    <span>Sous-total</span>
                    <span>{total.toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Livraison</span>
                    <span className="text-xs italic">Calculé à l'étape suivante</span>
                  </div>
                  <div className="pt-4 border-t border-white/10 flex justify-between items-end">
                    <span className="text-white font-light uppercase tracking-wide">
                      Total
                    </span>
                    <span className="text-2xl font-normal text-yellow-500">
                      {total.toFixed(2)} €
                    </span>
                  </div>
                </div>

                <div className="space-y-4 pt-4">
                  <Link to="/checkout" className="block">
                    <button className="w-full py-4 bg-yellow-500 text-black font-medium uppercase tracking-widest hover:bg-yellow-400 transition-colors duration-300 flex items-center justify-center gap-2 rounded-sm">
                      Paiement <CreditCard size={18} />
                    </button>
                  </Link>
                  
                  <button
                    onClick={viderPanier}
                    className="w-full py-2 text-xs text-gray-500 hover:text-white uppercase tracking-widest transition-colors"
                  >
                    Vider le panier
                  </button>

                  <Link to="/galerie" className="block text-center">
                    <span className="text-xs text-yellow-500/80 hover:text-yellow-500 uppercase tracking-widest border-b border-transparent hover:border-yellow-500 transition-all pb-1">
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
