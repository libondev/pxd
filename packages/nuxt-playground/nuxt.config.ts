import tailwindcss from '@tailwindcss/vite'
import { defineNuxtConfig } from 'nuxt/config'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  css: ['~/styles.css'],
  modules: ['@pxd/nuxt'],
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
})
