import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../components/layout/navbar";
import Footer from "../components/layout/Footer";
import { API_URL } from "../config/api";

export default function CGV() {
  const [contenu, setContenu] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCGV();
  }, []);

  const loadCGV = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/mentions-legales`);
      if (res.data.success) {
        setContenu(res.data.cgv || "");
      }
    } catch (err) {
      console.error("Erreur chargement CGV:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      <main className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl sm:text-5xl font-bold mb-8 bg-gradient-to-r from-[#d6c487] via-[#ffe992] to-[#c9b36f] bg-clip-text text-transparent">
              Conditions Générales de Vente
            </h1>

            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ffe992]"></div>
              </div>
            ) : (
              <div
                className="space-y-8 text-gray-300 prose prose-invert prose-headings:text-[#ffe992] prose-a:text-[#ffe992] prose-a:hover:underline max-w-none"
                dangerouslySetInnerHTML={{ __html: contenu }}
              />
            )}
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
