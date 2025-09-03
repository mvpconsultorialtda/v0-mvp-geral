'use client'

import { useAuth } from './AuthProvider'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

/**
 * A component that guards a route, allowing access only to authenticated admins.
 * If the user is not an admin or the auth state is still loading, it handles redirection.
 */
export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { isAdmin, isReady, loading } = useAuth() // Use the isReady and loading state
  const router = useRouter()

  useEffect(() => {
    // Wait until the initial authentication check is complete.
    if (!isReady) {
      return
    }

    // If authentication is done and the user is not an admin, redirect.
    if (isReady && !isAdmin) {
      router.push('/')
    }
  }, [isAdmin, isReady, router]) // Depend on isReady

  // While checking, or if not admin, you can show a loading spinner or nothing.
  if (loading || !isReady || !isAdmin) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Verificando permissões...</p>
      </div>
    )
  }

  // If the user is an admin and auth check is complete, render the children.
  return <>{children}</>
}
