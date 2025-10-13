import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Removido el proxy para usar el backend desplegado directamente
  // Las llamadas a /api/* se harán directamente a https://chat.movonte.com
})
