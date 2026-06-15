<template>
  <button
    :type="type"
    :class="['btn', `btn--${variant}`, { 'btn--block': block, 'btn--sm': size === 'sm' }]"
    :disabled="disabled || loading"
  >
    <span v-if="loading" class="btn__spinner" />
    <slot />
  </button>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    type?: 'button' | 'submit';
    block?: boolean;
    disabled?: boolean;
    loading?: boolean;
    size?: 'md' | 'sm';
  }>(),
  {
    variant: 'primary',
    type: 'button',
    block: false,
    disabled: false,
    loading: false,
    size: 'md',
  },
);
</script>

<style scoped lang="scss">
.btn {
  @include button-base;
  @include focus-ring;

  &--block {
    width: 100%;
  }

  &--sm {
    padding: $space-2 $space-4;
    font-size: $font-size-sm;
  }

  &--primary {
    background: var(--color-primary);
    color: var(--color-primary-contrast);

    &:hover:not(:disabled) {
      opacity: 0.9;
    }
  }

  &--secondary {
    background: var(--color-surface-elevated);
    color: var(--color-text);
    border: 1px solid var(--color-border);

    &:hover:not(:disabled) {
      border-color: var(--color-primary);
    }
  }

  &--ghost {
    background: transparent;
    color: var(--color-text-secondary);

    &:hover:not(:disabled) {
      color: var(--color-primary);
    }
  }

  &--danger {
    background: #c0392b;
    color: #fff;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &__spinner {
    width: 16px;
    height: 16px;
    border: 2px solid currentColor;
    border-top-color: transparent;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
