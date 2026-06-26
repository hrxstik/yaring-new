<template>
  <div class="alert" :class="`alert--${variant}`" role="alert">
    <component :is="icon" :size="20" class="alert__icon" />
    <div class="alert__body">
      <p v-if="title" class="alert__title">{{ title }}</p>
      <p v-if="message || $slots.default" class="alert__message">
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
  gap: $space-3;
  padding: $space-3 + 2px;
  border-radius: var(--radius-md);
  border-left: 3px solid var(--color-text-muted);
  background: var(--color-surface-elevated);

  &--error {
    border-left-color: var(--color-danger);
    background: var(--status-cancelled-bg);

    .alert__icon {
      color: var(--color-danger);
    }
  }

  &--success {
    border-left-color: var(--color-primary);
    background: var(--color-primary-tint);

    .alert__icon {
      color: var(--color-primary);
    }
  }

  &--info {
    border-left-color: var(--status-completed-text);
    background: var(--status-completed-bg);

    .alert__icon {
      color: var(--status-completed-text);
    }
  }

  &--warning {
    border-left-color: var(--status-pending-text);
    background: var(--status-pending-bg);

    .alert__icon {
      color: var(--status-pending-text);
    }
  }

  &__icon {
    flex: none;
    margin-top: 1px;
  }

  &__body {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  &__title {
    margin: 0;
    font-size: $font-size-sm;
    font-weight: 700;
    color: var(--color-text);
  }

  &__message {
    margin: 0;
    font-size: $font-size-sm;
    line-height: 1.45;
    color: var(--color-text-secondary);
  }

  &__actions {
    margin-top: $space-2;
    display: flex;
    flex-wrap: wrap;
    gap: $space-2;
  }
}
</style>
