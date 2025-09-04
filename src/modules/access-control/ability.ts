
import { AbilityBuilder, createMongoAbility, MongoAbility, InferSubjects } from '@casl/ability';
import { User } from 'firebase/auth';
import { TodoList } from '@/src/modules/todo-list/types'; // Importa o tipo TodoList

// Define uma estrutura de usuário simplificada para verificação de permissões.
type PermissionUser = {
  uid: string;
  email?: string | null;
  isAdmin: boolean;
};

// Define as ações que um usuário pode executar.
export type Actions = 'access' | 'create' | 'read' | 'update' | 'delete' | 'manage';

// Define os "assuntos" ou entidades do sistema.
// Usamos InferSubjects para inferir automaticamente o tipo do assunto.
export type Subjects = InferSubjects<typeof TodoList> | 'AdminPanel' | 'all';

// Define o tipo específico para o objeto de habilidade da nossa aplicação.
export type AppAbility = MongoAbility<[Actions, Subjects]>;

/**
 * Define as permissões (habilidades) para um determinado usuário.
 *
 * @param user O objeto do usuário (pode ser do Firebase Auth ou de um token decodificado).
 * @returns Um objeto de habilidade do CASL.
 */
export const defineAbilitiesFor = (user: Partial<PermissionUser> | null) => {
  const { can, build } = new AbilityBuilder<AppAbility>(createMongoAbility);

  // APENAS PARA DESENVOLVIMENTO: Simula um papel de admin com base em um email específico.
  // Em produção, isso deve ser gerenciado por um mecanismo seguro como Firebase Custom Claims.
  const isDevAdmin = user?.email === 'test@test.com';
  const effectiveIsAdmin = user?.isAdmin || isDevAdmin;

  if (user && user.uid) {
    // --- Permissões Gerais para Usuários Logados ---

    // Qualquer usuário logado pode criar uma nova TodoList.
    can('create', 'TodoList');

    // --- Permissões Baseadas em Papéis ---

    // 1. Permissões de Administrador
    if (effectiveIsAdmin) {
      // Admins podem executar qualquer ação em qualquer assunto.
      can('manage', 'all');
    }

    // 2. Permissões de Dono
    // Usuários podem 'gerenciar' (fazer tudo) nas listas que possuem.
    can('manage', 'TodoList', { ownerId: { $eq: user.uid } });

    // 3. Permissões de Acesso Compartilhado (Visualizadores/Editores)
    // Usuários podem 'ler' uma lista se seu ID estiver presente no mapa accessControl.
    // Isso cobre tanto os papéis de 'viewer' quanto de 'editor'.
    can('read', 'TodoList', { [`accessControl.${user.uid}`]: { $exists: true } });

    // Usuários podem 'atualizar' uma lista se seu ID estiver em accessControl com a permissão 'editor'.
    // Isso também concede a eles a capacidade de adicionar/editar/remover tarefas dentro dessa lista.
    can('update', 'TodoList', { [`accessControl.${user.uid}`]: 'editor' });
  }

  // --- Permissões para Convidados (Não Logados) ---
  // Atualmente, convidados não possuem permissões.

  return build();
};
