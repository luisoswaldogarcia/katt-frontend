import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import basicSsl from '@vitejs/plugin-basic-ssl'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    basicSsl(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'public',
      filename: 'sw.js',
      registerType: 'autoUpdate',
      manifest: {
        name: 'Katt - Asistente Virtual',
        short_name: 'Katt',
        description: 'Tu asistente virtual con personalidad felina',
        theme_color: '#7c3aed',
        background_color: '#0f0a1a',
        display: 'fullscreen',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
    }),
  ],
  server: {
    allowedHosts: ['192.168.1.26'],
    proxy: {
      '/dev': {
        target: 'https://b76owlak02.execute-api.us-east-1.amazonaws.com',
        changeOrigin: true,
      },
    },
  },
})
