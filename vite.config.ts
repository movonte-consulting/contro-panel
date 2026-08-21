/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Removido el proxy para usar el backend desplegado directamente
  // Las llamadas a /api/* se harán directamente a https://chat.movonte.com
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts'],
    globals: true,
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],

      thresholds: {
        lines: 80,
        functions: 80,
        branches: 70,
        statements: 80,
      },

      exclude: [
        'node_modules/',
        'src/setupTests.ts',
        '**/*.d.ts',
        '**/*.config.*',
        'src/main.tsx',
      ],
    },
  },
})
