import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { generateCSP } from './src/middleware/csp';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'html-transform',
      transformIndexHtml(html) {
        return html.replace(
          '__CSP_PLACEHOLDER__',
          generateCSP()
        );
      },
    },
  ],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    headers: {
      'Content-Security-Policy': generateCSP(),
    },
  },
});
