export default defineNuxtRouteMiddleware(async () => {
  const { loggedIn, fetch: fetchSession } = useUserSession()
  await fetchSession()
  if (loggedIn.value) {
    const { user } = useUserSession()
    if (user.value?.isAdmin) {
      return navigateTo('/admin')
    }
    return navigateTo('/dashboard')
  }
})
