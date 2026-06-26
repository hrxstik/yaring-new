<template>
  <label class="field" :class="{ 'field--disabled': disabled }">
    <span v-if="label" class="field__label" :class="{ 'field__label--error': error }">
      {{ label }}
    </span>
    <input
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :autocomplete="autocomplete"
      class="field__input"
      :class="{ 'field__input--error': error }"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
    <span v-if="error" class="field__error">{{ error }}</span>
  </label>
</template>

<script setup lang="ts">
defineProps<{
  label?: string;
  modelValue: string;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  autocomplete?: string;
}>();

defineEmits<{ 'update:modelValue': [value: string] }>();
</script>

<style scoped lang="scss">
.field {
  display: flex;
  flex-direction: column;
  gap: $space-1 + 2px;

  &--disabled {
    opacity: 0.55;
  }

  &__label {
    font-size: $font-size-sm;
    font-weight: 500;
    color: var(--color-text-secondary);

    &--error {
      color: var(--color-danger);
    }
  }

  &__input {
    height: 44px;
    padding: 0 $space-3 + 2px;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-surface);
    color: var(--color-text);
    font-family: inherit;
    font-size: $font-size-base;
    outline: none;
    transition:
      border-color $transition,
      box-shadow $transition;

    &::placeholder {
      color: var(--color-text-muted);
    }

    &:focus {
      border-color: var(--color-primary);
      box-shadow: 0 0 0 3px var(--color-primary-tint);
    }

    &--error {
      border-color: var(--color-danger);
    }

    &:disabled {
      background: var(--color-surface-elevated);
      color: var(--color-text-muted);
      cursor: not-allowed;
    }
  }

  &__error {
    font-size: $font-size-xs;
    color: var(--color-danger);
  }
}
</style>
