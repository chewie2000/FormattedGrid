import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'
import { readFileSync } from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'))

export default defineConfig({
  plugins: [react()],
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
    __GIT_HASH__:    JSON.stringify('dev'),
  },
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
