import api from './api.js';

export const aiService = {
  generate:      (data) => api.post('/ai/generate', data),
  improveSlide:  (data) => api.post('/ai/improve-slide', data),
  speakerNotes:  (data) => api.post('/ai/speaker-notes', data),
  changeTone:    (data) => api.post('/ai/change-tone', data),
};
