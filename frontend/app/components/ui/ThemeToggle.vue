<template>
  <button
    type="button"
    class="theme-toggle"
    :aria-label="isDark ? 'Светлая тема' : 'Тёмная тема'"
    @click="toggle"
  >
    <Moon v-if="!isDark" :size="16" />
    <Sun v-else :size="16" />
  </button>
</template>

<script setup lang="ts">
import { Sun, Moon } from 'lucide-vue-next';

const { theme, toggle } = useTheme();
const isDark = computed(() => theme.value === 'dark');
</script>

<style scoped lang="scss">
.theme-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 1px solid var(--color-border);
  border-radius: $radius-full;
  background: transparent;
  color: var(--color-text);
  cursor: pointer;
  transition:
    border-color $transition,
    color $transition;

  &:hover {
    border-color: var(--color-primary);
    color: var(--color-primary);
  }
}
</style>
