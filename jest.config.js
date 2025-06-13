const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load the Next.js config and .env files in your test environment
  dir: './',
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleDirectories: ['node_modules', '<rootDir>/'],
  // Handle CSS imports
  moduleNameMapper: {
    '^.+\\.css$': '<rootDir>/__mocks__/styleMock.js',
    '^@/(.*)$': '<rootDir>/$1',
  },
  // Transform modules that use ES Modules syntax
  transformIgnorePatterns: [
    '/node_modules/(?!(jose|@supabase/auth-helpers-nextjs|@supabase/auth-helpers-shared|@supabase/supabase-js)/)',
  ],
  // Use ts-jest for TypeScript transformations
  transform: {
    '^.+\\.(t|j)sx?$': ['@swc/jest'], // Transform all .ts, .tsx, .js, .jsx files with SWC
  },
};

// createJestConfig is an async function that returns the modified Jest config
module.exports = createJestConfig(customJestConfig);
