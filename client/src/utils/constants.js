export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const AUDIENCES = [
  'Executives', 'MBA Students', 'Investors', 'Engineers', 'General Public',
  'Sales Team', 'Marketing Team', 'Students', 'Academics', 'Customers',
];

export const PURPOSES = ['Inform', 'Persuade', 'Educate', 'Pitch', 'Report', 'Train'];

export const TONES = ['Professional', 'Conversational', 'Formal', 'Inspirational', 'Technical', 'Casual'];

export const VISUAL_STYLES = ['Minimal', 'Modern', 'Corporate', 'Creative', 'Bold', 'Elegant'];

export const COLOR_THEMES = [
  { label: 'Brand Default (Indigo/Slate)', value: 'indigo', color: '#4338ca' },
  { label: 'Ocean Blue',  value: 'blue',   color: '#2563eb' },
  { label: 'Emerald',     value: 'emerald', color: '#059669' },
  { label: 'Amber',       value: 'amber',   color: '#d97706' },
  { label: 'Rose',        value: 'rose',    color: '#e11d48' },
  { label: 'Slate',       value: 'slate',   color: '#475569' },
];

export const SLIDE_COUNTS = [
  { label: 'Auto (Recommended)', value: 0 },
  { label: '5 slides',  value: 5 },
  { label: '8 slides',  value: 8 },
  { label: '10 slides', value: 10 },
  { label: '12 slides', value: 12 },
  { label: '15 slides', value: 15 },
];

export const PRESENTATION_TYPES = [
  'Pitch Deck', 'Business Proposal', 'Marketing Strategy', 'Academic',
  'Project Report', 'Sales Presentation', 'Technology', 'Annual Report',
];

export const LANGUAGES = [
  'English (US)', 'English (UK)', 'Spanish', 'French', 'German',
  'Portuguese', 'Italian', 'Japanese', 'Chinese', 'Arabic',
];

export const TEMPLATE_CATEGORIES = ['All', 'Business', 'Marketing', 'Education', 'Finance', 'Technology'];

export const TEMPLATES = [
  {
    id: 'modern-pitch',
    name: 'Modern Pitch Deck',
    description: 'A clean, high-impact deck for startup fundraising and investor presentations.',
    category: 'Business',
    color: '#4338ca',
    slideCount: 12,
    defaultPrompt: 'Create a modern pitch deck for a startup',
  },
  {
    id: 'annual-report',
    name: 'Corporate Annual Report',
    description: 'Detailed layouts for financial summaries, KPIs, and executive highlights.',
    category: 'Finance',
    color: '#0284c7',
    slideCount: 15,
    defaultPrompt: 'Create a comprehensive annual report presentation',
  },
  {
    id: 'campaign-overview',
    name: 'Campaign Overview',
    description: 'Present marketing strategies, targets, and performance metrics effectively.',
    category: 'Marketing',
    color: '#dc2626',
    slideCount: 10,
    defaultPrompt: 'Create a marketing campaign overview presentation',
  },
  {
    id: 'seminar-lecture',
    name: 'Seminar Lecture',
    description: 'Structured layouts designed for clear educational delivery.',
    category: 'Education',
    color: '#059669',
    slideCount: 15,
    defaultPrompt: 'Create an educational seminar presentation',
  },
  {
    id: 'sales-deck',
    name: 'Sales Deck',
    description: 'Persuasive slides to convert prospects into customers.',
    category: 'Business',
    color: '#7c3aed',
    slideCount: 10,
    defaultPrompt: 'Create a compelling sales presentation',
  },
  {
    id: 'tech-overview',
    name: 'Technology Overview',
    description: 'Technical deep-dives with architecture diagrams and roadmaps.',
    category: 'Technology',
    color: '#0891b2',
    slideCount: 12,
    defaultPrompt: 'Create a technology overview presentation',
  },
  {
    id: 'project-report',
    name: 'Project Report',
    description: 'Progress updates, milestones, and deliverables at a glance.',
    category: 'Business',
    color: '#b45309',
    slideCount: 10,
    defaultPrompt: 'Create a project status report presentation',
  },
  {
    id: 'strategy-deck',
    name: 'Marketing Strategy',
    description: 'From market analysis to go-to-market plans and channel strategy.',
    category: 'Marketing',
    color: '#be185d',
    slideCount: 12,
    defaultPrompt: 'Create a marketing strategy presentation',
  },
];

export const AI_IMPROVE_ACTIONS = [
  { id: 'improve',    label: 'Improve this slide',       icon: '✨' },
  { id: 'concise',    label: 'Make it more concise',     icon: '✂️' },
  { id: 'professional', label: 'Make it more professional', icon: '💼' },
  { id: 'executive',  label: 'Rewrite for executives',   icon: '📊' },
  { id: 'simplify',   label: 'Simplify',                 icon: '🎯' },
  { id: 'speaker-notes', label: 'Generate speaker notes', icon: '🎤' },
  { id: 'suggest',    label: 'Suggest supporting info',  icon: '💡' },
];
