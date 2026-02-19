const mongoose = require("mongoose");

const AboutSchema = new mongoose.Schema(
  {
    image: {
      type: String, // URL de l'image principale
      default: "/images/fabien.jpg",
    },
    jobTitle: {
      type: String,
      default: "Photographe Professionnel",
    },
    name: {
      type: String,
      default: "Fabien Licata",
    },
    introduction: {
      type: String,
      default:
        "Photographe professionnel spécialisé dans les événements, portraits et galeries artistiques. Transformez vos souvenirs en véritables œuvres d'art.",
    },
    parcours: {
      title: { type: String, default: "Mon Parcours" },
      content: {
        type: String,
        default:
          "Plongé dans l'univers captivant de la photographie depuis mon plus jeune âge, je suis un photographe passionné établi à Pignans dans le Var. Tantôt reporter-photographe, photographe de mode, photographe animalier, mon métier recouvre une multitude de possibilités !",
      },
    },
    expertise: {
      title: { type: String, default: "Polyvalence & Expertise" },
      content: {
        type: String,
        default:
          "En tant que professionnel, je maîtrise l’art d’immortaliser un visage, un sportif en action, une nouvelle marque, un artiste sur scène, un événement festif ou politique (concerts, festivals, compétitions sportives), ou la découverte de votre commune, sans oublier les événements privés (mariage, baptême, repas de famille, etc.).",
      },
    },
    studio: {
      title: { type: String, default: "Studio Mobile" },
      content: {
        type: String,
        default:
          "Je pratique également la photographie de studio, capturant l'essence d'un portrait seul, d'un duo, ou d'une famille. Mon studio d'art (celui-ci étant mobile) est un lieu où la créativité s'épanouit, que ce soit pour des séances de mode, des compositions artistiques destinées à l'exposition, des packshots produits et bien d'autres projets.",
      },
    },
    quote: {
      type: String,
      default:
        '"Chaque instant capturé est une histoire à raconter, une émotion à partager. Bienvenue dans mon univers photographique."',
    },
    tirages: {
      title: { type: String, default: "Tirages d'Art" },
      content: {
        type: String,
        default:
          "Offrez-vous des impressions uniques en commandant les tirages de mes photographies. Le prix englobe non seulement les coûts de laboratoire, mais également ma contribution d'artiste, garantissant ainsi une œuvre authentique et exclusive à votre collection.",
      },
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("About", AboutSchema);
