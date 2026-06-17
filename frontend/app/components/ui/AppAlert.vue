<template>
  <div class="alert" :class="`alert--${variant}`" role="alert">
    <component :is="icon" :size="22" class="alert__icon" />
    <div class="alert__body">
      <p v-if="title" class="alert__title">{{ title }}</p>
      <p class="alert__message">
        <slot>{{ message }}</slot>
      </p>
      <div v-if="$slots.actions" class="alert__actions">
        <slot name="actions" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from 'lucide-vue-next';

const props = withDefaults(
  defineProps<{
    variant?: 'error' | 'success' | 'info' | 'warning';
    title?: string;
    message?: string;
  }>(),
  { variant: 'error' },
);

const icon = computed(() => {
  const map = {
    error: AlertCircle,
    success: CheckCircle2,
    info: Info,
    warning: AlertTriangle,
  };
  return map[props.variant];
});
</script>

<style scoped lang="scss">
.alert {
  display: flex;
  gap: $space-4;
  padding: $space-4 $space-5;
  border-radius: var(--radius-lg);
  border: 1px solid transparent;

  &--error {
    background: rgba(192, 57, 43, 0.08);
    border-color: rgba(192, 57, 43, 0.2);
    color: #8b2e24;

    .alert__icon {
      color: #c0392b;
    }
  }

  &--success {
    background: rgba(61, 107, 79, 0.1);
    border-color: rgba(61, 107, 79, 0.25);
    color: var(--color-primary);

    .alert__icon {
      color: var(--color-primary);
    }
  }

  &--info {
    background: rgba(61, 107, 79, 0.06);
    border-color: var(--color-border);
    color: var(--color-text-secondary);

    .alert__icon {
      color: var(--color-primary);
    }
  }

  &--warning {
    background: rgba(245, 158, 11, 0.1);
    border-color: rgba(245, 158, 11, 0.25);
    color: #92400e;

    .alert__icon {
      color: #d97706;
    }
  }

  &__icon {
    flex-shrink: 0;
    margin-top: 2px;
  }

  &__title {
    font-weight: 700;
    margin: 0 0 $space-1;
    font-size: var(--font-base);
  }

  &__message {
    margin: 0;
    font-size: var(--font-sm);
    line-height: 1.5;
  }

  &__actions {
    margin-top: $space-3;
    display: flex;
    flex-wrap: wrap;
    gap: $space-2;
  }
}
</style>
