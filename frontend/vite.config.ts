import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  cacheDir: 'C:/Users/beara/.gemini/antigravity-ide/vite-cache',
  envPrefix: ['VITE_', 'TINYMCE_'],
  server: {
    watch: {
      ignored: ['**/node_modules_old/**']
    }
  }
})