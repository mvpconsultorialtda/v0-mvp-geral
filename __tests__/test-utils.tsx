
import React from 'react';
import { render as rtlRender } from '@testing-library/react';
import { AuthProvider, useAuth } from '../src/components/providers/auth-provider';

// Mock the useAuth hook
jest.mock('../src/components/providers/auth-provider', () => ({
  ...jest.requireActual('../src/components/providers/auth-provider'),
  useAuth: jest.fn(),
}));

const mockUseAuth = useAuth as jest.Mock;

function render(ui: React.ReactElement, { providerProps, ...renderOptions }: any = {}) {
  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <AuthProvider {...providerProps}>{children}</AuthProvider>
  );

  return rtlRender(ui, { wrapper: Wrapper, ...renderOptions });
}

export * from '@testing-library/react';
export { render, mockUseAuth };
