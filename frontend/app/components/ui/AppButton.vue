<template>
  <button
    :type="type"
    :class="['btn', `btn--${variant}`, `btn--${size}`, { 'btn--block': block }]"
    :disabled="disabled || loading"
  >
    <span v-if="loading" class="btn__spinner" aria-hidden="true" />
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
    size?: 'sm' | 'md' | 'lg';
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

  &--sm {
    height: 32px;
    padding: 0 $space-4;
    font-size: var(--font-sm);
  }

  &--md {
    height: 40px;
    padding: 0 $space-5;
  }

  &--lg {
    height: 48px;
    padding: 0 $space-6;
    font-size: var(--font-lg);
  }

  &--block {
    width: 100%;
    font-weight: 700;
  }

  &--primary {
    background: var(--color-primary);
    color: var(--color-primary-contrast);

    &:hover:not(:disabled) {
      filter: brightness(1.08);
    }
    &:active:not(:disabled) {
      transform: scale(0.98);
    }
  }

  &--secondary {
    background: transparent;
    color: var(--color-primary);
    border: 1.5px solid var(--color-primary);

    &:hover:not(:disabled) {
      background: var(--color-primary-tint);
    }
    &:active:not(:disabled) {
      transform: scale(0.98);
    }
  }

  &--ghost {
    background: transparent;
    color: var(--color-primary);

    &:hover:not(:disabled) {
      background: var(--color-primary-tint);
    }
  }

  &--danger {
    background: var(--color-danger);
    color: #fff;

    &:hover:not(:disabled) {
      filter: brightness(1.08);
    }
    &:active:not(:disabled) {
      transform: scale(0.98);
    }
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &__spinner {
    width: 15px;
    height: 15px;
    border: 2px solid rgba(255, 255, 255, 0.4);
    border-top-color: currentColor;
    border-radius: 50%;
    animation: yar-spin 0.7s linear infinite;
  }
}
</style>
