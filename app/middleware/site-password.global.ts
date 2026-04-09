export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) return
  
  if (to.path === '/gate') return
  
  const sitePasswordVerified = useCookie('site-password-verified')
  if (sitePasswordVerified.value) return
  
  const config = await $fetch<{ sitePassword: string }>('/api/config')
  if (!config.sitePassword) return
  
  return navigateTo('/gate')
})