<template>
  <div class="date-field">
    <span class="date-field__label">{{ label }}</span>
    <button type="button" class="date-field__btn" @click="$emit('click')">
      <span class="date-field__value">
        <component :is="iconComponent" :size="18" class="date-field__icon" />
        {{ value }}
      </span>
      <ChevronRight :size="18" class="date-field__chevron" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { Calendar, Clock, ChevronRight } from 'lucide-vue-next';

const props = withDefaults(
  defineProps<{ label: string; value: string; icon?: 'calendar' | 'clock' }>(),
  { icon: 'calendar' },
);
defineEmits<{ click: [] }>();

const iconComponent = computed(() => (props.icon === 'clock' ? Clock : Calendar));
</script>

<style scoped lang="scss">
.date-field {
  display: flex;
  flex-direction: column;
  gap: $space-1 + 2px;

  &__label {
    font-size: $font-size-sm;
    font-weight: 500;
    color: var(--color-text-secondary);
  }

  &__btn {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 52px;
    padding: 0 $space-4;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-surface);
    color: var(--color-text);
    font-family: inherit;
    font-size: $font-size-base;
    font-weight: 600;
    cursor: pointer;
    transition: border-color $transition;

    &:hover {
      border-color: var(--color-primary);
    }
  }

  &__value {
    display: flex;
    align-items: center;
    gap: $space-2 + 1px;
  }

  &__icon {
    color: var(--color-primary);
    flex: none;
  }

  &__chevron {
    color: var(--color-text-muted);
    flex: none;
  }
}
</style>
