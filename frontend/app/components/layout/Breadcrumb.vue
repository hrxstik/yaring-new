<template>
  <nav class="breadcrumb" aria-label="Хлебные крошки">
    <NuxtLink to="/">Главная</NuxtLink>
    <ChevronRight :size="14" />
    <span>{{ current }}</span>
  </nav>
</template>

<script setup lang="ts">
import { ChevronRight } from 'lucide-vue-next';

defineProps<{ current: string }>();
</script>

<style scoped lang="scss">
.breadcrumb {
  display: flex;
  align-items: center;
  gap: $space-1 + 2px;
  font-size: $font-size-sm;
  color: var(--color-text-muted);
  margin-bottom: $space-4;

  a {
    color: var(--color-text-secondary);
    text-decoration: none;

    &:hover {
      color: var(--color-primary);
    }
  }

  span {
    color: var(--color-text);
    font-weight: 600;
  }
}
</style>
