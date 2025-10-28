import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// Custom plugin to display API configuration in terminal
const displayAPIConfig = () => {
  return {
    name: 'display-api-config',
    configResolved(config) {
      const environment = process.env.VITE_APP_ENV || 'prod';
      const isProduction = environment === 'prod';
      const apiName = isProduction ? 'SolarCRM API' : 'Local API';
      const separator = '═'.repeat(60);
      
      // ANSI color codes for terminal
      const colors = {
        reset: '\x1b[0m',
        bright: '\x1b[1m',
        green: '\x1b[32m',
        red: '\x1b[31m',
        cyan: '\x1b[36m',
        yellow: '\x1b[33m'
      };
      
      const envColor = isProduction ? colors.red : colors.green;
      const apiColor = isProduction ? colors.yellow : colors.cyan;
      
      console.log('\n' + colors.bright + separator + colors.reset);
      console.log(colors.bright + '🚀 TD SOLAR CRM - API CONFIGURATION' + colors.reset);
      console.log(colors.bright + separator + colors.reset);
      console.log(`📍 Environment: ${envColor}${colors.bright}${environment.toUpperCase()}${colors.reset}`);
      console.log(`🔗 API: ${apiColor}${colors.bright}${apiName}${colors.reset}`);
      console.log(`⚙️  Mode: ${envColor}${colors.bright}${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'}${colors.reset}`);
      console.log(colors.bright + separator + colors.reset + '\n');
    }
  }
}

export default defineConfig({
  plugins: [
    displayAPIConfig(),
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
