
import fs from 'fs/promises';
import path from 'path';

// Define o diretório e o caminho para o banco de dados.
const dbDirectory = path.resolve(process.cwd(), 'data');
const dbPath = path.join(dbDirectory, 'db.json');

interface Database {
  todoLists: Record<string, any>;
  tasks: Record<string, any>;
}

/**
 * Lê o banco de dados do arquivo de forma segura.
 */
export async function readDb(): Promise<Database> {
  try {
    // A verificação de acesso agora é feita implicitamente pela leitura.
    const fileContent = await fs.readFile(dbPath, 'utf-8');
    
    if (!fileContent.trim()) {
      return { todoLists: {}, tasks: {} };
    }

    const data = JSON.parse(fileContent);

    return {
      todoLists: data.todoLists || {},
      tasks: data.tasks || {},
    };

  } catch (error: any) {
    if (error.code === 'ENOENT' || error instanceof SyntaxError) {
      // Se o arquivo não existe ou está malformado, retorna uma estrutura vazia.
      return { todoLists: {}, tasks: {} };
    }
    console.error("Failed to read database file:", error);
    throw new Error("Could not read from database.");
  }
}

/**
 * Escreve os dados atualizados no banco de dados, garantindo que o diretório exista.
 */
export async function writeDb(data: Database): Promise<void> {
  try {
    // Garante que o diretório de destino exista.
    // O { recursive: true } evita erros se o diretório já existir.
    await fs.mkdir(dbDirectory, { recursive: true });

    // Agora, escreve o arquivo com segurança.
    await fs.writeFile(dbPath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Failed to write to database file:", error);
    throw new Error("Could not write to database.");
  }
}
