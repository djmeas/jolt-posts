export default defineNuxtRouteMiddleware((to) => {
  const { user } = useUserSession()
  if (!user.value) {
    if (to.path.startsWith('/admin')) {
      return navigateTo('/admin/login')
    }
    return navigateTo('/login')
  }
})
