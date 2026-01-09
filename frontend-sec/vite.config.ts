import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@types': path.resolve(__dirname, './src/types'),
      '@contexts': path.resolve(__dirname, './src/contexts'),
      '@lib': path.resolve(__dirname, './src/lib'),
      // Força resolução única do React para evitar "Invalid Hook Call"
      'react': path.resolve(__dirname, './node_modules/react'),
      'react-dom': path.resolve(__dirname, './node_modules/react-dom'),
    },
    dedupe: ['react', 'react-dom'],
  },

  optimizeDeps: {
    include: ['react', 'react-dom'],
  },

  server: {
    port: 3000,
    host: true, // Listen on all addresses

    // Proxy API requests to backend
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: false,
        secure: false,
        ws: true,
        cookieDomainRewrite: {
          '*': ''
        }
      },
      '/static': {
        target: 'http://localhost:8000',
        changeOrigin: false,
        secure: false
      }
    }
  },

  build: {
    outDir: 'dist',
    sourcemap: false
  }
})
