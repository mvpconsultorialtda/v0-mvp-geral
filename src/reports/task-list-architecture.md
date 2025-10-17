# Arquitetura Ideal do Módulo de Lista de Tarefas Colaborativa

## 1. Visão Geral e Princípios Arquiteturais

Este documento descreve a arquitetura de referência para o módulo de lista de tarefas, projetado para ser uma ferramenta colaborativa, em tempo real e escalável. A arquitetura é construída sobre uma base moderna, utilizando Next.js para renderização de frontend e backend, e o Firebase (especificamente o Firestore) como a principal plataforma de banco de dados e sincronização de dados.

Os princípios norteadores desta arquitetura são:

*   **Reatividade em Tempo Real**: A interface do usuário (UI) deve refletir o estado atual dos dados sem a necessidade de atualização manual. Alterações feitas por qualquer colaborador em uma lista de tarefas compartilhada são propagadas instantaneamente para todos os outros membros.
*   **Separação de Preocupações (Separation of Concerns)**: A lógica de apresentação (componentes React), gerenciamento de estado do cliente e a lógica de acesso a dados (serviços) são claramente compartimentalizadas. Isso promove a manutenibilidade, testabilidade e escalabilidade do código.
*   **Escalabilidade**: A estrutura de dados e a lógica de consulta são projetadas para suportar um grande número de usuários, listas e tarefas, aproveitando o modelo de dados NoSQL escalável do Firestore.
*   **Segurança**: O acesso aos dados é rigorosamente controlado por meio de regras de segurança do lado do servidor, garantindo que os usuários só possam acessar e modificar os dados aos quais têm permissão.
*   **Funcionalidades Abrangentes**: A arquitetura deve suportar um conjunto rico de funcionalidades, incluindo gerenciamento de permissões, informações detalhadas de tarefas e trilhas de auditoria.

## 2. Arquitetura de Frontend (Next.js e React)

O frontend é construído como uma Single-Page Application (SPA) utilizando React e o framework Next.js. A estrutura de componentes é modular e reutilizável.

### 2.1. Gerenciamento de Estado com Hooks e Context

Para evitar o "prop drilling" e para gerenciar de forma centralizada o estado, a arquitetura utiliza uma combinação de React Context e hooks customizados.

*   **`useLists` Hook**:
    *   Responsável por buscar e gerenciar o estado das listas de tarefas do usuário.
    *   Fornece um array de listas (`TaskList[]`) e funções para criar, atualizar ou excluir listas.
    *   Exemplo: `const { lists, createList } = useLists();`

*   **`useTasks(listId)` Hook**:
    *   Responsável por gerenciar as tarefas de uma lista específica.
    *   Encapsula a lógica de busca em tempo real, criação, atualização, reordenação e exclusão de tarefas.
    *   Exemplo: `const { tasks, createTask, updateTask } = useTasks(currentListId);`

*   **`usePermissions(listId)` Hook (Novo)**:
    *   Gerencia os usuários e suas respectivas permissões para uma lista específica.
    *   Fornece funções para adicionar, remover e atualizar as permissões dos usuários.
    *   Exemplo: `const { members, addUser, removeUser } = usePermissions(currentListId);`

### 2.2. Estrutura de Componentes

*   **`TaskListsSidebar`**: Exibe as listas de tarefas, permitindo a seleção de uma lista ativa.
*   **`KanbanBoardView` / `TasksListView`**: Exibe as tarefas da lista selecionada.
*   **`TaskItem`**: Representa uma única tarefa.
*   **`TaskDetailView` (Expandido)**: Uma visão detalhada da tarefa, similar a um card do Trello. Permite a edição de:
    *   Título e Descrição.
    *   Data de Vencimento.
    *   Anexos.
    *   Comentários.
    *   Visualização do Log de Atividades da tarefa.
*   **`ListSettingsModal` (Novo)**: Um modal para gerenciar as configurações da lista, incluindo a adição/remoção de membros e a definição de suas permissões.

## 3. Camada de Serviço e Acesso a Dados

A comunicação com o Firestore é abstraída por uma camada de serviço em `src/modules/task-lists/services/task-lists.service.ts`.

### 3.1. Sincronização em Tempo Real com `onSnapshot`

O método `onSnapshot` do Firestore é usado para todas as consultas de leitura, garantindo que a UI esteja sempre sincronizada em tempo real com o banco de dados.

### 3.2. Operações de Escrita (CRUD e Ações Adicionais)

