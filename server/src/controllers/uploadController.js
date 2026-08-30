import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';

// Store files in memory (suitable for serverless/Vercel)
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowed = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
  ];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF, DOCX, and TXT files are allowed'), false);
  }
};

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter,
});

/**
 * POST /api/upload
 * Accepts a single file and returns a fileId.
 * In production, persist to S3/GCS/Cloudinary and store the URL.
 */
export async function uploadFile(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file provided' });
    }

    // In production: upload req.file.buffer to cloud storage
    let textContent = '';
    if (req.file.mimetype === 'text/plain') {
      textContent = req.file.buffer.toString('utf-8').slice(0, 50000); // Up to 50KB text
    }

    res.json({
      fileId,
      originalName: req.file.originalname,
      size: req.file.size,
      mimeType: req.file.mimetype,
      text: textContent,
      message: 'File uploaded successfully',
    });
  } catch (err) {
    next(err);
  }
}
