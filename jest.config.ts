import type {Config} from 'jest'

const config: Config = {
  preset: 'ts-jest',
  collectCoverage: false,
  coverageDirectory: 'coverage', // Directory for coverage reports
  collectCoverageFrom: [
    'src/**/*.{js,ts,tsx}', // Include files for coverage
    '!src/**/*.test.{js,ts,tsx}', // Exclude test files
    '!src/**/index.{js,ts,tsx}', // Exclude index files
  ],
  coverageReporters: ['lcov', 'text', 'clover'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  projects: [
    {
      transformIgnorePatterns: [
        'node_modules/(?!(@sanity/ui|your-other-packages)/)', // Add any other ESM-based packages here
      ],
      displayName: 'tsx-tests',
      testEnvironment: 'jsdom', // Required for React and DOM-related tests
      testMatch: ['**/*.test.tsx', '**/hooks/*.test.ts'], // Match only .tsx test files
      setupFilesAfterEnv: ['<rootDir>/tests/setup/jest.setup.tsx.ts'], // Setup for .tsx tests
      transform: {
        '^.+\\.[tj]sx?$': [
          'ts-jest',
          {
            tsconfig: '<rootDir>/tsconfig.json', // Point to your main tsconfig file
          },
        ],
      },
      moduleNameMapper: {
        '^@tests/(.*)$': '<rootDir>/tests/$1',
        '^@/(.*)$': '<rootDir>/src/$1',
      },
    },
    {
      transformIgnorePatterns: [
        'node_modules/(?!(@sanity/ui|your-other-packages)/)', // Add any other ESM-based packages here
      ],
      displayName: 'default',
      testEnvironment: 'node', // Use node environment for non-DOM tests
      testMatch: ['**/*.test.ts', '!**/hooks/*.test.ts'], // Match .js and .ts files
      setupFilesAfterEnv: ['<rootDir>/tests/setup/jest.setup.ts'], // Default setup
      transform: {
        '^.+\\.[tj]sx?$': [
          'ts-jest',
          {
            tsconfig: '<rootDir>/tsconfig.json', // Point to your main tsconfig file
          },
        ],
      },
      moduleNameMapper: {
        '^@tests/(.*)$': '<rootDir>/tests/$1',
        '^@/(.*)$': '<rootDir>/src/$1',
      },
    },
  ],
}
export default config
