<template>
  <div class="error-page">
    <span class="error-page__ghost" aria-hidden="true">{{ error?.statusCode ?? 500 }}</span>
    <div class="error-page__content">
      <h1 class="error-page__title">{{ statusMessage }}</h1>
      <p class="error-page__hint">{{ statusHint }}</p>
      <div class="error-page__actions">
        <AppButton size="lg" @click="handleError">На главную</AppButton>
        <AppButton variant="secondary" size="lg" @click="clearError({ redirect: '/' })">
          Попробовать снова
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
    return 'Похоже, тропинка заблудилась в лесу. Вернёмся к началу?';
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
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: var(--color-bg);
  padding: $space-8 var(--space-page-x);

  &__ghost {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -58%);
    font-size: clamp(180px, 38vw, 360px);
    font-weight: 800;
    line-height: 1;
    color: var(--color-primary);
    opacity: 0.12;
    pointer-events: none;
    user-select: none;
  }

  &__content {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: $space-4;
    max-width: 400px;
    text-align: center;
  }

  &__title {
    margin: 0;
    font-size: var(--font-2xl);
    font-weight: 800;
  }

  &__hint {
    margin: 0;
    font-size: var(--font-lg);
    color: var(--color-text-secondary);
  }

  &__actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: $space-3;
  }
}
</style>
