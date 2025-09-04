'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, onAuthStateChanged, IdTokenResult } from 'firebase/auth'
import { auth } from '@/lib/firebase-client'
import { Spinner } from '@/src/components/ui/spinner'

interface AuthContextType {
  user: User | null
  idTokenResult: IdTokenResult | null
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  idTokenResult: null,
  loading: true,
})

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [idTokenResult, setIdTokenResult] = useState<IdTokenResult | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const idTokenResult = await user.getIdTokenResult()
        setUser(user)
        setIdTokenResult(idTokenResult)
      } else {
        setUser(null)
        setIdTokenResult(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const value = { user, idTokenResult, loading }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner />
      </div>
    )
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  return useContext(AuthContext)
}
