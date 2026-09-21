const { defineConfig } = require('@playwright/test');
module.exports = defineConfig({
    testDir: './tests', testMatch: '**/*.spec.cjs', fullyParallel: true, workers: 2,
    use: {
        baseURL: 'http://127.0.0.1:3100', headless: true,
        launchOptions: process.env.CHROMIUM_EXECUTABLE_PATH ? {executablePath:process.env.CHROMIUM_EXECUTABLE_PATH,args:['--no-sandbox','--disable-gpu']} : {},
        reducedMotion: 'reduce'
    },
    webServer: {command:'node scripts/dev-server.cjs',env:{PORT:'3100'},url:'http://127.0.0.1:3100',reuseExistingServer:!process.env.CI},
    reporter: 'list'
});
