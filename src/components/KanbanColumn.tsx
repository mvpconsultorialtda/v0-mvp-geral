import React from 'react';

interface KanbanColumnProps {
  title: string;
  children: React.ReactNode;
}

// Componente para renderizar uma coluna do quadro Kanban (ex: A Fazer, Em Andamento).
const KanbanColumn: React.FC<KanbanColumnProps> = ({ title, children }) => {
  return (
    <div className="bg-gray-50 rounded-lg p-4 flex-shrink-0 w-80"> 
      <h3 className="text-lg font-semibold text-black mb-4 px-2">{title}</h3>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
};

export default KanbanColumn;
