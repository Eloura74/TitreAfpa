import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Navbar from "../components/layout/navbar";
import Footer from "../components/layout/Footer";
import PageTitle from "../components/ui/PageTitle";
import { API_URL } from "../config/api";
import { Loader2, ZoomIn } from "lucide-react";
import ImageZoomModal from "../components/ui/ImageZoomModal";

interface ShowcaseImage {
  _id: string;
  image: string;
  titre: string;
  description?: string;
  ordre: number;
}

interface GraphismeDescription {
  _id: string;
  titre: string;
  description: string;
}

export default function DecouvrirGraphisme() {
  const [images, setImages] = useState<ShowcaseImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<ShowcaseImage | null>(
    null,
  );
  const [description, setDescription] = useState<GraphismeDescription | null>(
    null,
  );

  useEffect(() => {
    document.title = "Découvrir le Graphisme | Fabien Licata";
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [showcaseResponse, descriptionResponse] = await Promise.all([
          fetch(`${API_URL}/api/graphisme-showcase`),
          fetch(`${API_URL}/api/graphisme-description`),
        ]);

        if (showcaseResponse.ok) {
          const data = await showcaseResponse.json();
          setImages(data);
        }

        if (descriptionResponse.ok) {
          const data = await descriptionResponse.json();
          setDescription(data);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getImageUrl = (image: string) => {
    if (!image) return "/images/placeholder.jpg";
    if (image.startsWith("http")) return image;
    if (image.startsWith("/uploads/")) return `${API_URL}${image}`;
    if (image.startsWith("/images/")) return image;
    return `/images/${image}`;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 50,
        damping: 20,
      },
    },
  };

  return (
    <div className="min-h-screen bg-[#0a0a10] text-white font-sans selection:bg-[#ffe992]/30 flex flex-col">
      <Navbar />

      <div className="geometric-accent fixed top-0 left-0 w-full h-full pointer-events-none z-0 opacity-30" />

      <main className="flex-1 relative z-10 pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <PageTitle
            title="Découvrir le Graphisme"
            subtitle="Qu'est-ce que le graphisme ? Explorez notre vision créative"
            showSeparator
          />

          {loading ? (
            <div className="flex justify-center items-center min-h-[400px]">
              <Loader2 className="w-12 h-12 text-[#ffe992] animate-spin" />
            </div>
          ) : images.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-400 text-lg">
                Aucune image de présentation disponible pour le moment.
              </p>
            </div>
          ) : (
            <motion.div
              className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {images.map((showcase) => (
                <motion.div
                  key={showcase._id}
                  variants={itemVariants}
                  className="group relative overflow-hidden rounded-2xl border border-white/10 hover:border-[#ffe992]/50 transition-all duration-500 hover:shadow-[0_0_40px_rgba(255,233,146,0.4)] cursor-pointer"
                  onClick={() => setSelectedImage(showcase)}
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={getImageUrl(showcase.image)}
                      alt={showcase.titre}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="bg-[#ffe992]/90 p-4 rounded-full">
                        <ZoomIn className="w-8 h-8 text-black" />
                      </div>
                    </div>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 to-transparent">
                    <h3 className="text-2xl font-playfair-sc uppercase tracking-wider text-[#ffe992] mb-2 font-bold drop-shadow-[0_0_20px_rgba(255,233,146,0.8)]">
                      {showcase.titre}
                    </h3>
                    {showcase.description && (
                      <p className="text-gray-300 text-sm leading-relaxed">
                        {showcase.description}
                      </p>
                    )}
                  </div>

                  <div className="absolute top-4 right-4 bg-[#ffe992]/20 backdrop-blur-sm px-3 py-1 rounded-full">
                    <span className="text-[#ffe992] text-xs font-bold">
                      {showcase.ordre === 1 ? "Image 1" : "Image 2"}
                    </span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="mt-16 text-center"
          >
            <div className="max-w-3xl mx-auto backdrop-blur-sm bg-black/20 border border-[#ffe992]/15 rounded-2xl p-8">
              <h2 className="text-2xl font-playfair-sc text-[#ffe992] mb-4 uppercase tracking-wider">
                {description?.titre || "Le Graphisme selon Fabien"}
              </h2>
              <p className="text-gray-300 leading-relaxed">
                {description?.description ||
                  "Le graphisme est l'art de communiquer visuellement des idées, des émotions et des messages à travers la composition, la typographie, les couleurs et les formes. C'est une discipline qui allie créativité et technique pour créer des visuels impactants et mémorables."}
              </p>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />

      <ImageZoomModal
        isOpen={selectedImage !== null}
        onClose={() => setSelectedImage(null)}
        imageUrl={selectedImage ? getImageUrl(selectedImage.image) : ""}
        imageAlt={selectedImage?.titre || ""}
        titre={selectedImage?.titre}
      />
    </div>
  );
}
