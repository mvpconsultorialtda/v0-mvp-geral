import { cookies } from 'next/headers';
import TodoListClientPage from './TodoListClientPage';

export default function TodoListsPage() {
  // A simples chamada a cookies() garante que esta página seja renderizada dinamicamente.
  cookies();

  // Renderiza o componente de cliente que contém a UI interativa.
  return <TodoListClientPage />;
}
