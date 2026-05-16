import { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import SEO from "../components/SEO";
import Navbar from "../components/layout/navbar";
import Footer from "../components/layout/Footer";
import { Camera, Images, GraduationCap } from "lucide-react";
import { useCovers } from "../hooks/useCovers";
import "../styles/home.css";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { y: 30, opacity: 0 },
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

interface NavigationCardProps {
  to?: string;
  href?: string;
  image: string;
  alt: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}

const NavigationCard: React.FC<NavigationCardProps> = ({
  to,
  href,
  image,
  alt,
  icon,
  title,
  description,
}) => {
  if (href) {
    return (
      <motion.div
        variants={itemVariants}
        whileHover={{ scale: 1.03, y: -6 }}
        whileTap={{ scale: 0.97 }}
        className="h-48 sm:h-56 lg:h-64 relative drop-shadow-[2px_4px_8px_rgba(255,233,146,0.6)]"
      >
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-[#ffe992]/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1/2 h-4 bg-[#ffe992]/30 blur-lg rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="group h-full block relative overflow-hidden rounded-xl border border-white/10 hover:border-[#ffe992]/50 transition-all duration-500 hover:shadow-[0_0_30px_rgba(255,233,146,0.9),inset_0_0_20px_rgba(255,233,146,0.9)]"
        >
          <div className="absolute inset-0">
            <img
              src={image}
              alt={alt}
              className="w-full h-full object-cover opacity-70 group-hover:opacity-95 group-hover:scale-110 transition-all duration-700 group-hover:brightness-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
          </div>

          <div className="relative h-full flex flex-col justify-end p-5">
            <div className="absolute bottom-0 left-0 right-0 h-22 bg-black/05 backdrop-blur-sm" />
            <div className="relative z-10">
              <div className="p-2.5 rounded-full bg-[#ffe992]/10 backdrop-blur-sm w-fit mb-3 group-hover:bg-[#ffe992]/25 transition-all duration-500 group-hover:shadow-[0_0_15px_rgba(255,233,146,0.5)]">
                {icon}
              </div>
              <h3 className="text-xl font-playfair-sc uppercase tracking-wider text-[#ffe992] mb-1 drop-shadow-[0_4px_12px_rgba(0,0,0,1)] font-bold">
                {title}
              </h3>
              <p className="text-xs text-gray-300 opacity-100 transition-opacity duration-500 drop-shadow-[0_2px_8px_rgba(0,0,0,1)]">
                {description}
              </p>
            </div>
          </div>
        </a>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ scale: 1.03, y: -6 }}
      whileTap={{ scale: 0.97 }}
      className="h-48 sm:h-56 lg:h-64 relative drop-shadow-[2px_4px_8px_rgba(255,233,146,0.6)]"
    >
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-[#ffe992]/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1/2 h-4 bg-[#ffe992]/30 blur-lg rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
      <Link
        to={to!}
        className="group h-full block relative overflow-hidden rounded-xl border border-white/10 hover:border-[#ffe992]/50 transition-all duration-500 hover:shadow-[0_0_30px_rgba(255,233,146,0.9),inset_0_0_20px_rgba(255,233,146,0.9)]"
      >
        <div className="absolute inset-0">
          <img
            src={image}
            alt={alt}
            className="w-full h-full object-cover opacity-70 group-hover:opacity-95 group-hover:scale-110 transition-all duration-700 group-hover:brightness-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
        </div>

        <div className="relative h-full flex flex-col justify-end p-5">
          <div className="absolute bottom-0 left-0 right-0 h-22 bg-black/05 backdrop-blur-sm" />
          <div className="relative z-10">
            <div className="p-2.5 rounded-full bg-[#ffe992]/10 backdrop-blur-sm w-fit mb-3 group-hover:bg-[#ffe992]/25 transition-all duration-500 group-hover:shadow-[0_0_15px_rgba(255,233,146,0.5)]">
              {icon}
            </div>
            <h3 className="text-xl font-playfair-sc uppercase tracking-wider text-[#ffe992] mb-1 drop-shadow-[0_4px_12px_rgba(0,0,0,1)] font-bold">
              {title}
            </h3>
            <p className="text-xs text-gray-300 opacity-100 transition-opacity duration-500 drop-shadow-[0_2px_8px_rgba(0,0,0,1)]">
              {description}
            </p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default function Services() {
  const { covers } = useCovers();

  useEffect(() => {
    document.title = "Services | Fabien Licata";
  }, []);

  const servicesCover = covers.services || "/images/photo3.jpg";

  return (
    <div className="home-page min-h-screen flex flex-col bg-[#0a0a10]">
      <SEO
        title="Services | Fabien Licata"
        description="Découvrez mes services de photographie : prestations professionnelles, reportages publics et privés, et formations."
        type="website"
        keywords={[
          "photographe professionnel",
          "services",
          "mariage",
          "shooting",
          "reportage",
          "formation",
        ]}
      />

      <Navbar />

      {/* Conteneur de l'image de fond et de la texture */}
      <div className="hero-image-container fixed inset-0 z-0">
        <img
          src={covers.backgroundSite || "/images/photo3.jpg"}
          alt="Services"
          className="hero-image w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a10]/80 via-transparent to-[#0a0a10]" />
      </div>

      {/* Effet de scintillement/éblouissement dans le coin supérieur gauche */}
      {/* <motion.div
        className="fixed top-0 left-0 w-96 h-96 pointer-events-none z-[5]"
        initial={{ opacity: 0.3 }}
        animate={{
          opacity: [0.6, 0.9, 0.6],
          scale: [1, 1.6, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <div
          className="absolute top-0 left-0 w-full h-full blur-3xl"
          style={{
            background:
              "radial-gradient(circle at top left, rgba(255, 233, 146, 0.2), rgba(255, 233, 146, 0.05), transparent)",
          }}
        />
        <div
          className="absolute top-0 left-0 w-3/4 h-3/4 blur-2xl"
          style={{
            background:
              "radial-gradient(circle at top left, rgba(255, 255, 255, 0.1), transparent)",
          }}
        />
      </motion.div> */}

      {/* Accent géométrique décoratif */}
      <div className="geometric-accent fixed top-0 left-0 w-full h-full pointer-events-none z-0 opacity-30" />

      {/* Contenu principal */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20 pt-32 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-7xl font-playfair-sc uppercase tracking-wider text-[#ffe992] mb-4 drop-shadow-[0_4px_12px_rgba(255,233,146,0.8)] font-bold">
            Services
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Découvrez mes prestations professionnelles, explorez mes reportages
            ou rejoignez mes formations
          </p>
        </motion.div>

        <motion.nav
          className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <NavigationCard
            to="/prestations"
            image={servicesCover}
            alt="Prestations"
            icon={<Camera className="w-6 h-6 text-[#ffe992]" />}
            title="Prestations"
            description="Mariage, immobilier, festive, formation groupe ou individuel, reportages"
          />

          <NavigationCard
            to="/reportages"
            image={servicesCover}
            alt="Reportages"
            icon={<Images className="w-6 h-6 text-[#ffe992]" />}
            title="Reportages"
            description="Accès aux reportages déjà réalisés, accès libre ou sécurisé"
          />

          <NavigationCard
            href="https://planning-photo.vercel.app/"
            image={servicesCover}
            alt="Formations"
            icon={<GraduationCap className="w-6 h-6 text-[#ffe992]" />}
            title="Formations"
            description="Accès au planning pour réserver vos créneaux de formation"
          />
        </motion.nav>
      </main>

      <Footer />
    </div>
  );
}
