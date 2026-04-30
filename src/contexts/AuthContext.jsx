import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { supabase, supabaseConfigured } from '../supabase'

const AuthContext = createContext(null)
const DEV_EMAIL = 'admin@peeryisroel.com'
const DEV_PASSWORD = 'PeerYisroel2024!'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(Boolean(supabaseConfigured && supabase))
  const allowDevLogin = import.meta.env.DEV && (!supabaseConfigured || !supabase)

  useEffect(() => {
    if (!supabaseConfigured || !supabase) {
      setLoading(false)
      return undefined
    }
    let active = true
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (active) {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })
    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  const login = useCallback(async (email, password) => {
    if (allowDevLogin) {
      if (email === DEV_EMAIL && password === DEV_PASSWORD) {
        setUser({ email, id: 'dev-user' })
        return { error: null }
      }
      return { error: { message: 'Invalid development credentials.' } }
    }
    if (!supabaseConfigured || !supabase) {
      return { error: { message: 'Supabase is not configured.' } }
    }
    return supabase.auth.signInWithPassword({ email, password })
  }, [allowDevLogin])

  const logout = useCallback(async () => {
    if (allowDevLogin) {
      setUser(null)
      return
    }
    if (supabaseConfigured && supabase) await supabase.auth.signOut()
  }, [allowDevLogin])

  const value = useMemo(() => ({
    user,
    loading,
    login,
    logout,
    allowDevLogin,
    devCredentials: { email: DEV_EMAIL, password: DEV_PASSWORD },
  }), [allowDevLogin, loading, login, logout, user])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
