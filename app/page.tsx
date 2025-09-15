'use client';

import Link from "next/link";

// Página principal que atua como um hub de módulos
export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-4">Aplicação React Modular</h1>
          <p className="text-gray-600 text-lg">Uma aplicação modular com componentes e páginas reutilizáveis</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card para Lista de Tarefas */}
          <div className="border rounded-lg p-6 bg-white shadow-md">
            <h2 className="text-xl font-semibold mb-2">Lista de Tarefas</h2>
            <p className="text-gray-500 mb-4">Organize suas tarefas com categorias, prioridades e filtros</p>
            <Link href="/tasks" className="block w-full text-center bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              Abrir Lista de Tarefas
            </Link>
          </div>

          {/* Card "Em Breve" */}
          <div className="border rounded-lg p-6 bg-white shadow-md opacity-50">
            <h2 className="text-xl font-semibold mb-2">Em Breve</h2>
            <p className="text-gray-500 mb-4">Mais módulos serão adicionados aqui</p>
            <button disabled className="w-full bg-gray-300 text-gray-500 font-bold py-2 px-4 rounded cursor-not-allowed">
              Em Breve
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
