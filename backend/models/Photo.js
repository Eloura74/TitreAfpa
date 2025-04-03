import mongoose from "mongoose";

const PhotoSchema = new mongoose.Schema({
  src: { type: String, required: true },
  alt: { type: String, required: true },
  titre: { type: String, required: true },
  description: { type: String, required: true },
  prix: { type: Number, required: true },
  categorie: { type: String, required: true },
});

export default mongoose.model("Photo", PhotoSchema);
