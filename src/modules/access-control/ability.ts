import { AbilityBuilder, createMongoAbility } from '@casl/ability';
import { User } from 'firebase/auth';

// Define as ações que um usuário pode realizar
export type Actions = 'access' | 'create' | 'read' | 'update' | 'delete' | 'manage';

// Define os "assuntos" ou entidades do sistema
export type Subjects = 'AdminPanel' | 'Todo' | 'all';

// Tipagem para o objeto de habilidade
export type AppAbility = ReturnType<typeof defineAbilitiesFor>;

/**
 * Define as permissões (habilidades) para um determinado usuário.
 *
 * @param user O objeto de usuário do Firebase.
 * @param isAdmin Um booleano indicando se o usuário é administrador.
 * @returns Um objeto de habilidade do CASL.
 */
export const defineAbilitiesFor = (user: User | null, isAdmin: boolean) => {
  const { can, build } = new AbilityBuilder(createMongoAbility);

  if (user) {
    // Regras para todos os usuários logados
    can('access', 'Todo');

    // Regras específicas para administradores
    if (isAdmin) {
      can('access', 'AdminPanel');
      can('manage', 'all'); // Admins podem gerenciar tudo
    }
  }

  // Regras para convidados (não logados) podem ser adicionadas aqui

  return build();
};
