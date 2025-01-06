import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { generateCSP } from './src/middleware/csp';
import fs from 'fs';

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
    https: false,
    headers: {
      'Content-Security-Policy': generateCSP(),
      'Permissions-Policy': 'microphone=self, camera=self',
      'Feature-Policy': 'microphone self; camera self'
    },
  },
  assetsInclude: ['**/*.json'],
});
