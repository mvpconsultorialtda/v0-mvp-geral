'use client'

import { useAbility } from '@/src/modules/access-control/AbilityContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from './AuthProvider';

/**
 * Um componente que protege uma rota usando as habilidades do CASL.
 * Ele permite o acesso apenas a usuários com permissão para 'access' o 'AdminPanel'.
 */
export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { isReady, authLoading } = useAuth(); // Ainda precisamos saber quando a autenticação está pronta
  const ability = useAbility();
  const router = useRouter();

  // A verificação de permissão agora é feita com o CASL
  const canAccessAdminPanel = ability.can('access', 'AdminPanel');

  useEffect(() => {
    // Espere até que a verificação de autenticação inicial seja concluída e a habilidade esteja disponível.
    if (!isReady) {
      return;
    }

    // Se a autenticação estiver concluída e o usuário não tiver a permissão necessária, redirecione.
    if (isReady && !canAccessAdminPanel) {
      router.replace('/'); // Use replace para não adicionar uma entrada no histórico do navegador
    }
  }, [canAccessAdminPanel, isReady, router]);

  // Enquanto verifica o estado de autenticação ou se a habilidade ainda não foi carregada,
  // ou se o usuário não puder acessar, mostramos um estado de carregamento enquanto o redirecionamento ocorre.
  if (authLoading || !isReady || !canAccessAdminPanel) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Verificando permissões...</p>
      </div>
    );
  }

  // Se o usuário tiver a permissão e a verificação de autenticação estiver concluída, renderize os filhos.
  return <>{children}</>;
}
