import api from './api.js';

export const presentationService = {
  // CRUD
  list:    (params) => api.get('/presentations', { params }),
  get:     (id)     => api.get(`/presentations/${id}`),
  create:  (data)   => api.post('/presentations', data),
  update:  (id, data) => api.patch(`/presentations/${id}`, data),
  delete:  (id)     => api.delete(`/presentations/${id}`),

  // Slides
  addSlide:    (id, data)         => api.post(`/presentations/${id}/slides`, data),
  updateSlide: (id, slideId, data) => api.patch(`/presentations/${id}/slides/${slideId}`, data),
  deleteSlide: (id, slideId)      => api.delete(`/presentations/${id}/slides/${slideId}`),
  reorderSlides: (id, data)       => api.patch(`/presentations/${id}/slides/reorder`, data),

  // Sharing
  enableShare:  (id) => api.post(`/presentations/${id}/share`),
  disableShare: (id) => api.delete(`/presentations/${id}/share`),
  getShared:    (shareId) => api.get(`/share/${shareId}`),

  // Export
  exportPdf:  (id) => api.get(`/presentations/${id}/export/pdf`, { responseType: 'blob' }),
  exportPptx: (id) => api.get(`/presentations/${id}/export/pptx`, { responseType: 'blob' }),

  // Favorites
  toggleFavorite: (id) => api.patch(`/presentations/${id}/favorite`),
};
