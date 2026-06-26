<template>
  <header class="header">
    <div class="header__inner">
      <NuxtLink to="/" class="header__logo" @click="menuOpen = false">
        <span class="header__logo-mark"><Trees :size="19" /></span>
        <span class="header__logo-text">Яринг</span>
      </NuxtLink>

      <nav class="header__nav">
        <NuxtLink
          v-for="link in navLinks"
          :key="link.to"
          :to="link.to"
          class="header__link"
        >
          {{ link.label }}
        </NuxtLink>
      </nav>

      <div class="header__actions">
        <ThemeToggle />
        <NuxtLink v-if="auth.isAdmin" to="/admin">
          <AppButton variant="ghost" size="md">Админка</AppButton>
        </NuxtLink>
        <NuxtLink v-if="auth.isLoggedIn" to="/profile">
          <AppButton size="md">Личный кабинет</AppButton>
        </NuxtLink>
        <template v-else>
          <NuxtLink to="/login"><AppButton variant="ghost" size="md">Войти</AppButton></NuxtLink>
          <NuxtLink to="/register"><AppButton size="md">Регистрация</AppButton></NuxtLink>
        </template>
      </div>

      <button
        type="button"
        class="header__burger"
        :aria-expanded="menuOpen"
        aria-label="Меню"
        @click="menuOpen = true"
      >
        <Menu :size="20" />
      </button>
    </div>

    <Teleport to="body">
      <Transition name="menu">
        <div v-if="menuOpen" class="menu">
          <div class="menu__top">
            <NuxtLink to="/" class="header__logo" @click="menuOpen = false">
              <span class="header__logo-mark"><Trees :size="19" /></span>
              <span class="header__logo-text">Яринг</span>
            </NuxtLink>
            <button type="button" class="header__burger" aria-label="Закрыть" @click="menuOpen = false">
              <X :size="20" />
            </button>
          </div>
          <nav class="menu__nav">
            <NuxtLink
              v-for="link in navLinks"
              :key="link.to"
              :to="link.to"
              class="menu__link"
              @click="menuOpen = false"
            >
              {{ link.label }}
            </NuxtLink>
          </nav>
          <div class="menu__footer">
            <div class="menu__theme"><ThemeToggle /></div>
            <NuxtLink v-if="auth.isAdmin" to="/admin" @click="menuOpen = false">
              <AppButton variant="secondary" size="lg" block>Админка</AppButton>
            </NuxtLink>
            <NuxtLink v-if="auth.isLoggedIn" to="/profile" @click="menuOpen = false">
              <AppButton size="lg" block>Личный кабинет</AppButton>
            </NuxtLink>
            <template v-else>
              <NuxtLink to="/register" @click="menuOpen = false">
                <AppButton size="lg" block>Регистрация</AppButton>
              </NuxtLink>
              <NuxtLink to="/login" @click="menuOpen = false">
                <AppButton variant="secondary" size="lg" block>Войти</AppButton>
              </NuxtLink>
            </template>
          </div>
        </div>
      </Transition>
    </Teleport>
  </header>
</template>

<script setup lang="ts">
import { Trees, Menu, X } from 'lucide-vue-next';

const auth = useAuthStore();
const menuOpen = ref(false);
const route = useRoute();

const navLinks = [
  { to: '/', label: 'Главная' },
  { to: '/booking', label: 'Бронирование' },
  { to: '/rules', label: 'Правила' },
  { to: '/contacts', label: 'Контакты' },
];

watch(() => route.fullPath, () => { menuOpen.value = false; });

watch(menuOpen, (open) => {
  if (import.meta.client) document.body.style.overflow = open ? 'hidden' : '';
});

onUnmounted(() => {
  if (import.meta.client) document.body.style.overflow = '';
});
</script>

<style scoped lang="scss">
.header {
  position: sticky;
  top: 0;
  z-index: 50;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);

  &__inner {
    @include container;
    height: var(--header-height);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: $space-4;
  }

  &__logo {
    display: flex;
    align-items: center;
    gap: $space-2 + 1px;
    text-decoration: none;
    color: var(--color-text);

    &:hover {
      text-decoration: none;
    }
  }

  &__logo-mark {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 9px;
    background: var(--color-primary);
    color: var(--color-primary-contrast);
    flex: none;

    @include md {
      width: 34px;
      height: 34px;
    }
  }

  &__logo-text {
    font-weight: 800;
    font-size: var(--font-lg);
    letter-spacing: -0.01em;
  }

  &__nav {
    display: none;
    align-items: center;
    gap: $space-1;

    @include md {
      display: flex;
    }
  }

  &__link {
    padding: $space-2 + 1px $space-4;
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
      text-decoration: none;
    }

    &.router-link-exact-active {
      color: var(--color-primary);
      font-weight: 600;
      background: var(--color-primary-tint);
    }
  }

  &__actions {
    display: none;
    align-items: center;
    gap: $space-2;

    @include md {
      display: flex;
    }
  }

  &__burger {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border: none;
    border-radius: 10px;
    background: transparent;
    color: var(--color-text);
    cursor: pointer;

    @include md {
      display: none;
    }
  }
}

.menu {
  position: fixed;
  inset: 0;
  z-index: 60;
  background: var(--color-surface);
  display: flex;
  flex-direction: column;

  &__top {
    height: var(--header-height);
    flex: none;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 var(--space-page-x);
    border-bottom: 1px solid var(--color-border);
  }

  &__nav {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: $space-2;
    padding: $space-5;
  }

  &__link {
    padding: $space-3;
    font-size: var(--font-2xl);
    font-weight: 600;
    color: var(--color-text);
    text-decoration: none;

    &:hover {
      text-decoration: none;
    }

    &.router-link-exact-active {
      color: var(--color-primary);
      font-weight: 700;
    }
  }

  &__footer {
    flex: none;
    display: flex;
    flex-direction: column;
    gap: $space-3;
    padding: $space-5 var(--space-page-x);
    border-top: 1px solid var(--color-border);
  }

  &__theme {
    display: flex;
    justify-content: center;
  }
}

.menu-enter-active,
.menu-leave-active {
  transition: opacity 0.2s ease;
}
.menu-enter-from,
.menu-leave-to {
  opacity: 0;
}
</style>
