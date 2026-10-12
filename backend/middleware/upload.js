const multer = require('multer');
const path   = require('path');

const ALLOWED_TYPES = /jpg|jpeg|png|webp/;
const MAX_SIZE_MB   = 5;

// Memory storage — files go to Cloudinary, not disk
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const ext = ALLOWED_TYPES.test(
    path.extname(file.originalname).toLowerCase()
  );
  if (ext) cb(null, true);
  else     cb(new Error('Only JPG, PNG and WEBP images are allowed'));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_SIZE_MB * 1024 * 1024 },
});

module.exports = upload;