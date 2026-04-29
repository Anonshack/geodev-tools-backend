import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authApi, profileApi } from '../api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = useCallback(async () => {
    try {
      const { data } = await profileApi.get()
      setUser(data)
    } catch {
      setUser(null)
    }
  }, [])

  useEffect(() => {
    const token = localStorage.getItem('access')
    if (token) fetchProfile().finally(() => setLoading(false))
    else setLoading(false)
  }, [fetchProfile])

  const login = async (credentials) => {
    const { data } = await authApi.login(credentials)
    localStorage.setItem('access', data.access)
    localStorage.setItem('refresh', data.refresh)
    await fetchProfile()
    return data
  }

  const logout = async () => {
    const refresh = localStorage.getItem('refresh')
    try { await authApi.logout(refresh) } catch { /* ignore */ }
    localStorage.clear()
    setUser(null)
  }

  const register = async (payload) => {
    const { data } = await authApi.register(payload)
    return data
  }

  const refreshUser = () => fetchProfile()

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
