require("dotenv").config();
const cloudinary = require("cloudinary").v2;
const path = require("path");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const logoPath =
  "C:/Users/faber/.gemini/antigravity/brain/7d92f65c-2fe5-4ba6-ad0e-4869b8a7b450/uploaded_image_1767993037290.png";

cloudinary.uploader
  .upload(logoPath, {
    public_id: "watermark_logo",
    overwrite: true,
    transformation: [
      { width: 500, crop: "scale" }, // Resize if too big, though we'll resize in the overlay too
    ],
  })
  .then((result) => {
    console.log("Upload successful:", result);
  })
  .catch((error) => {
    console.error("Upload failed:", error);
  });
