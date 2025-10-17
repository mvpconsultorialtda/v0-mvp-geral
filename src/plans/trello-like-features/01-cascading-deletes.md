
# Plano de Implementação: Exclusão de Listas (Cascading Deletes)

**Objetivo**: Implementar a exclusão em cascata de todos os sub-dados de uma lista quando ela for excluída, garantindo a integridade dos dados e evitando dados órfãos.

**Passos**:

1.  **Criar a Cloud Function**:
    *   Crie uma nova Cloud Function acionada pelo evento `onDelete` em documentos da coleção `lists`.
    *   A função receberá o `listId` do documento excluído.

2.  **Implementar a Lógica de Exclusão**:
    *   Dentro da função, use o `listId` para consultar todas as subcoleções (`tasks`, `activity`).
    *   Para cada tarefa na subcoleção `tasks`, exclua as subcoleções aninhadas (`comments`, `attachments`).
    *   Exclua todos os documentos nas subcoleções `tasks` e `activity`.
    *   Se houver arquivos no Firebase Storage associados à lista, use o SDK do Admin para excluí-los.

3.  **Testar a Função**:
    *   Crie uma lista de teste com tarefas, comentários e anexos.
    *   Exclua a lista e verifique se todos os dados associados foram removidos do Firestore e do Storage.
