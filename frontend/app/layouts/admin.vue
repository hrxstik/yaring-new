<template>
  <div class="admin">
    <header class="admin__bar">
      <span class="admin__brand">Админка<span class="admin__brand-suffix"> · Яринг</span></span>
      <div class="admin__bar-right">
        <ThemeToggle />
        <span class="admin__user">{{ auth.user?.name || 'Администратор' }}</span>
        <span class="admin__avatar">{{ initials }}</span>
      </div>
    </header>

    <nav class="admin__tabs" aria-label="Разделы">
      <NuxtLink
        v-for="item in nav"
        :key="item.to"
        :to="item.to"
        class="admin__tab"
        :exact-active-class="item.exact ? 'admin__tab--active' : ''"
        :active-class="item.exact ? '' : 'admin__tab--active'"
      >
        {{ item.label }}
      </NuxtLink>
    </nav>

    <div class="admin__body">
      <aside class="admin__sidebar">
        <span class="admin__sidebar-label">Разделы</span>
        <NuxtLink
          v-for="item in nav"
          :key="item.to"
          :to="item.to"
          class="admin__link"
          :exact-active-class="item.exact ? 'admin__link--active' : ''"
          :active-class="item.exact ? '' : 'admin__link--active'"
        >
          <component :is="item.icon" :size="18" />
          {{ item.label }}
        </NuxtLink>
        <NuxtLink to="/" class="admin__back">
          <ArrowLeft :size="16" />На сайт
        </NuxtLink>
      </aside>

      <main class="admin__content">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { LayoutDashboard, CalendarCheck, House, FileText, ArrowLeft } from 'lucide-vue-next';

const auth = useAuthStore();

const nav = [
  { to: '/admin', label: 'Дашборд', icon: LayoutDashboard, exact: true },
  { to: '/admin/bookings', label: 'Брони', icon: CalendarCheck, exact: false },
  { to: '/admin/entities', label: 'Объекты', icon: House, exact: false },
  { to: '/admin/pages', label: 'Страницы', icon: FileText, exact: false },
];

const initials = computed(() => {
  const name = auth.user?.name?.trim();
  if (!name) return 'АД';
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
});
</script>

<style scoped lang="scss">
.admin {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--color-bg);

  &__bar {
    height: 60px;
    flex: none;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 $space-4;
    background: var(--color-surface);
    border-bottom: 1px solid var(--color-border);

    @include md {
      padding: 0 $space-5;
    }
  }

  &__brand {
    font-size: var(--font-lg);
    font-weight: 800;
    color: var(--color-primary);
  }

  &__brand-suffix {
    display: none;

    @include sm {
      display: inline;
    }
  }

  &__bar-right {
    display: flex;
    align-items: center;
    gap: $space-3;
  }

  &__user {
    display: none;
    font-size: $font-size-sm;
    font-weight: 600;
    color: var(--color-text-secondary);

    @include md {
      display: inline;
    }
  }

  &__avatar {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 34px;
    height: 34px;
    border-radius: $radius-full;
    background: var(--color-primary-tint);
    color: var(--color-primary);
    font-size: $font-size-sm;
    font-weight: 800;
  }

  &__tabs {
    display: flex;
    gap: $space-2;
    padding: $space-3 $space-4;
    background: var(--color-surface);
    border-bottom: 1px solid var(--color-border);
    overflow-x: auto;

    @include md {
      display: none;
    }
  }

  &__tab {
    flex: none;
    padding: $space-2 - 1px $space-4;
    border-radius: $radius-full;
    font-size: $font-size-sm;
    font-weight: 500;
    color: var(--color-text-secondary);
    text-decoration: none;

    &--active {
      background: var(--color-primary);
      color: var(--color-primary-contrast);
      font-weight: 600;
    }
  }

  &__body {
    flex: 1;
    display: flex;
    min-height: 0;
  }

  &__sidebar {
    display: none;
    width: 220px;
    flex: none;
    flex-direction: column;
    gap: $space-1;
    padding: $space-4 0;
    background: var(--color-surface);
    border-right: 1px solid var(--color-border);

    @include md {
      display: flex;
    }
  }

  &__sidebar-label {
    padding: 0 $space-4 $space-4;
    margin-bottom: $space-2;
    border-bottom: 1px solid var(--color-border);
    font-size: $font-size-xs;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--color-text-muted);
  }

  &__link {
    display: flex;
    align-items: center;
    gap: $space-3;
    margin: 2px $space-3 + 1px;
    padding: $space-3 - 1px $space-4;
    border-radius: 10px;
    font-size: $font-size-base;
    font-weight: 500;
    color: var(--color-text-secondary);
    text-decoration: none;
    transition:
      background $transition,
      color $transition;

    &:hover {
      background: var(--color-surface-elevated);
      color: var(--color-text);
    }

    &--active {
      background: var(--color-primary);
      color: var(--color-primary-contrast);
      font-weight: 600;

      &:hover {
        background: var(--color-primary);
        color: var(--color-primary-contrast);
      }
    }
  }

  &__back {
    display: flex;
    align-items: center;
    gap: $space-2;
    margin: auto $space-3 + 1px 0;
    padding: $space-3 $space-4;
    font-size: $font-size-sm;
    font-weight: 600;
    color: var(--color-text-secondary);
    text-decoration: none;

    &:hover {
      color: var(--color-primary);
    }
  }

  &__content {
    flex: 1;
    min-width: 0;
    overflow: auto;
    padding: $space-5 $space-4;

    @include md {
      padding: $space-6 $space-7;
    }
  }
}
</style>
