// vite.config.js — pós-migração Base44 → Lovable Cloud
// SEM manualChunks: deixa o Vite decidir o splitting automaticamente.

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  plugins: [react()],
  build: {
    minify: 'esbuild',
    chunkSizeWarningLimit: 2000,
    reportCompressedSize: false,
    sourcemap: false,
  },
});

