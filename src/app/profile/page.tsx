'use client'

import { useAuth } from '@/components/auth-provider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function ProfilePage() {
  const { user, idTokenResult } = useAuth()

  if (!user) {
    return null
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Perfil</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            <span className="font-semibold">Email:</span> {user.email}
          </p>
          <p>
            <span className="font-semibold">UID:</span> {user.uid}
          </p>
          <p>
            <span className="font-semibold">Role:</span> {idTokenResult?.claims.role}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
