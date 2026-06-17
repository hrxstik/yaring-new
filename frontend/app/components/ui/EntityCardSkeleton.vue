<template>
  <div class="entity-skeleton-grid">
    <article v-for="n in count" :key="n" class="entity-skeleton">
      <AppSkeleton variant="block" height="200px" radius="0" />
      <div class="entity-skeleton__body">
        <AppSkeleton variant="title" width="70%" />
        <AppSkeleton width="100%" />
        <AppSkeleton width="88%" />
        <AppSkeleton width="60%" height="12px" />
        <AppSkeleton variant="button" />
      </div>
    </article>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ count?: number }>(), { count: 3 });
</script>

<style scoped lang="scss">
.entity-skeleton-grid {
  display: grid;
  gap: $space-6;

  @include sm {
    grid-template-columns: repeat(2, 1fr);
  }

  @include md {
    grid-template-columns: repeat(3, 1fr);
  }
}

.entity-skeleton {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: var(--color-surface);

  &__body {
    padding: $space-5;
    display: flex;
    flex-direction: column;
    gap: $space-3;
  }
}
</style>
