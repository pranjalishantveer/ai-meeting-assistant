import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        port: 5173,
        proxy: {
            // Any request starting with /api gets forwarded to the Express server.
            // This lets the browser call fetch('/api/health') without hardcoding a host/port.
            '/api': {
                target: 'http://localhost:4000',
                changeOrigin: true,
            },
            // Uploaded audio files, served by Express's static middleware.
            '/uploads': {
                target: 'http://localhost:4000',
                changeOrigin: true,
            },
        },
    },
});
