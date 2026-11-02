require('dotenv').config();
const cloudinary = require('cloudinary').v2;
const fs         = require('fs');
const path       = require('path');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ── Path to your Angular assets folder ──────────────────────────
// Adjust this path to point from your backend folder to your assets
const ASSETS_DIR = path.join(__dirname, '../../frontend/src/assets');

// ── Allowed image extensions ─────────────────────────────────────
const ALLOWED = ['.jpg', '.jpeg', '.png', '.webp', '.svg', '.gif'];

// ── Recursively get all image files ─────────────────────────────
function getAllFiles(dir, fileList = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      getAllFiles(fullPath, fileList);
    } else if (ALLOWED.includes(path.extname(entry.name).toLowerCase())) {
      fileList.push(fullPath);
    }
  }

  return fileList;
}

// ── Upload a single file ─────────────────────────────────────────
async function uploadFile(filePath) {
  // Build the Cloudinary public_id from the relative path
  // e.g. assets/models/model-8.jpg → models/model-8
  const relative = path.relative(ASSETS_DIR, filePath);
  const publicId = relative
    .replace(/\\/g, '/')                          // Windows → forward slashes
    .replace(/\.[^/.]+$/, '');                    // remove extension

  try {
    const result = await cloudinary.uploader.upload(filePath, {
      public_id:    publicId,
      overwrite:    true,
      resource_type: 'image',
    });
    console.log(`✅ ${publicId} → ${result.secure_url}`);
    return { publicId, url: result.secure_url };
  } catch (err) {
    console.error(`❌ Failed: ${publicId} —`, err.message);
    return null;
  }
}

// ── Main ─────────────────────────────────────────────────────────
async function run() {
  console.log(`\n📁 Scanning: ${ASSETS_DIR}\n`);

  if (!fs.existsSync(ASSETS_DIR)) {
    console.error('Assets folder not found. Check the ASSETS_DIR path.');
    process.exit(1);
  }

  const files = getAllFiles(ASSETS_DIR);
  console.log(`Found ${files.length} image(s) to upload.\n`);

  const results = [];
  for (const file of files) {
    const result = await uploadFile(file);
    if (result) results.push(result);
  }

  // ── Save a reference map so you know the public IDs ──────────
  const mapPath = path.join(__dirname, 'cloudinary-map.json');
  fs.writeFileSync(mapPath, JSON.stringify(results, null, 2));

  console.log(`\n✅ Done. ${results.length}/${files.length} uploaded.`);
  console.log(`📄 Public ID map saved to: ${mapPath}\n`);
}

run();