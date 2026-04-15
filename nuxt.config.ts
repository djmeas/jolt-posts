// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['nuxt-auth-utils', '@nuxtjs/tailwindcss', '@nuxt/eslint'],

  // Session cookie options are merged into nuxt-auth-utils / h3 (defaults include secure: true).
  // On plain http:// (non-localhost) browsers drop Secure cookies → login cannot stick. Prefer HTTPS.
  // If you must use HTTP only on a VPS, set NUXT_SESSION_COOKIE_SECURE=false in the container env.
  runtimeConfig: {
    session: {
      cookie: {
        secure: true
      }
    }
  },

  routeRules: {
    '/uploads/**': { headers: { 'cache-control': 'public, max-age=31536000' } }
  }
})
