# Plano de Alteração: Refatoração dos Serviços para Tempo Real

**Arquivo-alvo**: `src/modules/task-lists/services/task-lists.service.ts`

## Objetivo

Substituir as buscas únicas (`getDocs`) por listeners em tempo real (`onSnapshot`) para as funções `getLists` e `getTasks`. Isso garantirá que a UI sempre reflita o estado mais recente do Firestore.

## Passos de Implementação

1.  **Alterar a assinatura das funções**:
    *   Modifique `getLists` para `getLists(callback: (lists: TaskList[]) => void): () => void`. A função agora aceitará um callback a ser invocado com os dados atualizados e retornará uma função `unsubscribe` para limpar o listener.
    *   Modifique `getTasks` para `getTasks(listId: string, callback: (tasks: Task[]) => void): () => void`. A mesma alteração de padrão, mas agora exigindo `listId`.

2.  **Implementar `onSnapshot` para `getLists`**:
    *   Dentro de `getLists`, construa as duas consultas (para listas do proprietário e compartilhadas) como antes.
    *   Use `onSnapshot` em ambas as consultas.
    *   No callback do `onSnapshot`, combine os resultados das duas snapshots, mapeie os documentos para o tipo `TaskList` (convertendo timestamps, etc.) e armazene-os em um mapa para desduplicação.
    *   Invoque o `callback` fornecido com o array de listas combinado.
    *   A função deve retornar uma nova função que chama as funções `unsubscribe` retornadas por ambas as chamadas `onSnapshot`.

3.  **Implementar `onSnapshot` para `getTasks`**:
    *   Dentro de `getTasks`, crie a referência para a subcoleção `tasks` usando o `listId`.
    *   Crie a consulta com `orderBy('order', 'asc')`.
    *   Chame `onSnapshot` na consulta.
    *   No callback, mapeie os documentos da snapshot para o tipo `Task`.
    *   Invoque o `callback` fornecido com o array de tarefas.
    *   Retorne a função `unsubscribe` da chamada `onSnapshot`.