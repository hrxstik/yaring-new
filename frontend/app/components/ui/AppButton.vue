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
    font-size: var(--font-sm);
  }

  &--primary {
    background: var(--color-primary);
    color: var(--color-primary-contrast);
    box-shadow: 0 4px 14px rgba(61, 107, 79, 0.25);

    &:hover:not(:disabled) {
      opacity: 0.92;
      transform: translateY(-1px);
    }
  }

  &--secondary {
    background: var(--color-surface);
    color: var(--color-primary);
    border: 1px solid var(--color-primary);

    &:hover:not(:disabled) {
      background: rgba(61, 107, 79, 0.08);
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
    transform: none;
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
