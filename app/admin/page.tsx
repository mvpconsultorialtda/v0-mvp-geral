import React from 'react';
import AdminGuard from '@/components/auth/AdminGuard';
import UserManagement from '@/components/admin/UserManagement';
import { GoBackButton } from '@/components/ui/go-back-button';

export default function AdminPage() {
  return (
    <AdminGuard>
      <div className="container mx-auto py-10">
        <GoBackButton />
        <h1 className="text-3xl font-bold">Painel de Administração</h1>
        <p className="text-muted-foreground">Gerenciamento de usuários e permissões.</p>
        
        <UserManagement />
      </div>
    </AdminGuard>
  );
}
