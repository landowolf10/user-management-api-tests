import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './src/tests',
  timeout: 30000,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
  },
  reporter: [
    ['list'],
    ['html', { outputFolder: 'reports/html' }],
    ['junit', { outputFile: 'reports/junit/results.xml' }]
  ],
});