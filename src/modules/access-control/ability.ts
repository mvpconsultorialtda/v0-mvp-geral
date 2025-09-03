import { AbilityBuilder, createMongoAbility } from '@casl/ability';

type User = {
  id: string;
  role: string;
};

// Define as ações que podem ser realizadas (ex: 'access', 'create', 'edit')
// e os assuntos (ex: 'Dashboard', 'AdminPanel', 'all')
type AppAbilities = 
  | ['access', 'Dashboard' | 'BackgroundRemover' | 'TodoList' | 'AdminPanel']
  | ['manage', 'all'];

// Cria o tipo da habilidade para ser usado na aplicação
export type AppAbility = ReturnType<typeof createMongoAbility<AppAbilities>>;

export function defineAbilitiesFor(user: User | null) {
  const { can, cannot, build } = new AbilityBuilder<AppAbility>(createMongoAbility);

  if (user) {
    if (user.role === 'admin') {
      // Admins podem gerenciar tudo E acessar todos os painéis.
      can('manage', 'all');
      can('access', 'AdminPanel');
      can('access', 'Dashboard');
      can('access', 'BackgroundRemover');
      can('access', 'TodoList');
    } else if (user.role === 'user_default') {
      // Usuários padrão podem acessar o painel geral (hub de módulos).
      can('access', 'Dashboard');

      // Eles estão explicitamente proibidos de acessar os módulos individuais.
      cannot('access', 'BackgroundRemover');
      cannot('access', 'TodoList');
      cannot('access', 'AdminPanel');
    }
  }

  // Se não houver usuário (convidado), nenhuma permissão é concedida por padrão.
  
  return build();
}
