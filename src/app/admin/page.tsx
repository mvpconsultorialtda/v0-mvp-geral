'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/auth-provider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'

interface User {
  uid: string
  email?: string
  customClaims?: {
    role?: string
  }
}

export default function AdminPage() {
  const { user, idTokenResult } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const isAdmin = idTokenResult?.claims.role === 'admin'

  useEffect(() => {
    const fetchUsers = async () => {
      if (user && isAdmin) {
        try {
          const token = await user.getIdToken()
          const res = await fetch('/api/users', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          if (res.ok) {
            const data = await res.json()
            setUsers(data.users)
          } else {
            console.error('Failed to fetch users')
          }
        } catch (error) {
          console.error(error)
        } finally {
          setLoading(false)
        }
      } else {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [user, isAdmin])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner />
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto py-10">
        <p>You are not authorized to view this page.</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Admin Panel</CardTitle>
        </CardHeader>
        <CardContent>
          <ul>
            {users.map((user) => (
              <li key={user.uid} className="mb-2 border-b pb-2">
                <p>
                  <span className="font-semibold">Email:</span> {user.email}
                </p>
                <p>
                  <span className="font-semibold">UID:</span> {user.uid}
                </p>
                <p>
                  <span className="font-semibold">Role:</span> {
                    user.customClaims?.role ?? 'user'
                  }
                </p>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
