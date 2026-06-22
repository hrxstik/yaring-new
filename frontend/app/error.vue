<template>
  <div class="error-page">
    <div class="error-page__content">
      <p class="error-page__code">{{ error?.statusCode ?? 500 }}</p>
      <h1 class="error-page__title">
        {{ statusMessage }}
      </h1>
      <p class="error-page__hint">
        {{ statusHint }}
      </p>
      <div class="error-page__actions">
        <AppButton @click="handleError">На главную</AppButton>
        <AppButton variant="secondary" @click="clearError({ redirect: '/' })">
          Попробовать ещё раз
        </AppButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { NuxtError } from '#app';

const props = defineProps<{ error: NuxtError }>();

const statusMessage = computed(() => {
  if (props.error?.statusCode === 404) return 'Страница не найдена';
  if (props.error?.statusCode === 403) return 'Нет доступа';
  return 'Что-то пошло не так';
});

const statusHint = computed(() => {
  if (props.error?.statusCode === 404)
    return 'Возможно, страница была перемещена или удалена.';
  if (props.error?.statusCode === 403)
    return 'У вас нет прав для просмотра этой страницы.';
  return 'Попробуйте обновить страницу или вернитесь позже.';
});

function handleError() {
  clearError({ redirect: '/' });
}
</script>

<style scoped lang="scss">
@use '~/assets/styles/shared' as *;

.error-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg);
  padding: $space-8;

  &__content {
    text-align: center;
    max-width: 480px;
  }

  &__code {
    font-size: 96px;
    font-weight: 800;
    line-height: 1;
    color: var(--color-primary);
    opacity: 0.2;
    margin: 0 0 $space-4;
    letter-spacing: -0.05em;
  }

  &__title {
    font-size: $font-size-3xl;
    font-weight: 700;
    color: var(--color-text);
    margin: 0 0 $space-3;
  }

  &__hint {
    color: var(--color-text-secondary);
    margin: 0 0 $space-6;
  }

  &__actions {
    display: flex;
    gap: $space-3;
    justify-content: center;
    flex-wrap: wrap;
  }
}
</style>
