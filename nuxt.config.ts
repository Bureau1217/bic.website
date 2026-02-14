// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: false },
  devServer: {
    port: 3002,
    https: false,
  },
  ssr: false,
  css: [
    '~/assets/scss/main.scss'
  ],
  runtimeConfig: {
    // Côté serveur seulement (pas exposé au client)
    apiUrl: process.env.API_URL || 'http://localhost:8000',
    // Côté client (public)
    public: {
      // URL de base du CMS, utilisée pour normaliser les URLs des médias
      cmsBaseUrl: process.env.API_URL || 'http://localhost:8000',
    },
  },
})
