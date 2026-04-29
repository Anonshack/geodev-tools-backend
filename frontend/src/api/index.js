import api from './axios'

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  register:              (data)    => api.post('/api/v1/auth/register/', data),
  login:                 (data)    => api.post('/api/v1/auth/login/', data),
  logout:                (refresh) => api.post('/api/v1/auth/logout/', { refresh }),
  generateApiKey:        ()        => api.post('/api/v1/auth/generate-key/'),
  passwordResetRequest:  (email)   => api.post('/api/v1/auth/password-reset/', { email }),
  passwordResetComplete: (data)    => api.post('/api/v1/auth/password-reset/complete/', data),
}

// ── Profile ───────────────────────────────────────────────────────────────────
export const profileApi = {
  get:            ()     => api.get('/api/v1/users/profile/'),
  update:         (data) => api.patch('/api/v1/users/profile/', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  changePassword: (data) => api.post('/api/v1/users/change-password/', data),
  countries:      ()     => api.get('/api/v1/users/countries/'),
}

// ── Notifications ─────────────────────────────────────────────────────────────
export const notifyApi = {
  list:       (page = 1) => api.get(`/api/v1/notify/?page=${page}`),
  unreadCount: ()        => api.get('/api/v1/notify/unread-count/'),
  markRead:   (pk)       => api.patch(`/api/v1/notify/${pk}/`),
  markAllRead: ()        => api.post('/api/v1/notify/mark-all-read/'),
  delete:     (pk)       => api.delete(`/api/v1/notify/${pk}/delete/`),
}

// ── Geo Files (Storage) ───────────────────────────────────────────────────────
export const filesApi = {
  upload:      (formData) => api.post('/api/v1/storage/upload/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  list:        (page = 1) => api.get(`/api/v1/storage/files/?page=${page}`),
  delete:      (pk)       => api.delete(`/api/v1/storage/files/${pk}/`),
  // Public URLs (shareable, no auth needed)
  publicUrl:   (pk)       => `/api/v1/storage/public/${pk}/download/`,
  downloadUrl: (pk)       => `/api/v1/storage/files/${pk}/download/`,
}

// ── AI / Mock API ─────────────────────────────────────────────────────────────
export const aiApi = {
  generate:   (data)       => api.post('/api/v1/geodev-ai/generate/', data),
  myApis:     (page = 1)   => api.get(`/api/v1/geodev-ai/my-apis/?page=${page}`),
  detail:     (pk)         => api.get(`/api/v1/geodev-ai/my-apis/${pk}/`),
  toggle:     (pk)         => api.patch(`/api/v1/geodev-ai/my-apis/${pk}/`),
  delete:     (pk)         => api.delete(`/api/v1/geodev-ai/my-apis/${pk}/`),
  regenerate: (pk, count)  => api.post(`/api/v1/geodev-ai/my-apis/${pk}/regenerate/`, { count }),
  publicData: (slug)       => api.get(`/api/v1/geodev-ai/mock/${slug}/`),
}
