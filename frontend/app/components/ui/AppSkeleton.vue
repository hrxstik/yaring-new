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
    var(--color-surface-elevated) 0%,
    var(--color-border) 50%,
    var(--color-surface-elevated) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.4s ease-in-out infinite;

  &--title {
    height: 2rem;
    border-radius: var(--radius-md);
  }

  &--block {
    border-radius: var(--radius-lg);
  }

  &--button {
    height: 44px;
    border-radius: $radius-full;
  }
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>
