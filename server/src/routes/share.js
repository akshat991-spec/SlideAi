import { Router } from 'express';
import { getShared } from '../controllers/presentationController.js';

const router = Router();

// GET /api/share/:shareId — publicly accessible shared presentation
router.get('/:shareId', getShared);

export default router;
