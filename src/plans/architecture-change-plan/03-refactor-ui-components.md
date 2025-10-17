# Plano de Alteração: Refatoração dos Componentes da UI

**Arquivos-alvo**: `app/lists/[listId]/page.tsx`, `src/modules/task-lists/components/TaskListsSidebar.tsx`, `src/modules/task-lists/components/TasksList.tsx` (e componentes relacionados).

## Objetivo

Refatorar os componentes da UI para utilizar os novos hooks (`useLists` e `useTasks`), removendo a lógica de busca de dados dos componentes e simplificando a passagem de props.

## Passos de Implementação

1.  **Refatorar `TaskListsSidebar.tsx`**:
    *   Remova qualquer lógica de busca de dados existente.
    *   Chame o hook `useLists()` para obter a lista de tarefas: `const { lists } = useLists();`.
    *   Renderize a lista de tarefas a partir da prop `lists` retornada pelo hook.

2.  **Refatorar a Página Principal da Lista (`app/lists/[listId]/page.tsx`)**:
    *   Este componente atuará como o "container" que conecta a barra lateral e a lista de tarefas.
    *   Ele será responsável por obter o `listId` dos parâmetros da rota.
    *   Utilize o hook `useTasks(listId)` para obter as tarefas da lista selecionada: `const { tasks, createTask, updateTask, deleteTask } = useTasks(listId);`.
    *   Passe os dados e as funções retornadas pelo hook `useTasks` para o componente `TasksList`.

3.  **Refatorar `TasksList.tsx`**:
    *   Simplifique as props do componente. Em vez de receber funções genéricas como `onUpdateTask`, ele agora receberá as funções específicas retornadas pelo hook `useTasks`, como `updateTask` e `deleteTask`.
    *   A assinatura dessas funções já estará correta, pois o `listId` é gerenciado internamente pelo hook `useTasks`. O componente `TasksList` não precisa mais saber sobre o `listId`.
    *   Exemplo da nova assinatura de props:

        ```typescript
        interface TasksListProps {
          tasks: Task[];
          onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
          onDeleteTask: (taskId: string) => void;
        }
        ```

4.  **Refatorar `TaskItem.tsx` e outros componentes filhos**:
    *   Garanta que a "perfuração de props" (prop drilling) seja minimizada. Os dados devem fluir da página principal (`page.tsx`), através do `TasksList`, para o `TaskItem`.
    *   As funções `updateTask` e `deleteTask` serão passadas para baixo na hierarquia de componentes até chegarem onde são necessárias (por exemplo, em um botão de exclusão dentro de `TaskItem`). A vantagem é que a assinatura dessas funções agora é mais simples e consistente em todos os níveis.