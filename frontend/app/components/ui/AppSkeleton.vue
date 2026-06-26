<template>
  <div
    class="skeleton"
    :class="[`skeleton--${variant}`, { 'skeleton--circle': circle }]"
    :style="style"
    aria-hidden="true"
  />
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    width?: string;
    height?: string;
    radius?: string;
    variant?: 'text' | 'title' | 'block' | 'button';
    circle?: boolean;
  }>(),
  {
    width: '100%',
    height: '1em',
    radius: 'var(--radius-md)',
    variant: 'text',
    circle: false,
  },
);

const style = computed(() => ({
  width: props.width,
  height: props.height,
  borderRadius: props.circle ? '50%' : props.radius,
}));
</script>

<style scoped lang="scss">
.skeleton {
  background: linear-gradient(
    90deg,
    var(--color-border),
    var(--color-surface-elevated),
    var(--color-border)
  );
  background-size: 200% 100%;
  animation: yar-shimmer 1.5s infinite;

  &--title {
    height: 2rem;
    border-radius: var(--radius-md);
  }

  &--block {
    border-radius: var(--radius-lg);
  }

  &--button {
    height: 48px;
    border-radius: $radius-full;
  }
}
</style>