As funções de escrita são assíncronas e incluem:
*   Gerenciamento de listas: `createList`, `updateList`, `deleteList`.
*   Gerenciamento de tarefas: `createTask`, `updateTask`, `deleteTask`.
*   Gerenciamento de informações da tarefa: `updateTaskDescription`, `addTaskComment`, `addTaskAttachment`.
*   Gerenciamento de permissões: `addUserToList`, `removeUserFromList`, `updateUserRole`.

## 4. Arquitetura de Backend (Firebase Firestore)

### 4.1. Estrutura de Dados NoSQL

*   **Coleção `lists`**:
    *   `{listId}`
        *   `name`: "Roadmap do Produto"
        *   `ownerId`: "user_abc"
        *   `members`: { "user_xyz": "editor", "user_123": "viewer" }  **(Estrutura de Permissões)**
        *   `createdAt`: Timestamp

*   **Subcoleção `tasks`**:
    *   `lists/{listId}/tasks/{taskId}`
        *   `text`: "Implementar autenticação"
        *   `status`: "Em Progresso"
        *   `order`: 1
        *   `description`: "Descrição detalhada da tarefa..." **(Trello-like)**
        *   `dueDate`: Timestamp **(Trello-like)**
        *   `assigneeId`: "user_xyz" **(Novo)**
        *   `dependsOn`: ["taskId_anterior"] **(Novo)**

*   **Novas Subcoleções (Trello-like)**:
    *   `lists/{listId}/tasks/{taskId}/comments`: Subcoleção para comentários.
    *   `lists/{listId}/tasks/{taskId}/attachments`: Subcoleção para anexos.
    *   `lists/{listId}/activity`: Subcoleção para o log de atividades da lista.

### 4.2. Regras de Segurança do Firestore

As regras de segurança são a base da proteção dos dados.

*   **Acesso a Listas**:
    *   Leitura: Permitida se o `request.auth.uid` for `ownerId` ou uma chave no mapa `members`.
    *   Criação: Permitida se o `ownerId` do novo documento for o `request.auth.uid`.
    *   Atualização: Permitida para o `ownerId` ou para `members` com a role "editor".
    *   Exclusão: Permitida apenas para o `ownerId`.

*   **Acesso a Tarefas e Subcoleções**:
    *   Permitido se o usuário tiver permissão de leitura na lista pai e, para operações de escrita, se tiver a role "editor" ou for o `ownerId` da lista.

### 4.3. Funcionalidades Adicionais e Ideias (Expandido)

1.  **Exclusão de Listas (Cascading Deletes)**:
    *   **Descrição Detalhada**: A exclusão de uma lista é uma ação destrutiva que precisa remover não apenas o documento da lista, mas também todos os dados relacionados para evitar dados órfãos e custos desnecessários. Isso inclui todas as tarefas, comentários e anexos associados.
    *   **Implementação Técnica**: Será criada uma Cloud Function do Firebase (especificamente, uma função acionada pelo `onDelete` de um documento em `lists/{listId}`). Esta função receberá o `listId` da lista excluída e executará um script para apagar recursivamente todas as subcoleções (`tasks`, `activity`) e quaisquer dados associados no Firebase Storage (como anexos de arquivos). A função precisará lidar com a exclusão em lote para ser eficiente e evitar exceder os limites de execução.

2.  **Adicionar Usuários e Listas de Permissões**:
    *   **Descrição Detalhada**: Para permitir a colaboração, os proprietários de listas precisam de um controle granular sobre quem pode ver e editar suas listas. O sistema de permissões terá três níveis: `owner` (proprietário, com controle total), `editor` (pode editar/adicionar/remover tarefas, mas não excluir a lista ou gerenciar usuários), e `viewer` (apenas visualização).
    *   **Implementação Técnica**: A interface do usuário terá um modal de "Gerenciar Membros", onde o proprietário pode inserir o e-mail de um usuário. Uma Cloud Function (invocável pelo cliente) será usada para validar o e-mail, encontrar o UID do usuário correspondente no Firebase Authentication e, em seguida, adicionar uma entrada no mapa `members` do documento da lista. As Regras de Segurança do Firestore (`firestore.rules`) serão a principal forma de aplicar essas permissões, lendo o mapa `members` para autorizar ou negar operações de leitura/escrita.

