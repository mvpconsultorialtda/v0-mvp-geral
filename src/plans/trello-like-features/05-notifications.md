
# Plano de Implementação: Notificações

**Objetivo**: Implementar notificações push para manter os usuários informados sobre eventos importantes.

**Passos**:

1.  **Configurar o Firebase Cloud Messaging (FCM)**:
    *   Configure o FCM no seu projeto Firebase.
    *   Implemente a lógica no lado do cliente para solicitar permissão de notificação e obter o token de dispositivo FCM do usuário.

2.  **Armazenar os Tokens de Dispositivo**:
    *   Crie uma coleção no Firestore (ex: `users`) para armazenar os tokens de dispositivo FCM para cada usuário.

3.  **Criar as Cloud Functions de Notificação**:
    *   Crie Cloud Functions acionadas por eventos do Firestore (ex: `onCreate` em `comments`, `onUpdate` em `tasks` quando um `assigneeId` é adicionado).
    *   A função determinará quais usuários notificar, buscará seus tokens de dispositivo e enviará uma notificação push usando o SDK do Admin do Firebase.

4.  **Testar as Notificações**:
    *   Realize as ações que acionam notificações e verifique se as notificações são recebidas nos dispositivos dos usuários.
