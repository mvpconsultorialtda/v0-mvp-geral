'use client'

import { LogOut } from 'lucide-react'
import { useAuth } from '@/components/auth-provider'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useRouter } from 'next/navigation'
import { signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase-client'

export function UserNav() {
  const { user, idTokenResult } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      // 1. Faz o logout do cliente (Firebase)
      await signOut(auth)

      // 2. Faz o logout do servidor (destruindo o cookie)
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
      })

      if (res.ok) {
        // 3. Redireciona e força a atualização da rota
        router.push('/login')
        router.refresh()
      } else {
        // Se a chamada da API falhar, ainda força o redirecionamento e refresh
        // porque o cliente já foi deslogado pelo signOut(auth).
        router.push('/login')
        router.refresh()
      }
    } catch (error) {
      console.error('Erro ao fazer logout: ', error)
      // Em caso de erro, também tenta redirecionar
      router.push('/login')
      router.refresh()
    }
  }

  if (!user) {
    return (
      <div className="flex items-center space-x-2">
        <Button onClick={() => router.push('/login')}>Login</Button>
        <Button variant="outline" onClick={() => router.push('/signup')}>
          Cadastre-se
        </Button>
      </div>
    )
  }

  const isAdmin = idTokenResult?.claims.role === 'admin'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.photoURL ?? ''} alt={user.displayName ?? ''} />
            <AvatarFallback>{user.email?.[0].toUpperCase()}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.displayName ?? 'Usuário'}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => router.push('/profile')}>
            Perfil
          </DropdownMenuItem>
          {isAdmin && (
            <DropdownMenuItem onClick={() => router.push('/admin')}>
              Painel do Admin
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sair</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
