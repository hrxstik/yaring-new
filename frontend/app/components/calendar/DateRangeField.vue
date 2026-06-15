<template>
  <button type="button" class="date-field" @click="$emit('click')">
    <span class="date-field__content">
      <span class="date-field__label">{{ label }}</span>
      <span class="date-field__value">{{ value }}</span>
    </span>
    <Calendar :size="20" class="date-field__icon" />
  </button>
</template>

<script setup lang="ts">
import { Calendar } from 'lucide-vue-next';

defineProps<{ label: string; value: string }>();
defineEmits<{ click: [] }>();
</script>

<style scoped lang="scss">
.date-field {
  width: 100%;
  height: 48px;
  padding: 0 $space-4;
  border: 1px solid var(--color-border);
  border-radius: $radius-full;
  background: var(--color-surface);
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  text-align: left;
  transition: border-color $transition;

  &:hover {
    border-color: var(--color-primary);
  }

  &__content {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  &__label {
    font-size: $font-size-xs;
    color: var(--color-text-muted);
  }

  &__value {
    font-size: $font-size-sm;
    color: var(--color-text);
  }

  &__icon {
    color: var(--color-text-secondary);
    flex-shrink: 0;
  }
}
</style>
