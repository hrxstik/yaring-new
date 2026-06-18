export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) return;

  const auth = useAuthStore();
  auth.hydrate();

  if (!auth.token) {
    return navigateTo({
      path: '/login',
      query: { redirect: to.fullPath },
    });
  }

  if (!auth.user) {
    await auth.fetchMe();
  }

  if (!auth.isAdmin) {
    return navigateTo('/');
  }
});
