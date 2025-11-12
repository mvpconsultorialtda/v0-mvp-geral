import { getFirestore } from "../firebase-admin.server";

/**
 * Verifica se um usuário é o proprietário de uma lista específica.
 *
 * @param listId O ID da lista a ser verificada.
 * @param userId O ID do usuário para verificar a propriedade.
 * @returns {Promise<boolean>} True se o usuário for o proprietário, false caso contrário.
 */
export async function verifyListOwnership(listId: string, userId: string): Promise<boolean> {
  if (!listId || !userId) {
    return false;
  }

  const db = getFirestore();
  try {
    const listRef = db.collection('lists').doc(listId);
    const listDoc = await listRef.get();

    if (!listDoc.exists) {
      console.warn(`Attempted to access non-existent list: ${listId}`);
      return false;
    }

    const listData = listDoc.data();
    // Verifica se o usuário é o proprietário ou se está na lista de compartilhamento.
    // (A lógica de compartilhamento pode ser adicionada aqui no futuro)
    return listData?.ownerId === userId;
  } catch (error) {
    console.error(`Error verifying ownership for list ${listId}:`, error);
    return false;
  }
}

/**
 * Verifica se um usuário tem permissão para acessar uma tarefa.
 * Isso é feito verificando a propriedade da lista à qual a tarefa pertence.
 *
 * @param taskId O ID da tarefa a ser verificada.
 * @param userId O ID do usuário para verificar a permissão.
 * @returns {Promise<boolean>} True se o usuário tiver permissão, false caso contrário.
 */
export async function verifyTaskPermission(taskId: string, userId: string): Promise<boolean> {
  if (!taskId || !userId) {
    return false;
  }

  const db = getFirestore();
  try {
    const taskRef = db.collection('tasks').doc(taskId);
    const taskDoc = await taskRef.get();

    if (!taskDoc.exists) {
      console.warn(`Attempted to access non-existent task: ${taskId}`);
      return false;
    }

    const taskData = taskDoc.data();
    if (!taskData?.listId) {
      console.error(`Task ${taskId} is orphaned and has no listId.`);
      return false;
    }

    return await verifyListOwnership(taskData.listId, userId);
  } catch (error) {
    console.error(`Error verifying permission for task ${taskId}:`, error);
    return false;
  }
}
