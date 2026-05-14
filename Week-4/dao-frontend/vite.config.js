import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Fix for global object used by some web3 libraries
    global: 'window',
  },
  build: {
    target: 'es2020', // Ensures BigInt support
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'es2020', // Ensures BigInt support during dev
    },
  },
});
