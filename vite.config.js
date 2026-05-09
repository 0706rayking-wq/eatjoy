import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'firebase': ['firebase/app', 'firebase/firestore', 'firebase/auth', 'firebase/analytics'],
          'game': ['./src/components/game/GameCenter.jsx'],
          'admin': ['./src/components/admin/AdminPage.jsx'],
        }
      }
    }
  }
})