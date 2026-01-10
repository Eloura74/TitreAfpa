import mongoose from "mongoose";
import PictoCategory from "../src/models/PictoCategory";
import pictoData from "../src/data/picto_data_seed.json";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/photographie";

async function seedPictoData() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected.");

    console.log("Clearing existing Picto data...");
    await PictoCategory.deleteMany({});

    console.log("Seeding new Picto data...");
    await PictoCategory.insertMany(pictoData);

    console.log("Seed completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding data:", error);
    process.exit(1);
  }
}

seedPictoData();
