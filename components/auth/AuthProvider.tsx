'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged, User } from 'firebase/auth'
import { auth } from '@/lib/firebase-client'

// Define the shape of the context data
interface AuthContextType {
  user: User | null
  loading: boolean
  isReady: boolean
  isAdmin: boolean
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Create the provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true) // Loading state for initial auth check
  const [isReady, setIsReady] = useState(false) // State to track if auth check has completed
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)
      setLoading(true) // Set loading true when user state changes

      if (user) {
        try {
          const tokenResult = await user.getIdTokenResult()
          setIsAdmin(tokenResult.claims.role === 'admin')
        } catch (error) {
          console.error('Error fetching user token:', error)
          setIsAdmin(false)
        } finally {
          setLoading(false) // Set loading to false after token check
        }
      } else {
        setIsAdmin(false)
        setLoading(false) // No user, so not loading
      }
      setIsReady(true) // Auth check is complete
    })

    return () => unsubscribe()
  }, [])

  const value = {
    user,
    loading,
    isReady, // Expose isReady state
    isAdmin,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Create a hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
