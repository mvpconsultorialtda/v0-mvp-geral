'use client'

import { LogOut } from 'lucide-react'
import { useAuth } from '@/components/auth/AuthProvider' 
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
import { Spinner } from '../ui/spinner'

export function UserNav() {
  const { user, isAdmin, loading, isReady } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      // 1. Desloga do Firebase no cliente
      await signOut(auth)

      // 2. Chama a API para destruir a sessão no servidor
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      // 3. Redireciona e força o refresh, independentemente do resultado da API,
      // pois o cliente já está deslogado. O middleware cuidará da segurança.
      if (!res.ok) {
          console.error('Falha ao limpar a sessão do servidor.');
      }

    } catch (error) {
      console.error('Erro no processo de logout: ', error)
    } finally {
        // O onAuthStateChanged no AuthProvider vai detectar o logout e atualizar o estado.
        // O refresh garante que o middleware será reavaliado se o usuário tentar navegar.
        router.push('/login');
        router.refresh();
    }
  }

  if (loading || !isReady) {
    return <Spinner size="small" />
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

  const userInitial = user.displayName?.[0] || user.email?.[0]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.photoURL ?? undefined} alt={user.displayName ?? ''} />
            <AvatarFallback>{userInitial?.toUpperCase()}</AvatarFallback>
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
