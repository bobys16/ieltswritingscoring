import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  return {
    plugins: [react()],
    server: {
      proxy: mode === 'development' ? {
        '/api': {
          target: 'http://localhost:8080',
          changeOrigin: true,
        }
      } : undefined
    }
  }
})
