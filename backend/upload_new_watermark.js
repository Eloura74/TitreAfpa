require("dotenv").config();
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const watermarkPath =
  "A:/Dev/ProjetStage/photographie/public/images/watermark.png";

cloudinary.uploader
  .upload(watermarkPath, {
    public_id: "watermark_signature",
    overwrite: true,
    transformation: [{ width: 400, crop: "scale" }],
  })
  .then((result) => {
    console.log("Upload successful:", result);
  })
  .catch((error) => {
    console.error("Upload failed:", error);
  });
