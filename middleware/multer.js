const multer = require("multer");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

// Allowed file types based on usage
const fileTypes = {
  images: /jpeg|jpg|png/,
  documents: /pdf|doc|docx/,
  videos: /mp4|mov|avi|mkv/,
  all: /jpeg|jpg|png|mp4|mov|avi|mkv|pdf|doc|docx/,
  templates: /jpeg|jpg|png|pdf|doc|docx/  // Templates formats
};

// Dynamic file filter based on usage
const getFileFilter = (usage) => {
  return (req, file, cb) => {
    const extname = fileTypes[usage].test(path.extname(file.originalname).toLowerCase());
    const mimetype = fileTypes[usage].test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error(`Invalid file type. Allowed formats: ${fileTypes[usage]}`));
  };
};

// Local storage configuration
const getLocalStorage = (folder) =>
  multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = path.join(`./uploads/${folder}`);
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  });

// Upload admin image middleware (JPEG, JPG, PNG only)
const uploadAdminImage = (req, res, next) => {
  try {
    const storage = getLocalStorage("admin_images");
    const upload = multer({
      storage,
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
      fileFilter: getFileFilter("images"),
    }).single("admin_image");

    upload(req, res, (err) => {
      if (err) return res.status(400).json({ message: err.message });
      next();
    });
  } catch (error) {
    res.status(500).json({ message: "Error in file upload configuration." });
  }
};

// Upload profile image middleware (JPEG, JPG, PNG only)
const uploadProfileImage = (req, res, next) => {
  try {
    const storage = getLocalStorage("profile_images");
    const upload = multer({
      storage,
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
      fileFilter: getFileFilter("images"),
    }).single("profile_image");

    upload(req, res, (err) => {
      if (err) return res.status(400).json({ message: err.message });
      next();
    });
  } catch (error) {
    res.status(500).json({ message: "Error in file upload configuration." });
  }
};

// Add this in fileUploadMiddleware.js

const uploadBusinessProfileMedia = (req, res, next) => {
  try {
    const storage = getLocalStorage("media_gallery");

    const upload = multer({
      storage,
      limits: { fileSize: 100 * 1024 * 1024 },
      files: 6, 
      fileFilter: getFileFilter("all"),
    });

    // Define dynamic fields: support up to 5 business profiles
    const maxProfiles = 5;
    const fields = [
      { name: "profile_image", maxCount: 1 },
      { name: "media_gallery", maxCount: 5 },
    ];

    for (let i = 0; i < maxProfiles; i++) {
      fields.push({ name: `business_profile_image_${i}`, maxCount: 1 });
      fields.push({ name: `media_gallery_${i}`, maxCount: 5 });
    }

    upload.fields(fields)(req, res, (err) => {
      if (err) return res.status(400).json({ message: err.message });
      next();
    });
  } catch (error) {
    console.error("Multer config error:", error);
    res.status(500).json({ message: "Upload config error." });
  }
};

const uploadBusinessProfile = (req, res, next) => {
  try {
    const storage = getLocalStorage("media_gallery");
    const upload = multer({ storage }).any();

    // const upload = multer({
    //   storage,
    //   limits: { fileSize: 30 * 1024 * 1024 }, // 30MB per file
    //   fileFilter: getFileFilter("all"),
    // });

    const fields = [
      { name: "business_profile_image", maxCount: 1 },
      { name: "media_gallery", maxCount: 10 },
    ];

    upload(req, res, (err) => {
    if (err) return res.status(400).json({ message: err.message });
    next();
  });
  } catch (error) {
    console.error("Multer config error:", error);
    res.status(500).json({ message: "Upload config error." });
  }
};


module.exports = {
  uploadAdminImage,
  uploadProfileImage,
  uploadBusinessProfileMedia,
  uploadBusinessProfile
};