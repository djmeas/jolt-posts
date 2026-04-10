// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['nuxt-auth-utils', '@nuxtjs/tailwindcss', 'nuxt-mcp-dev'],

  routeRules: {
    '/uploads/**': { headers: { 'cache-control': 'public, max-age=31536000' } }
  }
})
