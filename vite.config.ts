import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    outDir: 'dist',
    // 중요: 서버용 라이브러리들이 빌드 과정에 간섭하지 않도록 외부 모듈로 처리
    rollupOptions: {
      external: [
        'express',
        'better-sqlite3',
        'pg',
        'dotenv',
        'fdir',
        'jiti',
        'tsx'
      ],
    },
  },
  // 서버 로직이 들어있는 폴더가 있다면 빌드 대상에서 제외하도록 설정
  optimizeDeps: {
    exclude: ['express', 'better-sqlite3', 'pg']
  }
});