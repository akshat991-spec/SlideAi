import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import {
  list,
  get,
  create,
  update,
  remove,
  addSlide,
  updateSlide,
  deleteSlide,
  reorderSlides,
  toggleFavorite,
  enableShare,
  disableShare,
  aiEnhanceSlide,
  exportPdf,
  exportPptx,
} from '../controllers/presentationController.js';

const router = Router();

// All presentation routes require authentication
router.use(protect);

// CRUD
router.get('/',    list);
router.post('/',   create);
router.get('/:id', get);
router.patch('/:id', update);
router.delete('/:id', remove);

// Slide operations
router.post('/:id/slides',                       addSlide);
router.patch('/:id/slides/reorder',              reorderSlides);   // must be before /:slideId
router.patch('/:id/slides/:slideId',             updateSlide);
router.delete('/:id/slides/:slideId',            deleteSlide);

// AI operations
router.post('/:id/ai/enhance-slide', aiEnhanceSlide);

// Favorites
router.patch('/:id/favorite', toggleFavorite);

// Sharing
router.post('/:id/share',   enableShare);
router.delete('/:id/share', disableShare);

// Export
router.get('/:id/export/pdf',  exportPdf);
router.get('/:id/export/pptx', exportPptx);

export default router;
