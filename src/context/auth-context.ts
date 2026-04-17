import { createContext, useContext } from 'react'
import type { AuthSession } from '../types/content'

export type AuthContextValue = {
  session: AuthSession | null
  ready: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return context
}
