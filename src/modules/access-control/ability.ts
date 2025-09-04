
import { AbilityBuilder, createMongoAbility } from '@casl/ability';
import { User } from 'firebase/auth';

// Define a estrutura de um usuário para as habilidades (simplificada)
type PermissionUser = {
  uid: string;
  email?: string | null;
  isAdmin: boolean;
};

// Define as ações que um usuário pode realizar
export type Actions = 'access' | 'create' | 'read' | 'update' | 'delete' | 'manage';

// Define os "assuntos" ou entidades do sistema
export type Subjects = 'AdminPanel' | 'Todo' | 'User' | 'all';

// Tipagem para o objeto de habilidade
export type AppAbility = ReturnType<typeof defineAbilitiesFor>;

/**
 * Define as permissões (habilidades) para um determinado usuário.
 *
 * @param user O objeto de usuário (pode ser do Firebase Auth ou do token decodificado).
 * @returns Um objeto de habilidade do CASL.
 */
export const defineAbilitiesFor = (user: Partial<PermissionUser> | null) => {
  const { can, cannot, build } = new AbilityBuilder(createMongoAbility);

  // FOR DEVELOPMENT ONLY: Simulação de roles baseada em e-mails.
  // Em produção, isso deve vir de uma fonte segura (ex: custom claims do Firebase).
  const isDevAdmin = user?.email === 'test@test.com';
  const isPowerUser = user?.email === 'user@test.com';
  const effectiveIsAdmin = user?.isAdmin || isDevAdmin;

  if (user) {
    // Regras para todos os usuários logados
    can('access', 'Todo');

    // Regras específicas para administradores
    if (effectiveIsAdmin) {
      can('access', 'AdminPanel');
      can('manage', 'all'); // Admins podem gerenciar tudo
    }

    // Regras para o "power user"
    if (isPowerUser) {
      can('manage', 'all'); // Pode gerenciar tudo...
      cannot('access', 'AdminPanel'); // ...exceto acessar o painel de admin.
    }
  }

  // Regras para convidados (não logados) podem ser adicionadas aqui

  return build();
};
