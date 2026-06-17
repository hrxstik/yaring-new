<template>
  <header class="header">
    <div class="header__inner">
      <NuxtLink to="/" class="header__logo" @click="menuOpen = false">
        <Trees :size="26" />
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
        <div class="header__nav-mobile">
          <ThemeToggle />
          <NuxtLink v-if="auth.isAdmin" to="/admin" class="header__link" @click="menuOpen = false">
            Админка
          </NuxtLink>
          <NuxtLink v-if="!auth.isLoggedIn" to="/login" @click="menuOpen = false">
            <AppButton block>Войти</AppButton>
          </NuxtLink>
        </div>
      </nav>

      <div class="header__actions">
        <ThemeToggle class="header__theme" />
        <NuxtLink v-if="auth.isAdmin" to="/admin" class="header__link header__link--admin">
          Админ
        </NuxtLink>
        <NuxtLink
          v-if="auth.isLoggedIn"
          to="/profile"
          class="header__profile"
          aria-label="Личный кабинет"
        >
          <User :size="20" />
        </NuxtLink>
        <NuxtLink v-else to="/login" class="header__login">
          <AppButton size="sm">Войти</AppButton>
        </NuxtLink>
        <button
          type="button"
          class="header__burger"
          :aria-expanded="menuOpen"
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
  background: transparent;
  padding: $space-3 0;

  &__inner {
    @include container;
    height: var(--header-height);
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    gap: $space-4;
    background: rgba(255, 255, 255, 0.92);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-elevated);
    backdrop-filter: blur(16px);

    [data-theme='dark'] & {
      background: rgba(26, 36, 32, 0.9);
    }

    @include md {
      grid-template-columns: auto 1fr auto;
    }
  }

  &__logo {
    display: flex;
    align-items: center;
    gap: $space-2;
    font-size: var(--font-lg);
    font-weight: 800;
    color: var(--color-primary);
    text-decoration: none;

    &:hover {
      text-decoration: none;
      opacity: 0.85;
    }
  }

  &__nav {
    display: none;
    align-items: center;
    justify-content: center;
    gap: $space-6;

    @include md {
      display: flex;
    }

    &--open {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      position: fixed;
      top: calc(var(--header-height) + #{$space-6});
      left: 0;
      right: 0;
      bottom: 0;
      background: var(--color-surface);
      padding: $space-5 var(--space-page-x);
      gap: $space-2;
      overflow-y: auto;
      z-index: 40;

      @include md {
        position: static;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        padding: 0;
        overflow: visible;
        background: transparent;
        inset: auto;
      }
    }
  }

  &__nav-mobile {
    display: flex;
    flex-direction: column;
    gap: $space-3;
    margin-top: $space-5;
    padding-top: $space-5;
    border-top: 1px solid var(--color-border);

    @include md {
      display: none;
    }
  }

  &__link {
    position: relative;
    color: var(--color-text-secondary);
    text-decoration: none;
    font-size: var(--font-sm);
    font-weight: 500;
    padding: $space-2 0;
    white-space: nowrap;

    @include md {
      padding: $space-2 0;
    }

    &::after {
      content: '';
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      height: 2px;
      background: var(--color-primary);
      border-radius: 2px;
      transform: scaleX(0);
      transition: transform $transition;
    }

    &:hover {
      color: var(--color-primary);
      text-decoration: none;
    }

    &.router-link-exact-active {
      color: var(--color-primary);
      text-decoration: none;

      &::after {
        transform: scaleX(1);
      }
    }

    &--admin {
      display: none;

      @include sm {
        display: inline;
      }
    }
  }

  &__actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: $space-2;

    @include md {
      gap: $space-3;
    }
  }

  &__theme {
    display: none;

    @include md {
      display: flex;
    }
  }

  &__profile {
    color: var(--color-text);
    display: flex;
    padding: $space-2;
    border-radius: var(--radius-md);

    &:hover {
      background: var(--color-surface-elevated);
      text-decoration: none;
    }
  }

  &__login {
    display: none;
    text-decoration: none;

    @include sm {
      display: inline-flex;
    }
  }

  &__burger {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background: var(--color-surface-elevated);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    color: var(--color-text);
    cursor: pointer;

    @include md {
      display: none;
    }
  }
}
</style>
