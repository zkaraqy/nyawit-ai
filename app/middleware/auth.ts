export default defineNuxtRouteMiddleware(async (to) => {
  // Only protect dashboard routes
  if (!to.path.startsWith('/dashboard')) return

  const auth = useAuth()

  // If no token in state, try initializing from localStorage
  if (!auth.isAuthenticated.value) {
    await auth.init()
  }

  // Still not authenticated? Redirect to login
  if (!auth.isAuthenticated.value) {
    return navigateTo('/login', { replace: true })
  }
})
