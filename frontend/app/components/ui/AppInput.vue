<template>
  <label class="field">
    <span v-if="label" class="field__label">{{ label }}</span>
    <input
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :autocomplete="autocomplete"
      class="field__input"
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
  gap: $space-2;

  &__label {
    font-size: $font-size-sm;
    color: var(--color-text-secondary);
  }

  &__input {
    height: 48px;
    padding: 0 $space-4;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-surface);
    color: var(--color-text);
    font-size: $font-size-base;
    transition: border-color $transition;

    &:focus {
      outline: none;
      border-color: var(--color-primary);
    }

    &::placeholder {
      color: var(--color-text-muted);
    }
  }

  &__error {
    font-size: $font-size-sm;
    color: #c0392b;
  }
}
</style>
