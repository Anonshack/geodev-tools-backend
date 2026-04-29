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

// ── Geo / Location ────────────────────────────────────────────────────────────
export const geoApi = {
  saveLocation:  ()         => api.get('/api/v1/geo/save-location/'),
  myLocations:   (page = 1) => api.get(`/api/v1/geo/my-locations/?page=${page}`),
}

// ── Admin ─────────────────────────────────────────────────────────────────────
export const adminApi = {
  stats:              ()           => api.get('/api/v1/users/admin-stats/'),

  // Users
  users:              (page = 1)   => api.get(`/api/v1/users/all-users/?page=${page}`),
  userDetail:         (pk)         => api.get(`/api/v1/users/admin-users/${pk}/`),
  userUpdate:         (pk, data)   => api.patch(`/api/v1/users/admin-users/${pk}/`, data),
  userDelete:         (pk)         => api.delete(`/api/v1/users/admin-users/${pk}/`),

  // Files
  files:              (page = 1)   => api.get(`/api/v1/storage/admin/files/?page=${page}`),
  fileDelete:         (pk)         => api.delete(`/api/v1/storage/admin/files/${pk}/delete/`),

  // Mock APIs
  mockApis:           (page = 1)   => api.get(`/api/v1/geodev-ai/admin/?page=${page}`),
  mockApiToggle:      (pk)         => api.patch(`/api/v1/geodev-ai/admin/${pk}/`),
  mockApiDelete:      (pk)         => api.delete(`/api/v1/geodev-ai/admin/${pk}/`),

  // Locations
  locations:          (page = 1)   => api.get(`/api/v1/geo/admin-users-locations/?page=${page}`),

  // Notifications
  notifications:      (page = 1)   => api.get(`/api/v1/notify/admin/?page=${page}`),
  notificationDelete: (pk)         => api.delete(`/api/v1/notify/admin/${pk}/delete/`),
  notificationSend:   (data)       => api.post('/api/v1/notify/admin/send/', data),
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
