export default {
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts', '**/?(*.)+(spec|test).ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/index.ts',
    '!src/**/*.d.ts'
  ],
  testTimeout: 10000,
  setupFilesAfterEnv: [],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: {
          module: 'ES2022',
          target: 'ES2022',
          esModuleInterop: true
        }
      }
    ]
  },
  extensionsToTreatAsEsm: ['.ts'],
  testEnvironmentOptions: {
    NODE_ENV: 'test'
  }
};
