
# Plano de Implementação: Informações Detalhadas de Tarefas (Molde Trello)

**Objetivo**: Enriquecer as tarefas com campos detalhados, como descrição, data de vencimento, anexos e comentários.

**Passos**:

1.  **Atualizar a Estrutura de Dados da Tarefa**:
    *   Adicione os campos `description` (string) e `dueDate` (timestamp) ao modelo de dados da tarefa no Firestore.
    *   Crie subcoleções `comments` e `attachments` dentro de cada documento de tarefa.

2.  **Expandir a UI da Tarefa (`TaskDetailView`)**:
    *   Modifique o componente `TaskDetailView` para exibir e permitir a edição dos novos campos.
    *   Implemente um editor de texto rico (ex: com Markdown) para o campo de descrição.
    *   Adicione um seletor de data para o campo `dueDate`.
    *   Crie uma seção de comentários para exibir e adicionar novos comentários.
    *   Implemente a funcionalidade de upload de arquivos para a seção de anexos, que fará o upload para o Firebase Storage e salvará a referência no Firestore.

3.  **Implementar a Lógica de Backend**:
    *   Crie as funções de serviço necessárias para atualizar a descrição, data de vencimento, adicionar comentários e anexos.

4.  **Testar a Funcionalidade**:
    *   Crie e edite tarefas, adicionando todos os novos tipos de informações, e verifique se os dados são salvos e exibidos corretamente.
