import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// When you connect a real backend, you can proxy /api to it during development:
//   server: { proxy: { '/api': 'http://localhost:8000' } }
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5174,
    allowedHosts: true,
  },
});
