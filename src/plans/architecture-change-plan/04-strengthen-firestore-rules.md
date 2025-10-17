# Plano de Alteração: Fortalecimento das Regras de Segurança do Firestore

**Arquivo-alvo**: `firestore.rules`

## Objetivo

Implementar e refinar as regras de segurança do Firestore para garantir que a manipulação de dados (leitura e escrita) seja estritamente controlada no lado do servidor, conforme definido na arquitetura ideal.

## Passos de Implementação

1.  **Revisar e Organizar o Arquivo `firestore.rules`**:
    *   Certifique-se de que a versão do rules seja `rules_version = '2';`.
    *   Estruture o arquivo para corresponder à sua estrutura de banco de dados (`service cloud.firestore { match /databases/{database}/documents { ... } }`).

2.  **Implementar Regras para a Coleção `lists`**:
    *   Adicione um bloco `match /lists/{listId}`.
    *   **Leitura (`allow read`)**: Permita a leitura (`get`, `list`) se o ID do usuário autenticado (`request.auth.uid`) for igual ao `ownerId` do documento (`resource.data.ownerId`) OU se o ID do usuário estiver no array `sharedWith` (`request.auth.uid in resource.data.sharedWith`).
    *   **Criação (`allow create`)**: Permita a criação se o `ownerId` do novo documento (`request.resource.data.ownerId`) for igual ao ID do usuário que faz a requisição. Adicione validações para garantir que os campos necessários (`name`, `ownerId`) estejam presentes.
    *   **Atualização (`allow update`)**: Permita a atualização apenas se o requisitante for o `ownerId` do documento. Geralmente, apenas campos como `name`, `description` e `sharedWith` devem ser mutáveis.
    *   **Exclusão (`allow delete`)**: Permita a exclusão apenas se o requisitante for o `ownerId`.

3.  **Implementar Regras para a Subcoleção `tasks`**:
    *   Adicione um bloco aninhado `match /tasks/{taskId}` dentro do bloco de `lists`.
    *   **Definir uma Função Auxiliar (Opcional, mas recomendado)**: Crie uma função no topo do arquivo de regras, como `isAllowedToReadList(listId)`, que verifica a permissão de leitura na lista pai. Isso evita a repetição de lógica.
        ```rules
        function isAllowedToReadList(listId) {
          let listDoc = get(/databases/$(database)/documents/lists/$(listId)).data;
          return request.auth.uid == listDoc.ownerId || request.auth.uid in listDoc.sharedWith;
        }
        ```
    *   **CRUD de Tarefas (`allow read, write`)**: Permita todas as operações de leitura e escrita (`read`, `create`, `update`, `delete`) na subcoleção de tarefas se o usuário tiver permissão de leitura na lista pai. Use a função auxiliar para isso: `allow read, write: if isAllowedToReadList(listId);`.
    *   Adicione validações de dados para a criação e atualização de tarefas (ex: `text` deve ser uma string, `completed` deve ser um booleano).

4.  **Testar as Regras**:
    *   Utilize o Emulador do Firebase e o simulador de regras de segurança no Console do Firebase para testar exaustivamente todos os casos de uso:
        *   Usuário não autenticado tentando acessar dados.
        *   Usuário tentando ler uma lista que não pertence a ele e não é compartilhada.
        *   Usuário em uma lista compartilhada tentando adicionar/modificar uma tarefa (deve ser permitido).
        *   Usuário em uma lista compartilhada tentando excluir a lista (não deve ser permitido).
        *   Usuário tentando criar uma lista para outro usuário (não deve ser permitido).