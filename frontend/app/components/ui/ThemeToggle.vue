<template>
  <button
    type="button"
    class="theme-toggle"
    aria-label="Переключить тему"
    @click="toggle"
  >
    <Sun
      :class="['theme-toggle__icon', 'theme-toggle__icon--sun', { 'theme-toggle__icon--hidden': isDark }]"
    />
    <Moon
      :class="['theme-toggle__icon', 'theme-toggle__icon--moon', { 'theme-toggle__icon--hidden': !isDark }]"
    />
  </button>
</template>

<script setup lang="ts">
import { Sun, Moon } from 'lucide-vue-next';

const { theme, toggle } = useTheme();
const isDark = computed(() => theme.value === 'dark');
</script>

<style scoped lang="scss">
.theme-toggle {
  position: relative;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 0;

  &__icon {
    position: absolute;
    inset: 0;
    margin: auto;
    width: 20px;
    height: 20px;
    transition: transform $transition, opacity $transition;

    &--sun {
      color: #f59e0b;
      fill: #f59e0b;
    }

    &--moon {
      color: var(--color-text-secondary);
    }

    &--hidden {
      opacity: 0;
      transform: scale(0) rotate(90deg);
    }
  }
}
</style>
