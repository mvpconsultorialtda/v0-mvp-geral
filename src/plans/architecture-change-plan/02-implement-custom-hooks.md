# Plano de Alteração: Implementação de Hooks Customizados para Gerenciamento de Estado

**Novos arquivos**: `src/modules/task-lists/hooks/useLists.ts`, `src/modules/task-lists/hooks/useTasks.ts`

## Objetivo

Criar hooks React customizados (`useLists` e `useTasks`) para encapsular a lógica de busca de dados em tempo real, gerenciamento de estado e interação com a camada de serviço. Isso centralizará a lógica de estado, evitará o "prop drilling" e fornecerá uma API limpa para os componentes da UI.

## Passos de Implementação

### 1. Criar o Hook `useLists`

*   **Arquivo**: `src/modules/task-lists/hooks/useLists.ts`
*   **Estado**: Utilize `useState<TaskList[]>([])` para armazenar as listas de tarefas.
*   **Efeito**: Utilize `useEffect` para se inscrever nas atualizações de listas quando o componente for montado.
    *   Dentro do `useEffect`, chame a função `getLists` do serviço (a versão refatorada para tempo real).
    *   Passe um callback para `getLists` que atualize o estado das listas (`setLists`).
    *   O `useEffect` deve retornar a função `unsubscribe` fornecida por `getLists` para limpar o listener quando o componente for desmontado.
*   **Retorno do Hook**: O hook deve retornar um objeto contendo:
    *   `lists`: O array de listas do estado.
    *   `createList`: A função do serviço para criar uma nova lista.
    *   (Opcional) `updateList`, `deleteList`: Funções correspondentes do serviço.

### 2. Criar o Hook `useTasks`

*   **Arquivo**: `src/modules/task-lists/hooks/useTasks.ts`
*   **Parâmetros**: O hook deve aceitar `listId: string` como argumento.
*   **Estado**: Utilize `useState<Task[]>([])` para armazenar as tarefas.
*   **Efeito**: Utilize `useEffect` que depende de `listId`.
    *   Dentro do `useEffect`, verifique se `listId` existe. Se não, limpe o estado das tarefas e retorne.
    *   Chame a função `getTasks(listId, callback)` do serviço.
    *   Passe um callback que atualize o estado das tarefas (`setTasks`).
    *   O `useEffect` deve retornar a função `unsubscribe` para limpar o listener quando o `listId` mudar ou o componente for desmontado.
*   **Retorno do Hook**: O hook deve retornar um objeto contendo:
    *   `tasks`: O array de tarefas do estado.
    *   `createTask`: Uma função que chama o `createTask` do serviço. O `listId` já estará disponível no escopo do hook, então a função que o componente chama só precisará passar os dados da nova tarefa (ex: `text`).
    *   `updateTask`: Similar a `createTask`, encapsulando a chamada ao serviço e injetando o `listId`.
    *   `deleteTask`: Similar a `createTask`, encapsulando a chamada ao serviço e injetando o `listId`.