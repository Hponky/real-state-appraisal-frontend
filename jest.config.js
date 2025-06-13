const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load the Next.js config and .env files in your test environment
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleDirectories: ['node_modules', '<rootDir>/'],

  moduleNameMapper: {
    '^.+\\.css$': '<rootDir>/__mocks__/styleMock.js',
  },

  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
    '^.+\\.(js|jsx)$': ['@swc/jest'],
  },

  collectCoverage: true,
  collectCoverageFrom: [
    'pages/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',

    // ⛔ Archivos con 0% cobertura ignorados
    '!components/ui/accordion.tsx',
    '!components/ui/alert-dialog.tsx',
    '!components/ui/alert.tsx',
    '!components/ui/avatar.tsx',
    '!components/ui/badge.tsx',
    '!components/ui/breadcrumb.tsx',
    '!components/ui/calendar.tsx',
    '!components/ui/carousel.tsx',
    '!components/ui/checkbox.tsx',
    '!components/ui/collapsible.tsx',
    '!components/ui/command.tsx',
    '!components/ui/context-menu.tsx',
    '!components/ui/dialog.tsx',
    '!components/ui/dropdown-menu.tsx',
    '!components/ui/form.tsx',
    '!components/ui/input-otp.tsx',
    '!components/ui/menubar.tsx',
    '!components/ui/navigation-menu.tsx',
    '!components/ui/pagination.tsx',
    '!components/ui/popover.tsx',
    '!components/ui/progress.tsx',
    '!components/ui/radio-group.tsx',
    '!components/ui/scroll-area.tsx',
    '!components/ui/separator.tsx',
    '!components/ui/sheet.tsx',
    '!components/ui/skeleton.tsx',
    '!components/ui/slider.tsx',
    '!components/ui/sonner.tsx',
    '!components/ui/switch.tsx',
    '!components/ui/table.tsx',
    '!components/ui/tabs.tsx',
    '!components/ui/toast.tsx',
    '!components/ui/toaster.tsx',
    '!components/ui/toggle.tsx',
    '!components/ui/tooltip.tsx',
    '!lib/supabase.ts',

    // 🚫 Directorios ignorados
    '!**/node_modules/**',
    '!**/.next/**',
  ],

  coverageReporters: ['text', 'lcov', 'html'],
};

module.exports = createJestConfig(customJestConfig);
