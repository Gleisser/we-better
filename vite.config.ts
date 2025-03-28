import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');
  
  // Provide fallback values for required env variables
  const apiUrl = env.VITE_API_URL || 'http://localhost:1337';
  const userServiceUrl = env.VITE_USER_SERVICE_URL || 'http://localhost:3000';

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      proxy: {
        '/api/life-wheel': {
          target: userServiceUrl,
          changeOrigin: true,
          secure: false,
        },
        '/api': {
          target: apiUrl,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
