export const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:5000/api');

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
  'English (US)',
  'Hindi (हिन्दी)',
  'Hinglish (Hindi-English mix)',
  'English (UK)',
  'Spanish (Español)',
  'French (Français)',
  'German (Deutsch)',
  'Japanese (日本語)',
  'Chinese (Mandarin)',
  'Arabic (العربية)',
  'Portuguese (Português)',
  'Russian (Русский)',
  'Bengali (বাংলা)',
  'Tamil (தமிழ்)',
  'Telugu (తెలుగు)',
  'Marathi (मराठी)',
  'Gujarati (ગુજરાતી)',
  'Korean (한국어)',
  'Italian (Italiano)',
];

export const AI_IMPROVE_ACTIONS = [
  { id: 'make-concise',  label: 'Make more concise',   icon: '✂️' },
  { id: 'add-detail',    label: 'Add more detail',      icon: '📝' },
  { id: 'executive',     label: 'Executive summary',    icon: '👔' },
  { id: 'casual',        label: 'Make conversational',  icon: '💬' },
  { id: 'bullet-points', label: 'Convert to key points',icon: '📋' },
  { id: 'fix-grammar',   label: 'Fix grammar & polish', icon: '✨' },
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
    defaultPrompt: 'Create a corporate annual report presentation',
  },
  {
    id: 'marketing-strategy',
    name: 'Marketing Strategy',
    description: 'Frameworks for campaign planning, audience persona, and channel growth.',
    category: 'Marketing',
    color: '#059669',
    slideCount: 10,
    defaultPrompt: 'Create a comprehensive marketing strategy presentation',
  },
  {
    id: 'tech-architecture',
    name: 'Technical Architecture',
    description: 'System diagrams, infrastructure scalability, and API service overviews.',
    category: 'Technology',
    color: '#334155',
    slideCount: 8,
    defaultPrompt: 'Create a technical architecture and systems overview presentation',
  },
  {
    id: 'educational-lecture',
    name: 'Educational Course',
    description: 'Structured slides for lectures, workshops, and educational modules.',
    category: 'Education',
    color: '#d97706',
    slideCount: 10,
    defaultPrompt: 'Create an educational course overview presentation',
  },
];
