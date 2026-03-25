import { defineConfig } from '@playwright/test';

const env = process.env.TEST_ENV || 'dev';

export default defineConfig({
  testDir: './src/tests',
  timeout: 30000,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
  },
  reporter: [
    ['list'],
    ['html', { outputFolder: `playwright-report-${env}`, open: 'never' }],
    ['junit', { outputFile: 'reports/junit/results.xml' }]
  ],
});