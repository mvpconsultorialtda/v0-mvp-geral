'use client'

import { LogOut } from 'lucide-react'
import { useAuth } from '@/components/auth/AuthProvider' // Corrigido o caminho do import
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
import { Spinner } from '../ui/spinner' // Importar o spinner

export function UserNav() {
  // 1. Obter o estado de autenticação correto do AuthProvider
  const { user, isAdmin, loading, isReady } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await signOut(auth)
      // A API de logout no servidor não é mais necessária pois o estado é gerenciado no cliente com onAuthStateChanged
      router.push('/login')
      router.refresh() // Força a atualização do estado no layout
    } catch (error) {
      console.error('Erro ao fazer logout: ', error)
      // Forçar o redirecionamento mesmo em caso de erro
      router.push('/login')
      router.refresh()
    }
  }

  // 2. Mostrar um spinner ou nada enquanto a autenticação está sendo verificada
  if (loading || !isReady) {
    return <Spinner size="small" /> // Mostra um indicador de carregamento
  }

  // 3. Se não houver usuário após a verificação, mostrar botões de login/cadastro
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

  // 4. Se o usuário estiver logado, mostrar o menu do usuário
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
          {/* A página de perfil pode ser adicionada no futuro */}
          {/* <DropdownMenuItem onClick={() => router.push('/profile')}>
            Perfil
          </DropdownMenuItem> */}
          
          {/* 5. Usar o booleano `isAdmin` diretamente */}
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
