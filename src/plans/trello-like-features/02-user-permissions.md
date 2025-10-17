
# Plano de Implementação: Adicionar Usuários e Listas de Permissões

**Objetivo**: Implementar um sistema de permissões baseado em roles para colaboração em listas.

**Passos**:

1.  **Atualizar a Estrutura de Dados**:
    *   Modifique a coleção `lists` para incluir um mapa `members` para armazenar as permissões dos usuários (ex: `{"userId": "editor"}`).

2.  **Criar a UI de Gerenciamento de Membros**:
    *   Desenvolva um modal (`ListSettingsModal`) que permita aos proprietários de listas adicionar/remover membros e atribuir roles (`editor`, `viewer`).

3.  **Implementar a Lógica de Backend**:
    *   Crie uma Cloud Function (ou um endpoint de API) que receba um e-mail de usuário, valide-o, encontre o UID correspondente e atualize o mapa `members` na lista.

4.  **Atualizar as Regras de Segurança**:
    *   Modifique as `firestore.rules` para ler o mapa `members` e aplicar as permissões de leitura/escrita com base na role do usuário.

5.  **Testar as Permissões**:
    *   Crie usuários de teste com diferentes roles e verifique se eles têm o acesso esperado às listas e tarefas.
