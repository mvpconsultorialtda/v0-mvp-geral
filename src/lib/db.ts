
import fs from 'fs/promises';
import path from 'path';

// Caminho para o nosso banco de dados em arquivo JSON
const dbPath = path.resolve(process.cwd(), 'data', 'db.json');

interface Database {
  todoLists: Record<string, any>;
  tasks: Record<string, any>;
}

/**
 * Lê o banco de dados do arquivo de forma segura.
 * Garante que a estrutura básica ({ todoLists: {}, tasks: {} }) sempre seja retornada,
 * mesmo se o arquivo não existir, estiver vazio ou malformado.
 */
export async function readDb(): Promise<Database> {
  try {
    await fs.access(dbPath); // Verifica se o arquivo existe
    const fileContent = await fs.readFile(dbPath, 'utf-8');
    
    // Se o arquivo estiver vazio, retorna a estrutura padrão
    if (!fileContent.trim()) {
      return { todoLists: {}, tasks: {} };
    }

    const data = JSON.parse(fileContent);

    // Garante que as chaves principais existam
    return {
      todoLists: data.todoLists || {},
      tasks: data.tasks || {},
    };

  } catch (error: any) {
    // Se o arquivo não existir (ENOENT) ou houver um erro de parsing,
    // o que é normal na primeira execução ou em caso de corrupção,
    // retorna a estrutura padrão de forma segura.
    if (error.code === 'ENOENT' || error instanceof SyntaxError) {
      return { todoLists: {}, tasks: {} };
    }
    // Para outros erros, lança a exceção.
    console.error("Failed to read database file:", error);
    throw new Error("Could not read from database.");
  }
}

/**
 * Escreve os dados atualizados no banco de dados.
 * @param data O objeto de banco de dados completo a ser salvo.
 */
export async function writeDb(data: Database): Promise<void> {
  try {
    await fs.writeFile(dbPath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Failed to write to database file:", error);
    throw new Error("Could not write to database.");
  }
}
