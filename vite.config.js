import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// Simple config for hackathon demo
const config = {
  build: {
    sourcemap: true,
    minify: true,
    target: 'es2020',
    chunkSizeWarningLimit: 1000
  }
}

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@store': path.resolve(__dirname, './src/store'),
      '@contracts': path.resolve(__dirname, './src/contracts'),
      '@assets': path.resolve(__dirname, './src/assets')
    }
  },
  server: {
    port: 3000,
    host: true
  },
  build: {
    outDir: 'dist',
    sourcemap: config.build.sourcemap,
    minify: config.build.minify,
    target: config.build.target,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['framer-motion', 'lucide-react'],
          iota: ['@iota/iota.js', '@iota/util.js', '@iota/crypto.js'],
        },
      },
    },
    chunkSizeWarningLimit: config.build.chunkSizeWarningLimit,
  },
  define: {
    global: 'globalThis',
    __DEPLOYMENT_CONFIG__: JSON.stringify(config),
  }
})
