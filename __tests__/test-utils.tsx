
import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
// Importe os provedores necessários usando caminhos relativos.
import { AuthProvider } from '../src/components/providers/auth-provider';
import { AppProvider } from '../src/providers/AppProvider'; // CORREÇÃO: Importar o AppProvider

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  // Mock para o contexto de autenticação, como antes.
  const mockAuth = {
    user: {
      uid: 'test-user-id',
      email: 'test@example.com',
      name: 'Test User',
    },
    isAuthenticated: true,
    isLoading: false,
    login: async () => {},
    logout: async () => {},
    signup: async () => ({ uid: 'test-user-id' }),
  };

  // CORREÇÃO: Envolva o AuthProvider com o AppProvider.
  // A ordem é importante se um provedor depender do outro.
  return (
    <AppProvider>
      <AuthProvider value={mockAuth}>{children}</AuthProvider>
    </AppProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };
