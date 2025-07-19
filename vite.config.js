import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'TD Solar CRM',
        short_name: 'TD Solar',
        start_url: '.',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#2962ff',
        icons: [
          {
            src: '/favicon.ico',
            sizes: '64x64 32x32 24x24 16x16',
            type: 'image/x-icon'
          },
          {
            src: '/tslogo.png',
            type: 'image/png',
            sizes: '192x192'
          }
        ]
      }
    })
  ],
})
