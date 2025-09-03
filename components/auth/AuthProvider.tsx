'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged, User } from 'firebase/auth'
import { auth } from '@/lib/firebase-client'

// Define a forma dos dados do contexto
interface AuthContextType {
  user: User | null
  authLoading: boolean // Renomeado de 'loading' para clareza
  isReady: boolean
  isAdmin: boolean
}

// Cria o contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Cria o componente provedor
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [authLoading, setAuthLoading] = useState(true) // Renomeado. Permanece true até a primeira verificação.
  const [isReady, setIsReady] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)

      if (user) {
        try {
          const tokenResult = await user.getIdTokenResult()
          setIsAdmin(tokenResult.claims.role === 'admin')
        } catch (error) {
          console.error('Error fetching user token:', error)
          setIsAdmin(false)
        }
      } else {
        setIsAdmin(false)
      }
      
      // A verificação de autenticação terminou, então o carregamento não é mais necessário.
      setAuthLoading(false)
      setIsReady(true)
    })

    // Cleanup
    return () => unsubscribe()
  }, []) // O array vazio garante que isso rode apenas uma vez

  const value = {
    user,
    authLoading, // Expondo o novo estado de loading
    isReady,
    isAdmin,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Cria um hook para usar o contexto de autenticação
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
