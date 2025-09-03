
import React from 'react';
import AdminGuard from '@/components/auth/AdminGuard';
import UserManagement from '@/components/admin/UserManagement'; // Importar o componente

export default function AdminPage() {
  return (
    <AdminGuard>
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold">Painel de Administração</h1>
        <p className="text-muted-foreground">Gerenciamento de usuários e permissões.</p>
        
        {/* Adicionar o componente de gerenciamento de usuários */}
        <UserManagement />
      </div>
    </AdminGuard>
  );
}
