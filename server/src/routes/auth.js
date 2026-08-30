import { Router } from 'express';
import {
  register,
  login,
  logout,
  me,
  updateProfile,
  changePassword,
  registerValidators,
  loginValidators,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

// Public routes
router.post('/register', registerValidators, register);
router.post('/login',    loginValidators,    login);
router.post('/logout',                       logout);

// Protected routes
router.get('/me',              protect, me);
router.patch('/me',            protect, updateProfile);
router.patch('/me/password',   protect, changePassword);

export default router;
