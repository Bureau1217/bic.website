// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: false },
  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
    head: {
      title: 'Notre Historia',
      titleTemplate: '%s - Notre Historia',
      meta: [
        { name: 'description', content: 'Découvrez Notre Historia, une expérience immersive sur l\'histoire de l\'immigration à Genève.' },
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'Notre Historia' },
        { property: 'og:title', content: 'Notre Historia' },
        { property: 'og:description', content: 'Découvrez Notre Historia, une expérience immersive sur l\'histoire de l\'immigration à Genève.' },
        { property: 'og:image', content: 'https://notre-historia.ch/images/og-image.jpg' },
        { property: 'og:url', content: 'https://notre-historia.ch' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'Notre Historia' },
        { name: 'twitter:description', content: 'Découvrez Notre Historia, une expérience immersive sur l\'histoire de l\'immigration à Genève.' },
        { name: 'twitter:image', content: 'https://notre-historia.ch/images/og-image.jpg' },
      ],
      link: [
        { rel: 'icon', type: 'image/jpeg', href: '/images/favicon-notrehistoria.jpg' },
        { rel: 'preload', href: '/fonts/GT-Sectra-Medium.woff2', as: 'font', type: 'font/woff2', crossorigin: 'anonymous' },
        { rel: 'preload', href: '/fonts/Solfa.woff2', as: 'font', type: 'font/woff2', crossorigin: 'anonymous' },
      ],
    },
  },
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
    apiAuthEmail: process.env.API_AUTH_EMAIL || '',
    apiAuthPassword: process.env.API_AUTH_PASSWORD || '',
    // Côté client (public)
    public: {
      // URL de base du CMS, utilisée pour normaliser les URLs des médias
      cmsBaseUrl: process.env.API_URL || 'http://localhost:8000',
      // Mode maintenance : true = affiche page "en construction"
      // Bypass avec ?preview=true dans l'URL (stocke un cookie)
      maintenanceMode: process.env.MAINTENANCE_MODE === 'true',
    },
  },
})
