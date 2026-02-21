/// <reference types="vitest" />
/// <reference types="vite/client" />

import { defineConfig } from 'vite'
import { VitePluginFonts } from 'vite-plugin-fonts'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@poucher/shared': path.resolve(__dirname, 'shared')
    }
  },
  plugins: [
    react(),
    VitePluginFonts({
      google: {
        families: [
          {
            name: 'Inter',
            styles: 'wght@400;600;700;800;900'
          }
        ]
      }
    })
  ],
  // https://github.com/vitest-dev/vitest/blob/main/examples/react-testing-lib/vite.config.ts
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true,
    exclude: ['e2e/**', 'node_modules/**', 'mobile/**']
  }
})
