import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      // 빌드 과정에서 아래 모듈들을 만나면 번들링하지 말고 그냥 무시하라는 설정입니다.
      external: [
        'fsevents',
        'vite',
        'rollup',
        'fdir',
        'tsx',
        'jiti',
        'better-sqlite3',
        'express',
        /^node:.*/, // node:fs 등 내장 모듈 전체
      ],
    },
  },
});