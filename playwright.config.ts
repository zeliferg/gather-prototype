import { defineConfig, devices } from '@playwright/test';
import { loadEnv } from 'vite';

const flow = loadEnv('production', process.cwd(), 'VITE_').VITE_FLOW ?? 'all';

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  testIgnore: flow === 'host' ? ['**/participant.spec.ts'] : flow === 'participant' ? ['**/host.spec.ts'] : [],
  retries: process.env.CI ? 1 : 0,
  forbidOnly: !!process.env.CI,
  use: { baseURL: 'http://localhost:4173', ...devices['iPhone 13'] },
  webServer: { command: 'npm run build && npm run preview -- --port 4173', port: 4173, reuseExistingServer: !process.env.CI, timeout: 120_000 },
  reporter: 'list',
});
