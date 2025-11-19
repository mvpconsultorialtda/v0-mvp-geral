
import type { Config } from 'jest';
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({ dir: './' });

const moduleNameMapper = {
  '^@/app/(.*)$': '<rootDir>/app/$1',
  '^@/lib/(.*)$': '<rootDir>/lib/$1',
  '^@/components/(.*)$': '<rootDir>/src/components/$1',
  '^@/src/(.*)$': '<rootDir>/src/$1',
  '^@/modules/(.*)$': '<rootDir>/src/modules/$1',
};

const config: Config = {
  coverageProvider: 'v8',
  projects: [
    {
      displayName: 'client',
      testEnvironment: 'jsdom',
      setupFilesAfterEnv: ['<rootDir>/jest.client.setup.js'],
      testMatch: [
        '**/__tests__/pages/**/*.test.tsx',
        '**/__tests__/components/**/*.test.tsx',
        '**/__tests__/test-utils.test.tsx',
        '**/__tests__/modules/**/*.test.tsx'
      ],
      transform: {
        '^.+\\.(ts|tsx)$': 'ts-jest',
      },
      moduleNameMapper,
    },
    {
      displayName: 'server',
      testEnvironment: 'node',
      setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
      testMatch: ['**/__tests__/api/**/*.test.ts'],
      transform: {
        '^.+\\.(ts|tsx)$': 'ts-jest',
      },
      moduleNameMapper,
    },
  ],
};

export default createJestConfig(config);
