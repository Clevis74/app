import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    allowedHosts: [
      'validation-logic.preview.emergentagent.com',
      'mock-data-review.preview.emergentagent.com'
    ],
    cors: true,
    strictPort: false,
    hmr: {
      clientPort: 3000
    }
  }
});
