import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import type { User, AuthState } from '../types'
import { authApi, usersApi, type ApiUser } from '../lib/endpoints'
import { setToken, clearToken, hasToken } from '../lib/api'

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>
  register: (name: string, email: string, password: string) => Promise<boolean>
  logout: () => void
  refreshUser: () => Promise<void>
  // Le backend n'expose pas (encore) de flux de réinitialisation de mot de
  // passe par email : on garde une simulation côté client pour ne pas casser
  // l'écran "mot de passe oublié", clairement non fonctionnelle en réel.
  resetPassword: (email: string) => Promise<boolean>
  error: string | null
}

const AuthContext = createContext<AuthContextType | null>(null)

function toUser(apiUser: ApiUser): User {
  return {
    id: apiUser.id,
    name: apiUser.name,
    email: apiUser.email,
    avatar: apiUser.avatar,
    currency: apiUser.currency,
    monthlyBudget: apiUser.monthlyBudget,
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // loading=true tant qu'on n'a pas vérifié une éventuelle session existante
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    loading: true,
  })
  const [error, setError] = useState<string | null>(null)

  // Au chargement de l'app : si un token est stocké, on vérifie qu'il est
  // toujours valide en récupérant le profil, plutôt que de faire confiance
  // aveuglément à sa seule présence dans localStorage.
  useEffect(() => {
    let cancelled = false
    async function restoreSession() {
      if (!hasToken()) {
        setState({ user: null, isAuthenticated: false, loading: false })
        return
      }
      try {
        const apiUser = await usersApi.me()
        if (!cancelled) setState({ user: toUser(apiUser), isAuthenticated: true, loading: false })
      } catch {
        clearToken()
        if (!cancelled) setState({ user: null, isAuthenticated: false, loading: false })
      }
    }
    restoreSession()
    return () => { cancelled = true }
  }, [])

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setError(null)
    setState(s => ({ ...s, loading: true }))
    try {
      const { accessToken, user } = await authApi.login(email, password)
      setToken(accessToken)
      setState({ user: toUser(user), isAuthenticated: true, loading: false })
      return true
    } catch (err) {
      setState(s => ({ ...s, loading: false }))
      setError(err instanceof Error ? err.message : 'Connexion impossible.')
      return false
    }
  }, [])

  const register = useCallback(async (name: string, email: string, password: string): Promise<boolean> => {
    setError(null)
    setState(s => ({ ...s, loading: true }))
    try {
      const { accessToken, user } = await authApi.register(name, email, password)
      setToken(accessToken)
      setState({ user: toUser(user), isAuthenticated: true, loading: false })
      return true
    } catch (err) {
      setState(s => ({ ...s, loading: false }))
      setError(err instanceof Error ? err.message : 'Inscription impossible.')
      return false
    }
  }, [])

  const logout = useCallback(() => {
    clearToken()
    setState({ user: null, isAuthenticated: false, loading: false })
  }, [])

  const refreshUser = useCallback(async () => {
    if (!hasToken()) return
    const apiUser = await usersApi.me()
    setState(s => ({ ...s, user: toUser(apiUser) }))
  }, [])

  const resetPassword = useCallback(async (_email: string): Promise<boolean> => {
    setState(s => ({ ...s, loading: true }))
    await new Promise(r => setTimeout(r, 800))
    setState(s => ({ ...s, loading: false }))
    return true
  }, [])

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, refreshUser, resetPassword, error }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
