import { useEffect, useState } from 'react'
import { supabase } from '../lib/client'
import { AuthContext } from './auth-context'
import type { AuthSession } from '../types/content'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let active = true

    async function hydrateSession() {
      const {
        data: { session: authSession },
      } = await supabase.auth.getSession()

      if (!active) {
        return
      }

      setSession(
        authSession?.user.email
          ? {
              email: authSession.user.email,
              loggedAt: authSession.user.last_sign_in_at ?? authSession.user.created_at,
            }
          : null,
      )
      setReady(true)
    }

    void hydrateSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, authSession) => {
      setSession(
        authSession?.user.email
          ? {
              email: authSession.user.email,
              loggedAt: authSession.user.last_sign_in_at ?? authSession.user.created_at,
            }
          : null,
      )
      setReady(true)
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  async function login(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      throw new Error(error.message)
    }
  }

  async function logout() {
    await supabase.auth.signOut()
    setSession(null)
  }

  return (
    <AuthContext.Provider value={{ session, ready, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
