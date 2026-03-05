import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../lib/cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "challenge-designs",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 1920, crop: "limit" }], 
  } as any,
});

export const uploadDesignImages = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, 
}).array("designImages", 5); 