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
      registerType: 'prompt',
      manifest: {
        id: '/',
        name: 'Katt - Asistente Virtual',
        short_name: 'Katt',
        description: 'Tu asistente virtual con personalidad felina',
        lang: 'es',
        theme_color: '#7c3aed',
        background_color: '#0f0a1a',
        display: 'standalone',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
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
