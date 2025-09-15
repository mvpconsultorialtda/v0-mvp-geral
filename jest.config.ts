
import type { Config } from 'jest';
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({ dir: './' });

// Define o mapeador de módulo reutilizável com a ordem correta.
const commonModuleNameMapper = {
  // A regra específica DEVE vir primeiro.
  '^@/app/(.*)$': '<rootDir>/app/$1',
  // A regra genérica vem depois.
  '^@/(.*)$': '<rootDir>/src/$1',
};

// Configuração de transformação para usar o Babel
const transform = {
  '^.+\\.tsx?$': ['babel-jest', { presets: ['next/babel'] }],
};

const config: Config = {
  coverageProvider: 'v8',
  projects: [
    {
      // --- Configuração para Testes de Cliente (React, jsdom) ---
      displayName: 'client',
      testEnvironment: 'jsdom',
      setupFilesAfterEnv: ['<rootDir>/jest.client.setup.ts'],
      testMatch: [
        '**/__tests__/pages/**/*.test.tsx',
        '**/__tests__/components/**/*.test.tsx',
        '**/__tests__/test-utils.test.tsx'
      ],
      moduleNameMapper: commonModuleNameMapper,
      transform, // Adiciona a transformação para o cliente
    },
    {
      // --- Configuração para Testes de Servidor (API, node) ---
      displayName: 'server',
      testEnvironment: 'node',
      setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
      testMatch: ['**/__tests__/api/**/*.test.ts'],
      moduleNameMapper: commonModuleNameMapper,
      transform, // Adiciona a transformação para o servidor
    },
  ],
};

export default createJestConfig(config);
