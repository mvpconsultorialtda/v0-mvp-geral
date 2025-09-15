import Link from 'next/link';

export default function HubPage() {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-8">Hub de Módulos</h1>
        <div className="space-y-4">
          <Link href="/tasks" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Acessar Módulo de Tarefas
          </Link>
          {/* Outros módulos podem ser adicionados aqui no futuro */}
        </div>
      </div>
    </div>
  );
}
