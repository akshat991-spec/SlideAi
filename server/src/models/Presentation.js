import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

// ── Slide sub-schema ───────────────────────────────────────────────
const slideSchema = new mongoose.Schema(
  {
    title: { type: String, default: 'Untitled Slide' },
    subtitle: { type: String, default: '' },
    content: { type: String, default: '' },
    bullets: { type: [String], default: [] },
    imagePrompt: { type: String, default: '' },
    layout: {
      type: String,
      enum: ['title', 'content', 'two-column', 'image-left', 'image-right', 'blank', 'chart'],
      default: 'content',
    },
    notes: { type: String, default: '' },
    order: { type: Number, default: 0 },
  },
  { _id: true, timestamps: false }
);

// ── Presentation schema ────────────────────────────────────────────
const presentationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
      default: 'Untitled Presentation',
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    slides: {
      type: [slideSchema],
      default: [],
    },

    // Generation metadata
    prompt: { type: String, default: '' },
    audience: { type: String, default: 'General' },
    purpose: { type: String, default: 'Inform' },
    tone: { type: String, default: 'Professional' },
    visualStyle: { type: String, default: 'Minimal' },
    presentationType: { type: String, default: 'Pitch Deck' },
    language: { type: String, default: 'English (US)' },

    // Theme
    theme: {
      colorTheme: { type: String, default: 'indigo' },
      fontFamily: { type: String, default: 'Inter' },
    },

    // Sharing
    shareId: { type: String, default: null, index: true, sparse: true },
    isShared: { type: Boolean, default: false },

    // Soft delete
    isFavorite: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

// ── Index for efficient queries ────────────────────────────────────
presentationSchema.index({ owner: 1, isDeleted: 1, updatedAt: -1 });

// ── Helpers ────────────────────────────────────────────────────────
presentationSchema.methods.generateShareId = function () {
  this.shareId = uuidv4();
  this.isShared = true;
  return this.shareId;
};

export default mongoose.model('Presentation', presentationSchema);