3.  **Informações Detalhadas de Tarefas (Molde Trello)**:
    *   **Descrição Detalhada**: Para que as tarefas sejam mais do que simples itens de "a fazer", elas precisam de um contexto rico. Cada tarefa se tornará um "card" detalhado. Os usuários poderão abrir uma tarefa para ver uma descrição formatada (com suporte a markdown), definir datas de vencimento, anexar arquivos (imagens, documentos), e ter uma conversa encadeada na forma de comentários.
    *   **Implementação Técnica**: O modelo de dados da tarefa no Firestore será expandido para incluir campos opcionais como `description` (string), `dueDate` (timestamp), e `attachments` (um array de objetos com `name`, `url`, `type`). Os comentários serão uma subcoleção (`comments`) dentro de cada tarefa para permitir paginação e carregamento eficiente. Os anexos de arquivos serão enviados para o Firebase Storage em um caminho específico (`/attachments/{listId}/{taskId}/{fileName}`), e a URL de download será armazenada no documento da tarefa.

4.  **Log de Atividades**:
    *   **Descrição Detalhada**: Para manter todos os colaboradores informados e fornecer um histórico de alterações, cada lista terá um log de atividades visível. Este log registrará ações como "Usuário X criou a tarefa Y", "Usuário Z moveu a tarefa W para 'Concluído'", ou "Usuário A adicionou Usuário B à lista".
    *   **Implementação Técnica**: Uma subcoleção `activity` será criada em cada documento de lista. Cloud Functions (acionadas por `onCreate`, `onUpdate`, `onDelete` nas tarefas e por alterações no mapa `members` da lista) serão usadas para registrar esses eventos de forma assíncrona. Cada documento de atividade conterá o tipo de ação, o autor, a data e os detalhes relevantes. A UI exibirá esses logs em ordem cronológica inversa.

5.  **Notificações**:
    *   **Descrição Detalhada**: Os usuários devem ser notificados proativamente sobre eventos importantes, mesmo quando não estão com o aplicativo aberto. As notificações podem ser enviadas quando um usuário é adicionado a uma lista, quando uma tarefa lhe é atribuída, ou quando um comentário é feito em uma tarefa que ele segue.
    *   **Implementação Técnica**: Esta funcionalidade será construída sobre o Firebase Cloud Messaging (FCM). Cloud Functions observarão as alterações relevantes no Firestore (ex: a criação de um comentário). A função determinará quais usuários devem ser notificados, obterá seus tokens de dispositivo FCM (que serão armazenados em uma coleção `users` separada) e enviará a notificação push.

6.  **Busca e Filtros Avançados**:
    *   **Descrição Detalhada**: Em listas com muitas tarefas, encontrar informações específicas rapidamente é crucial. Os usuários poderão pesquisar tarefas por texto (no título ou descrição) e aplicar filtros para refinar a visualização, como mostrar apenas tarefas atribuídas a um usuário específico, tarefas com uma determinada data de vencimento ou tarefas em um determinado status.
    *   **Implementação Técnica**: Para busca de texto completo (full-text), a integração com um serviço de terceiros como Algolia ou Typesense é a abordagem mais robusta. Uma Cloud Function sincronizará os dados das tarefas com o índice de busca. Para filtros simples (por `assigneeId`, `status`), consultas compostas do Firestore podem ser usadas diretamente, o que pode exigir a criação de índices compostos no console do Firebase.

7.  **Dependências entre Tarefas**:
    *   **Descrição Detalhada**: Para projetos mais complexos, as tarefas muitas vezes dependem da conclusão de outras. A UI visualizará essas dependências (por exemplo, mostrando um ícone ou uma linha conectando as tarefas) e poderá impor regras, como impedir que uma tarefa seja marcada como "Concluída" se suas tarefas dependentes ainda estiverem pendentes.
    *   **Implementação Técnica**: Um campo `dependsOn` (um array de `taskId`s) será adicionado ao modelo de dados da tarefa. A lógica para aplicar as regras de dependência residirá principalmente no frontend (desabilitando botões ou mostrando avisos), mas também pode ser reforçada por meio de Cloud Functions se for necessária uma validação mais rigorosa no backend.

8.  **Atribuição de Tarefas**:
    *   **Descrição Detalhada**: Para delegar trabalho e esclarecer responsabilidades, as tarefas podem ser atribuídas a um ou mais membros da lista. O avatar do membro atribuído será exibido no card da tarefa para uma visualização rápida de quem é o responsável.
    *   **Implementação Técnica**: Um campo `assigneeId` (ou `assigneeIds` para múltiplos responsáveis) será adicionado ao documento da tarefa. Este campo armazenará o UID do usuário. A UI permitirá a seleção de um membro a partir de uma lista suspensa de todos os usuários que pertencem à lista (lidos do mapa `members`). As Regras de Segurança podem, opcionalmente, dar permissões de edição adicionais ao usuário atribuído para "sua" tarefa.
