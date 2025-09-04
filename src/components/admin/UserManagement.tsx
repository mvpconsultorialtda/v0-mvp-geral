'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/src/components/auth/AuthProvider'
import { Button } from '@/src/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/src/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/select'
import { auth } from '@/src/lib/firebase-client'

interface User {
  uid: string
  email: string
  role: string
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUsers = async () => {
    setLoading(true)
    setError(null)
    try {
      const token = await auth.currentUser?.getIdToken()
      if (!token) throw new Error('Usuário não autenticado.')

      const res = await fetch('/api/admin/users', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!res.ok) {
        throw new Error('Falha ao buscar usuários. Você tem permissão de administrador?')
      }

      const data = await res.json()
      setUsers(data.users)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleRoleChange = async (uid: string, newRole: string) => {
    try {
        const token = await auth.currentUser?.getIdToken()
        if (!token) throw new Error('Usuário não autenticado.')

        const res = await fetch('/api/admin/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ uid, role: newRole }),
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || 'Falha ao atualizar a role do usuário.');
        }

        // Atualize a lista de usuários para refletir a mudança
        setUsers(users.map(user => user.uid === uid ? { ...user, role: newRole } : user));

    } catch (err: any) {
        setError(err.message)
    }
  }

  if (loading) return <p>Carregando usuários...</p>
  if (error) return <p className="text-red-500">{error}</p>

  return (
    <div className="mt-6">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Usuários</h2>
            <Button onClick={fetchUsers}>Atualizar Lista</Button>
        </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>UID</TableHead>
            <TableHead className="w-48">Role</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.uid}>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.uid}</TableCell>
              <TableCell>
                <Select 
                  defaultValue={user.role} 
                  onValueChange={(newRole) => handleRoleChange(user.uid, newRole)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
