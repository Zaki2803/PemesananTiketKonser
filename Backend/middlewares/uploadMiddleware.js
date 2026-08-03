import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Buat folder uploads jika belum ada
const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = 'uploads/misc';

    if (file.fieldname === 'photo') folder = 'uploads/artists';
    if (file.fieldname === 'poster') folder = 'uploads/events';
    if (file.fieldname === 'payment_proof') folder = 'uploads/payments';

    ensureDir(folder);
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp/;
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  const mime = allowed.test(file.mimetype);
  if (ext && mime) {
    cb(null, true);
  } else {
    cb(new Error('Hanya file gambar yang diizinkan (jpeg, jpg, png, webp)'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 } // maks 2MB
});

export default upload;
