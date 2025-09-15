# Plano de Construção Adaptado: Módulo de Listas de Tarefas

Este plano foi adaptado para se alinhar com a arquitetura modular e os princípios de design de dados do seu projeto, conforme descrito no `README.md`.

## 1. Estrutura do Módulo

A estrutura de diretórios que você propôs está perfeita e segue a filosofia de "Legos" do projeto. Vamos mantê-la:

```
/src
|-- /modules
|   |-- /task-lists
|       |-- /components          # Componentes React (TaskList, TaskItem, etc.)
|       |-- /hooks               # Hooks personalizados (ex: useTaskLists)
|       |-- /services            # Funções de interação com o Firebase
|       |-- /types               # Definições de tipos (TypeScript)
|       |-- index.ts             # Ponto de entrada do módulo
```

## 2. Configuração do Firebase e Modelagem de Dados (Adaptado)

Usaremos o Firebase Authentication e o Cloud Firestore. A modelagem de dados será ajustada para seguir o princípio de "recursos separados" do seu projeto.

**a) Coleções no Firestore:**

Em vez de uma subcoleção, teremos duas coleções-raiz:

1.  **`lists`**:
    *   **Documento**: Cada documento é uma lista de tarefas.
    *   **Campos**:
        *   `name` (string): Nome da lista.
        *   `ownerId` (string): UID do proprietário.
        *   `sharedWith` (array de strings): UIDs de usuários com quem a lista é compartilhada.
        *   `createdAt` (timestamp).

2.  **`tasks`**:
    *   **Documento**: Cada documento é uma tarefa individual.
    *   **Campos**:
        *   `listId` (string): **Referência** ao documento na coleção `lists`.
        *   `text` (string): Descrição da tarefa.
        *   `completed` (boolean): Status da tarefa.
        *   `order` (number): Posição para ordenação.
        *   `createdAt` (timestamp).

Essa abordagem evita aninhar dados, melhora a performance de queries e está em conformidade com as diretrizes de design do seu `README.md`.

**b) Regras de Segurança do Firestore (Adaptadas):**

As regras precisam ser ajustadas para o modelo de duas coleções.

```json
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Regras para a coleção de listas
    match /lists/{listId} {
      function userHasAccess() {
        return request.auth.uid == resource.data.ownerId || request.auth.uid in resource.data.sharedWith;
      }

      allow read, update: if userHasAccess();
      allow create: if request.auth.uid == request.resource.data.ownerId;
      allow delete: if request.auth.uid == resource.data.ownerId;
    }

    // Regras para a coleção de tarefas
    match /tasks/{taskId} {
      function userHasAccessToList() {
        let list = get(/databases/$(database)/documents/lists/$(request.resource.data.listId)).data;
        return request.auth.uid == list.ownerId || request.auth.uid in list.sharedWith;
      }

       function userHadAccessToList() {
        let list = get(/databases/$(database)/documents/lists/$(resource.data.listId)).data;
        return request.auth.uid == list.ownerId || request.auth.uid in list.sharedWith;
      }

      allow read, update, delete: if userHadAccessToList();
      allow create: if userHasAccessToList();
    }
  }
}
```

## 3. Desenvolvimento do Frontend

A sua abordagem para o frontend está excelente.

*   **Bibliotecas de UI**: Continue com a ideia de usar `MUI`, `React Bootstrap` ou outra de sua preferência.
*   **Drag and Drop**: `@dnd-kit` é uma ótima escolha, moderna e eficiente.
*   **Componentes React**: A lista de componentes (`TaskListsView`, `TaskList`, `TaskItem`, `CreateListModal`, `ShareListForm`) está perfeita. Eles irão consumir os hooks e serviços que interagem com o Firestore.

## 4. Lógica de Backend e API Routes (RESTful)

As API Routes do Next.js são ideais para encapsular a lógica de acesso a dados, seguindo o padrão RESTful granular que seu projeto preconiza.

**Exemplos de Endpoints da API:**

*   `POST /api/lists`: Cria uma nova lista.
*   `GET /api/lists`: Obtém as listas do usuário autenticado.
*   `GET /api/lists/[listId]/tasks`: Obtém as tarefas de uma lista específica.
*   `POST /api/lists/[listId]/tasks`: Cria uma nova tarefa em uma lista.
*   `PATCH /api/tasks/[taskId]`: Atualiza uma tarefa (ex: marcar como concluída).
*   `DELETE /api/tasks/[taskId]`: Deleta uma tarefa.
*   `POST /api/lists/[listId]/share`: Compartilha uma lista com outro usuário.

Essa estrutura de API reflete diretamente a modelagem de dados granular e desacoplada. Os serviços no diretório `/src/modules/task-lists/services` farão as chamadas para essas APIs.

## Resumo do Plano de Ação Adaptado:

1.  **Estrutura**: Crie a pasta `/modules/task-lists`.
2.  **Firebase**: Configure o Authentication e o Firestore com as coleções `lists` e `tasks` separadas.
3.  **Regras de Segurança**: Implemente as regras de segurança adaptadas.
4.  **Backend**: Desenvolva as API Routes RESTful para cada recurso (`lists`, `tasks`).
5.  **Frontend**:
    *   Escolha e instale as bibliotecas de UI e D&D.
    *   Desenvolva os componentes React.
    *   Crie os serviços (`/services`) para fazer fetch nas suas novas API Routes.
    *   Crie os hooks (`/hooks`) para gerenciar o estado e a lógica da UI.
6.  **Integração**: Conecte os componentes aos hooks e serviços para criar a experiência do usuário final.

Este plano revisado garante que o novo módulo de `task-lists` não seja apenas funcional, mas também um "Lego" perfeitamente compatível com a fundação arquitetônica do seu projeto.
