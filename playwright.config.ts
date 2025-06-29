import { defineConfig } from '@playwright/test';

export default defineConfig({
    testDir: './e2e',
    use: {
        baseURL: 'http://localhost:5173',
        headless: true,
        viewport: { width: 1920, height: 1080 },
        ignoreHTTPSErrors: true,
        video: 'retain-on-failure',
        screenshot: 'only-on-failure',
    },
});
