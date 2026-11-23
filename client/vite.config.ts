import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // In development the API runs on :4000; in production Vercel rewrites /api to Render.
    proxy: { '/api': 'http://localhost:4000' },
  },
});
