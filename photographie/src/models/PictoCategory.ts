import mongoose, { Schema, Document } from "mongoose";

export interface IPictoFormat {
  name: string;
  price: number;
  width?: number;
  height?: number;
}

export interface IPictoSupport {
  name: string;
  description?: string;
  technicalSpecs?: Record<string, any>;
  formats: IPictoFormat[];
}

export interface IPictoProduct {
  name: string;
  slug: string;
  description?: string;
  supports: IPictoSupport[];
}

export interface IPictoCategory extends Document {
  name: string;
  slug: string;
  products: IPictoProduct[];
}

const PictoFormatSchema = new Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  width: Number,
  height: Number,
});

const PictoSupportSchema = new Schema({
  name: { type: String, required: true },
  description: String,
  technicalSpecs: { type: Map, of: Schema.Types.Mixed },
  formats: [PictoFormatSchema],
});

const PictoProductSchema = new Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true },
  description: String,
  supports: [PictoSupportSchema],
});

const PictoCategorySchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    products: [PictoProductSchema],
  },
  { timestamps: true }
);

export default mongoose.models.PictoCategory ||
  mongoose.model<IPictoCategory>("PictoCategory", PictoCategorySchema);
