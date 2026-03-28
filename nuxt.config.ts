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
        { name: 'google-site-verification', content: 'tPe-I5TpH8FmsV5mpGCqRMCaS6d2zf4lNZZVu6HPuPw' },
        { name: 'description', content: 'Découvrez Notre Historia - Un parcours à travers l\'histoire de la migration à Genève' },
        { property: 'og:site_name', content: 'Notre Historia' },
        { property: 'og:type', content: 'website' },
        { property: 'og:title', content: 'Notre Historia' },
        { property: 'og:description', content: 'Découvrez Notre Historia - Un parcours à travers l\'histoire de la migration à Genève' },
        { property: 'og:image', content: 'https://notre-historia.ch/images/og-notrehistoria.jpg' },
        { property: 'og:image:secure_url', content: 'https://notre-historia.ch/images/og-notrehistoria.jpg' },
        { property: 'og:image:type', content: 'image/jpeg' },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { property: 'og:url', content: 'https://notre-historia.ch/' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:image', content: 'https://notre-historia.ch/images/og-notrehistoria.jpg' },
      ],
      link: [
        { rel: 'icon', type: 'image/jpeg', href: '/images/favicon-notrehistoria.jpg' },
        { rel: 'preload', href: '/fonts/GT-Sectra-Medium.woff2', as: 'font', type: 'font/woff2', crossorigin: 'anonymous' },
        { rel: 'preload', href: '/fonts/Solfa.woff2', as: 'font', type: 'font/woff2', crossorigin: 'anonymous' },
      ],
      script: [
        {
          type: 'application/ld+json',
          innerHTML: JSON.stringify({
            '@context': 'https://schema.org',
            '@graph': [
              {
                '@type': 'WebSite',
                '@id': 'https://notre-historia.ch/#website',
                'url': 'https://notre-historia.ch/',
                'name': 'Notre Historia',
                'description': 'Découvrez Notre Historia - Un parcours à travers l\'histoire de la migration à Genève',
                'inLanguage': 'fr-CH',
              },
              {
                '@type': 'Organization',
                '@id': 'https://notre-historia.ch/#organization',
                'name': 'Notre Historia',
                'url': 'https://notre-historia.ch/',
                'logo': {
                  '@type': 'ImageObject',
                  'url': 'https://notre-historia.ch/images/Logo-Notre-Historia.svg',
                },
              },
              {
                '@type': 'SiteNavigationElement',
                '@id': 'https://notre-historia.ch/#navigation',
                'name': 'Navigation principale',
                'hasPart': [
                  {
                    '@type': 'SiteNavigationElement',
                    'name': 'Parcours',
                    'url': 'https://notre-historia.ch/parcours',
                  },
                  {
                    '@type': 'SiteNavigationElement',
                    'name': 'Agenda et ressources',
                    'url': 'https://notre-historia.ch/ressources',
                  },
                  {
                    '@type': 'SiteNavigationElement',
                    'name': 'À propos',
                    'url': 'https://notre-historia.ch/a-propos',
                  },
                ],
              },
            ],
          }),
        },
      ],
    },
  },
  devServer: {
    port: 3002,
    https: false,
  },
  ssr: true,
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
