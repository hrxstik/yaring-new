export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.server) return;

  const auth = useAuthStore();
  auth.hydrate();

  if (!auth.token) {
    return navigateTo({
      path: '/login',
      query: { redirect: to.fullPath },
    });
  }
});
