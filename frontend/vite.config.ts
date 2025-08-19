import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: [
      "617d6955-e336-447e-9336-782340268964.preview.emergentagent.com",
      "88731d64-e9c6-4905-927b-07bbc2c08a12.preview.emergentagent.com",
      "14cd1f93-550c-4800-ac60-39195504d5ec.preview.emergentagent.com",
      "mock-data-review.preview.emergentagent.com"
    ],
    hmr: {
      overlay: false,
      clientPort: 3000
    },
    // Configurações para evitar rate limiting
    middlewareMode: false,
    cors: true,
    strictPort: false
  },
  optimizeDeps: {
    include: ['lucide-react'],
  },
});
