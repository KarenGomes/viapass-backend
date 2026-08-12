/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/*.test.ts', '**/*.spec.ts'],
  setupFiles: ['<rootDir>/src/test/setup-env.ts'],
  clearMocks: true,
  restoreMocks: true,

  collectCoverageFrom: [
    'src/**/*.ts',
    // Entidades são declarações; testá-las é testar o TypeORM.
    '!src/**/*.entity.ts',
    '!src/database/**',
    '!src/**/*.dto.ts',
    '!src/config/swagger.ts',
    '!src/server.ts',
    '!src/test/**',
  ],
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 75,
      functions: 80,
      lines: 80,
    },
  },
}
