<template>
  <div class="admin-layout">
    <aside class="admin-layout__sidebar">
      <NuxtLink to="/admin" class="admin-layout__logo">Админка</NuxtLink>
      <nav class="admin-layout__nav">
        <NuxtLink to="/admin/entities">Объекты</NuxtLink>
        <NuxtLink to="/admin/bookings">Брони</NuxtLink>
        <NuxtLink to="/admin/pages">Страницы</NuxtLink>
      </nav>
      <NuxtLink to="/" class="admin-layout__back">← На сайт</NuxtLink>
    </aside>
    <div class="admin-layout__content">
      <header class="admin-layout__header">
        <ThemeToggle />
        <span>{{ auth.user?.name }}</span>
      </header>
      <main class="admin-layout__main">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
const auth = useAuthStore();

onMounted(async () => {
  if (!auth.isLoggedIn) {
    await navigateTo('/login');
    return;
  }
  if (!auth.isAdmin) {
    await navigateTo('/');
  }
});
</script>

<style scoped lang="scss">
.admin-layout {
  display: flex;
  min-height: 100vh;

  &__sidebar {
    width: 240px;
    background: var(--color-surface);
    border-right: 1px solid var(--color-border);
    padding: $space-5;
    display: none;
    flex-direction: column;
    gap: $space-6;

    @include md {
      display: flex;
    }
  }

  &__logo {
    font-size: $font-size-lg;
    font-weight: 600;
    color: var(--color-primary);
    text-decoration: none;
  }

  &__nav {
    display: flex;
    flex-direction: column;
    gap: $space-2;

    a {
      padding: $space-3 $space-4;
      border-radius: $radius-md;
      color: var(--color-text-secondary);
      text-decoration: none;

      &:hover,
      &.router-link-active {
        background: var(--color-surface-elevated);
        color: var(--color-primary);
      }
    }
  }

  &__back {
    margin-top: auto;
    font-size: $font-size-sm;
    color: var(--color-text-muted);
  }

  &__content {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  &__header {
    height: $header-height;
    padding: 0 $space-5;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: $space-4;
    border-bottom: 1px solid var(--color-border);
    background: var(--color-surface);
  }

  &__main {
    flex: 1;
    padding: $space-6;
  }
}
</style>
