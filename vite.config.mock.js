import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@sigmacomputing/plugin': path.resolve(__dirname, 'src/mock/plugin.jsx'),
    },
  },
  // Serve mock.html as the root page in mock mode
  root: __dirname,
  build: {
    rollupOptions: {
      input: path.resolve(__dirname, 'mock.html'),
    },
  },
})
