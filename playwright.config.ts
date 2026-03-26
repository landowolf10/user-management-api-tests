import { defineConfig } from '@playwright/test';

const env = process.env.TEST_ENV || 'dev';
const basePath = process.env.BASE_PATH || '';

export default defineConfig({
  testDir: './src/tests',
  timeout: 30000,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 4 : undefined,
  fullyParallel: true,
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
  },
  reporter: [
    ['list'],
    ['html', { 
      outputFolder: `playwright-report-${env}`,
      open: 'never',
      baseURL: basePath
    }],
    ['junit', { outputFile: 'reports/junit/results.xml' }]
  ],
});