import axios from 'axios'

// baseURL bo'sh — barcha so'rovlar /api/... ko'rinishida ketadi
// Vite proxy ularni http://127.0.0.1:1111 ga yo'naltiradi (CORS yo'q)
const api = axios.create({
  baseURL: '',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config
    if (err.response?.status === 401 && !original._retry) {
      // Login endpoint xatosi — interceptor aralaShmasin, error Login.jsx ga borsin
      if (original.url?.includes('/auth/login/')) {
        return Promise.reject(err)
      }
      original._retry = true
      const refresh = localStorage.getItem('refresh')
      if (refresh) {
        try {
          const { data } = await axios.post('/api/v1/auth/token/refresh/', { refresh })
          localStorage.setItem('access', data.access)
          original.headers.Authorization = `Bearer ${data.access}`
          return api(original)
        } catch {
          localStorage.clear()
          window.location.href = '/login'
        }
      } else {
        localStorage.clear()
        window.location.href = '/login'
      }
    }
    return Promise.reject(err)
  }
)

export default api
