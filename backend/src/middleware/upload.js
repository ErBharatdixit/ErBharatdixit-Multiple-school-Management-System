import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const storage = new CloudinaryStorage({
      cloudinary: cloudinary,
      params: {
            folder: "school_assignments",
            allowed_formats: ["jpg", "png", "jpeg", "pdf", "doc", "docx"],
            resource_type: "auto", // Allow both images and raw files (like PDFs)
      },
});

const upload = multer({ storage });

export default upload;
