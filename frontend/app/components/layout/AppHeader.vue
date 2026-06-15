<template>
  <header class="header">
    <div class="header__inner">
      <NuxtLink to="/" class="header__logo">
        <Trees :size="28" />
        <span>Яринг</span>
      </NuxtLink>

      <nav class="header__nav" :class="{ 'header__nav--open': menuOpen }">
        <NuxtLink
          v-for="link in navLinks"
          :key="link.to"
          :to="link.to"
          class="header__link"
          @click="menuOpen = false"
        >
          {{ link.label }}
        </NuxtLink>
      </nav>

      <div class="header__actions">
        <ThemeToggle />
        <NuxtLink v-if="auth.isAdmin" to="/admin" class="header__link header__link--admin">
          Админ
        </NuxtLink>
        <NuxtLink v-if="auth.isLoggedIn" to="/profile" class="header__profile">
          <User :size="20" />
        </NuxtLink>
        <NuxtLink v-else to="/login">
          <AppButton size="sm" variant="secondary">Войти</AppButton>
        </NuxtLink>
        <button
          type="button"
          class="header__burger"
          aria-label="Меню"
          @click="menuOpen = !menuOpen"
        >
          <Menu v-if="!menuOpen" :size="24" />
          <X v-else :size="24" />
        </button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { Trees, User, Menu, X } from 'lucide-vue-next';

const auth = useAuthStore();
const menuOpen = ref(false);

const navLinks = [
  { to: '/', label: 'Главная' },
  { to: '/prices', label: 'Цены' },
  { to: '/booking', label: 'Бронирование' },
  { to: '/rules', label: 'Правила' },
  { to: '/contacts', label: 'Контакты' },
];
</script>

<style scoped lang="scss">
.header {
  position: sticky;
  top: 0;
  z-index: 50;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  height: $header-height;

  &__inner {
    @include container;
    height: 100%;
    display: flex;
    align-items: center;
    gap: $space-4;
  }

  &__logo {
    display: flex;
    align-items: center;
    gap: $space-2;
    font-size: $font-size-lg;
    font-weight: 600;
    color: var(--color-primary);
    text-decoration: none;

    &:hover {
      text-decoration: none;
    }
  }

  &__nav {
    display: none;
    gap: $space-5;
    margin-left: auto;

    @include lg {
      display: flex;
    }

    &--open {
      display: flex;
      flex-direction: column;
      position: absolute;
      top: $header-height;
      left: 0;
      right: 0;
      background: var(--color-surface);
      padding: $space-4;
      border-bottom: 1px solid var(--color-border);

      @include lg {
        position: static;
        flex-direction: row;
        padding: 0;
        border: none;
      }
    }
  }

  &__link {
    color: var(--color-text-secondary);
    text-decoration: none;
    font-size: $font-size-sm;

    &:hover,
    &.router-link-active {
      color: var(--color-primary);
      text-decoration: none;
    }

    &--admin {
      display: none;

      @include md {
        display: inline;
      }
    }
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: $space-3;
    margin-left: auto;

    @include lg {
      margin-left: 0;
    }
  }

  &__profile {
    color: var(--color-text);
    display: flex;
    padding: $space-2;
  }

  &__burger {
    display: flex;
    background: none;
    border: none;
    color: var(--color-text);
    cursor: pointer;

    @include lg {
      display: none;
    }
  }
}
</style>
