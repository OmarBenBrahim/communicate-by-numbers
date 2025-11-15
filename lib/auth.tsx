import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useMe, setAuthToken } from './hooks'

type AuthContextType = {
  user: any | null
  token: string | null
  isLoading: boolean
  setToken: (token: string | null) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const { data: user, isLoading } = useMe(token)

  // Initialize token from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('token')
    if (saved) {
      setTokenState(saved)
      setAuthToken(saved)
    }
    setMounted(true)
  }, [])

  const setToken = (newToken: string | null) => {
    if (newToken) {
      localStorage.setItem('token', newToken)
      setAuthToken(newToken)
    } else {
      localStorage.removeItem('token')
      setAuthToken(null)
    }
    setTokenState(newToken)
  }

  const logout = () => {
    setToken(null)
  }

  // Don't render children until auth is initialized
  if (!mounted) {
    return <div />
  }

  return <AuthContext.Provider value={{ user, token, isLoading, setToken, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
