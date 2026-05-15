import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync } from 'fs'

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'))
const commitHash = (process.env.VERCEL_GIT_COMMIT_SHA ?? 'dev').slice(0, 7)

export default defineConfig({
  plugins: [react()],
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
    __GIT_HASH__:    JSON.stringify(commitHash),
  },
})
