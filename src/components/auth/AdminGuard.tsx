'use client'

import { useApp } from '@/providers/AppProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Spinner } from '@/components/ui/spinner';

/**
 * Protege uma rota, permitindo o acesso apenas a usuários com a permissão 'access' para o 'AdminPanel'.
 * Utiliza o hook consolidado `useApp` para verificar o estado de autenticação e as permissões do usuário.
 */
export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { ability, authLoading } = useApp();
  const router = useRouter();

  useEffect(() => {
    // Só executa a lógica de redirecionamento quando a autenticação não está mais carregando.
    if (!authLoading) {
      // Se a habilidade não existe ou o usuário não pode acessar o painel de administração, redireciona.
      if (!ability || ability.cannot('access', 'AdminPanel')) {
        router.replace('/');
      }
    }
  }, [authLoading, ability, router]); // O efeito depende desses valores

  // Se a autenticação está carregando, ou se o usuário não tem a permissão necessária,
  // exibe um estado de carregamento. Isso cobre o tempo de carregamento inicial e o breve
  // momento antes do redirecionamento ser concluído.
  if (authLoading || !ability || ability.cannot('access', 'AdminPanel')) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Spinner size="large" />
      </div>
    );
  }

  // Se a autenticação estiver concluída e o usuário tiver permissão, renderize o conteúdo.
  return <>{children}</>;
}
