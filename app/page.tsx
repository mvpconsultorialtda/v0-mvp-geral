'use client';

import Link from "next/link";

// Página principal que atua como um hub de módulos
export default function HomePage() {
  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-black mb-4">Hub de Módulos</h1>
          <p className="text-lg text-gray-500">Selecione um módulo abaixo para começar.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Card para Lista de Tarefas */}
          <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
            <h2 className="text-2xl font-semibold text-black mb-3">Lista de Tarefas</h2>
            <p className="text-gray-500 mb-6">Organize suas tarefas com categorias, prioridades e filtros.</p>
            <Link href="/lists" className="block w-full text-center bg-black hover:bg-gray-800 text-white font-semibold py-3 px-4 rounded-lg transition-colors">
              Abrir Módulo
            </Link>
          </div>

          {/* Card "Em Breve" */}
          <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm opacity-60">
            <h2 className="text-2xl font-semibold text-black mb-3">Em Breve</h2>
            <p className="text-gray-500 mb-6">Mais módulos e funcionalidades serão adicionados aqui.</p>
            <button disabled className="w-full bg-gray-200 text-gray-400 font-semibold py-3 px-4 rounded-lg cursor-not-allowed">
              Em Breve
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
