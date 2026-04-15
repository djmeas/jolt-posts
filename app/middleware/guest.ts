export default defineNuxtRouteMiddleware(async () => {
  const { user, fetch: fetchSession } = useUserSession()
  await fetchSession()
  if (user.value) {
    if (user.value.isAdmin) {
      return navigateTo('/admin')
    }
    return navigateTo('/dashboard')
  }
})
