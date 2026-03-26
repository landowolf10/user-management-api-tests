import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './src/tests',
  timeout: 30000,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 4 : undefined,
  fullyParallel: true,

  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
  },

  projects: [
    {
      name: 'dev',
    },
    {
      name: 'prod',
    },
  ],

  reporter: [
    ['list'],
    ['html', {
      outputFolder: 'playwright-report',
      open: 'never',
    }],
    ['junit', { outputFile: 'reports/junit/results.xml' }]
  ],
});