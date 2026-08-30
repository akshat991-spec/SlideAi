import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { upload, uploadFile } from '../controllers/uploadController.js';

const router = Router();

// POST /api/upload — single file upload (protected)
router.post('/', protect, upload.single('file'), uploadFile);

export default router;
