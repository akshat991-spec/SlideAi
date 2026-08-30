import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

// ── Metric sub-schema (for stats/KPI slides) ───────────────────────
const metricSchema = new mongoose.Schema(
  {
    label: { type: String, default: '' },
    value: { type: String, default: '' },
    change: { type: String, default: '' },
  },
  { _id: false }
);

// ── Infographic item sub-schema ───────────────────────────────────
const infographicItemSchema = new mongoose.Schema(
  {
    step: { type: Number, default: 1 },
    title: { type: String, default: '' },
    description: { type: String, default: '' },
    icon: { type: String, default: '' },
    value: { type: String, default: '' },
  },
  { _id: false }
);

// ── Slide sub-schema ───────────────────────────────────────────────
const slideSchema = new mongoose.Schema(
  {
    title: { type: String, default: 'Untitled Slide' },
    subtitle: { type: String, default: '' },
    content: { type: String, default: '' },
    bullets: { type: [String], default: [] },
    imageUrl: { type: String, default: '' },
    imagePrompt: { type: String, default: '' },
    metrics: { type: [metricSchema], default: [] },
    infographicType: {
      type: String,
      enum: ['process', 'funnel', 'matrix', 'pillars', 'none'],
      default: 'none',
    },
    infographicData: { type: [infographicItemSchema], default: [] },
    chartTitle: { type: String, default: '' },
    chartLabels: { type: [String], default: ['Q1', 'Q2', 'Q3', 'Q4'] },
    chartValues: { type: [Number], default: [35, 55, 78, 100] },
    layout: {
      type: String,
      enum: ['title', 'content', 'two-column', 'image-left', 'image-right', 'chart', 'stats', 'timeline', 'infographic', 'blank'],
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
    tone: { type: String, default: 'Professional' },
    language: { type: String, default: 'English (US)' },
    presentationType: { type: String, default: 'Pitch Deck' },
    audience: { type: String, default: 'General' },
    purpose: { type: String, default: 'Inform' },
    visualStyle: { type: String, default: 'Minimal' },
    generationMode: { type: String, default: 'Auto' },
    referenceUrl: { type: String, default: '' },

    // Theme & Styling
    theme: {
      colorTheme: { type: String, default: 'indigo' },
      fontHeading: { type: String, default: 'Inter' },
      fontBody: { type: String, default: 'Inter' },
    },

    // Sharing
    isShared: { type: Boolean, default: false },
    shareId: { type: String, default: null, unique: true, sparse: true },

    // Organization
    isFavorite: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Auto-generate shareId when sharing is enabled
presentationSchema.methods.generateShareId = function () {
  this.shareId = uuidv4();
  this.isShared = true;
  return this.shareId;
};

// Index for search queries
presentationSchema.index({ owner: 1, isDeleted: 1, updatedAt: -1 });
presentationSchema.index({ title: 'text', prompt: 'text' });

const Presentation = mongoose.model('Presentation', presentationSchema);

export default Presentation;
