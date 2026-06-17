<template>
  <div class="content-skeleton">
    <AppSkeleton variant="title" width="45%" height="2.5rem" />
    <AppSkeleton width="100%" />
    <AppSkeleton width="96%" />
    <AppSkeleton width="88%" />
    <AppSkeleton width="72%" />
    <AppSkeleton variant="title" width="35%" height="1.75rem" class="content-skeleton__gap" />
    <AppSkeleton width="100%" />
    <AppSkeleton width="90%" />
  </div>
</template>

<style scoped lang="scss">
.content-skeleton {
  max-width: 800px;
  display: flex;
  flex-direction: column;
  gap: $space-3;

  &__gap {
    margin-top: $space-5;
  }
}
</style>
