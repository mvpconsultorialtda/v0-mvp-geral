
# Plano de Implementação: Log de Atividades

**Objetivo**: Criar um log de atividades para cada lista, registrando todas as ações importantes para fornecer um histórico de alterações.

**Passos**:

1.  **Criar a Subcoleção `activity`**:
    *   Defina a estrutura de dados para os documentos de log de atividades, incluindo o tipo de ação, o autor, a data e os detalhes relevantes.

2.  **Implementar as Cloud Functions de Log**:
    *   Crie Cloud Functions acionadas por eventos do Firestore (`onCreate`, `onUpdate`, `onDelete`) nas coleções e subcoleções relevantes (ex: `tasks`, `lists.members`).
    *   Nessas funções, crie um novo documento na subcoleção `activity` da lista correspondente com as informações da ação.

3.  **Exibir o Log na UI**:
    *   Crie um componente que busque e exiba os documentos da subcoleção `activity` em ordem cronológica inversa.
    *   Integre este componente na `TaskDetailView` ou em um local apropriado.

4.  **Testar o Log**:
    *   Realize várias ações (criar/editar tarefas, adicionar usuários) e verifique se as atividades são registradas e exibidas corretamente no log.
