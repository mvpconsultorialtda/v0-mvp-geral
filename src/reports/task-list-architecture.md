# Arquitetura Ideal do Módulo de Lista de Tarefas Colaborativa

## 1. Visão Geral e Princípios Arquiteturais

Este documento descreve a arquitetura de referência para o módulo de lista de tarefas, projetado para ser uma ferramenta colaborativa, em tempo real e escalável. A arquitetura é construída sobre uma base moderna, utilizando Next.js para renderização de frontend e backend, e o Firebase (especificamente o Firestore) como a principal plataforma de banco de dados e sincronização de dados.

Os princípios norteadores desta arquitetura são:

*   **Reatividade em Tempo Real**: A interface do usuário (UI) deve refletir o estado atual dos dados sem a necessidade de atualização manual. Alterações feitas por qualquer colaborador em uma lista de tarefas compartilhada são propagadas instantaneamente para todos os outros membros.
*   **Separação de Preocupações (Separation of Concerns)**: A lógica de apresentação (componentes React), gerenciamento de estado do cliente e a lógica de acesso a dados (serviços) são claramente compartimentalizadas. Isso promove a manutenibilidade, testabilidade e escalabilidade do código.
*   **Escalabilidade**: A estrutura de dados e a lógica de consulta são projetadas para suportar um grande número de usuários, listas e tarefas, aproveitando o modelo de dados NoSQL escalável do Firestore.
*   **Segurança**: O acesso aos dados é rigorosamente controlado por meio de regras de segurança do lado do servidor, garantindo que os usuários só possam acessar e modificar os dados aos quais têm permissão.

## 2. Arquitetura de Frontend (Next.js e React)

O frontend é construído como uma Single-Page Application (SPA) utilizando React e o framework Next.js. A estrutura de componentes é modular e reutilizável.

### 2.1. Gerenciamento de Estado com Hooks e Context

Para evitar o "prop drilling" (passagem excessiva de propriedades através de múltiplos níveis de componentes) e para gerenciar de forma centralizada o estado das listas e tarefas, a arquitetura utiliza uma combinação de React Context e hooks customizados.

*   **`useLists` Hook**:
    *   Responsável por buscar e gerenciar o estado das listas de tarefas do usuário.
    *   Internamente, este hook chama o serviço `task-lists.service.ts` para estabelecer uma conexão em tempo real com o Firestore.
    *   Ele fornece um array de listas (`TaskList[]`) e funções para criar, atualizar ou excluir listas.
    *   Exemplo de uso: `const { lists, createList } = useLists();`

*   **`useTasks(listId)` Hook**:
    *   Responsável por gerenciar as tarefas de uma lista específica, identificada por `listId`.
    *   Este hook encapsula toda a lógica relacionada às tarefas: busca em tempo real, criação, atualização de status, reordenação e exclusão.
    *   O `listId` é um parâmetro obrigatório, garantindo que todas as operações de backend recebam o identificador de contexto necessário.
    *   Exemplo de uso: `const { tasks, createTask, updateTask } = useTasks(currentListId);`

### 2.2. Estrutura de Componentes

*   **`TaskListsSidebar`**: Exibe a lista de todas as listas de tarefas disponíveis para o usuário, utilizando o hook `useLists` para obter os dados. Permite a seleção de uma lista ativa.
*   **`KanbanBoardView` / `TasksListView`**: O componente principal que exibe as tarefas da lista selecionada. Ele utiliza o hook `useTasks(selectedListId)` para obter e exibir as tarefas.
*   **`TaskItem`**: Um componente que representa uma única tarefa. Ele recebe a tarefa e as funções de callback (`onUpdate`, `onDelete`) do seu componente pai (`TasksListView`).
*   **`ListEditModal` e `TaskDetailView`**: Componentes modais ou de sobreposição para editar os detalhes de uma lista ou de uma tarefa, respectivamente. Eles recebem os dados necessários como props e utilizam as funções dos hooks para persistir as alterações.

## 3. Camada de Serviço e Acesso a Dados

A comunicação com o Firestore é abstraída por uma camada de serviço, localizada em `src/modules/task-lists/services/task-lists.service.ts`. Esta camada desacopla os componentes React dos detalhes de implementação do Firebase SDK.

### 3.1. Sincronização em Tempo Real com `onSnapshot`

A principal característica da camada de serviço é o uso do método `onSnapshot` do Firestore para todas as consultas de leitura.

*   **`getLists(callback)`**: Em vez de retornar uma promessa com um conjunto de dados estático, esta função estabelece um listener na coleção `lists`. Ela invoca uma função de `callback` fornecida com a lista de documentos mais recente sempre que houver uma alteração (adição, modificação, exclusão) nos dados que correspondem à consulta (listas do proprietário ou compartilhadas). O hook `useLists` passa uma função que atualiza seu estado interno como o callback.

*   **`getTasks(listId, callback)`**: Da mesma forma, esta função estabelece um listener na subcoleção `tasks` de uma `list` específica. Ela atualiza o cliente em tempo real à medida que as tarefas são adicionadas, marcadas como concluídas, reordenadas, etc. O hook `useTasks` utiliza esta função para se manter sincronizado.

### 3.2. Operações de Escrita (CRUD)

As funções de criação, atualização e exclusão (`createList`, `createTask`, `updateTask`, `deleteTask`) são implementadas como funções assíncronas padrão que retornam promessas. Elas são projetadas para receber todos os identificadores necessários (`listId`, `taskId`) como argumentos, um padrão garantido pelo design dos hooks `useTasks` e `useLists`.

## 4. Arquitetura de Backend (Firebase Firestore)

### 4.1. Estrutura de Dados NoSQL

A arquitetura de dados no Firestore é projetada para consultas eficientes e escaláveis.

*   **Coleção `lists`**: A coleção raiz para as listas de tarefas.
    *   `{listId}`
        *   `name`: "Lista de Compras"
        *   `ownerId`: "user_abc"
        *   `sharedWith`: ["user_xyz", "user_123"]
        *   `createdAt`: Timestamp

*   **Subcoleção `tasks`**: Aninhada dentro de cada documento de lista. Este modelo permite o carregamento de tarefas específicas de uma lista sem a necessidade de carregar todas as tarefas de todas as listas.
    *   `lists/{listId}/tasks/{taskId}`
        *   `text`: "Comprar leite"
        *   `status`: "Pendente"
        *   `order`: 1
        *   `completed`: false

### 4.2. Regras de Segurança do Firestore

A segurança é imposta no nível do banco de dados através de `firestore.rules`. Estas regras são a espinha dorsal da proteção de dados.

*   **Acesso a Listas**:
    *   Leitura (`get`, `list`): Permitida se o `request.auth.uid` do usuário for igual ao `ownerId` do documento ou se estiver presente no array `sharedWith`.
    *   Criação (`create`): Permitida se o `ownerId` do novo documento for igual ao `request.auth.uid` do usuário.
    *   Atualização (`update`): Permitida apenas para o `ownerId`.
    *   Exclusão (`delete`): Permitida apenas para o `ownerId`.

*   **Acesso a Tarefas**:
    *   Leitura, Criação, Atualização, Exclusão: Permitido se o usuário tiver permissão de leitura para a lista pai (documento em `/lists/{listId}`). Isso é verificado usando uma chamada `exists()` para o documento da lista pai dentro da regra da tarefa.

Essa estrutura garante que as consultas do lado do cliente não possam contornar as permissões, fornecendo uma arquitetura segura e robusta de ponta a ponta.
