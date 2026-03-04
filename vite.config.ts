import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path'; // 이 줄을 추가하세요

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      // "@"를 "src" 폴더로 연결해줍니다.
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: 'dist',
    // 이전 단계에서 추가했던 서버 패키지들은 그대로 두는 것이 안전합니다.
    rollupOptions: {
      external: ['express', 'better-sqlite3', 'pg', 'dotenv']
    }
  }
});