<template>
  <div class="page-content auth-page">
    <div class="auth-page__card">
      <h1>{{ step === 'request' ? 'Сброс пароля' : 'Новый пароль' }}</h1>

      <form v-if="step === 'request'" class="auth-page__form" @submit.prevent="requestReset">
        <AppInput
          v-model="phone"
          label="Телефон"
          type="tel"
          placeholder="+7 (999) 000-00-00"
          autocomplete="tel"
        />
        <AppAlert v-if="error" :message="error" />
        <AppButton type="submit" block :loading="loading">Отправить код</AppButton>
      </form>

      <form v-else class="auth-page__form" @submit.prevent="confirmReset">
        <p class="auth-page__hint">Код отправлен на {{ phone }}</p>
        <AppInput v-model="code" label="Код из SMS" maxlength="6" />
        <AppInput
          v-model="newPassword"
          label="Новый пароль"
          type="password"
          autocomplete="new-password"
        />
        <AppAlert v-if="error" :message="error" />
        <AppButton type="submit" block :loading="loading">Сохранить пароль</AppButton>
        <AppButton type="button" variant="ghost" block @click="step = 'request'">
          Назад
        </AppButton>
      </form>

      <p class="auth-page__footer">
        Вспомнили пароль?
        <NuxtLink to="/login">Войти</NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { User } from '~/types';

useHead({ title: 'Сброс пароля — Яринг' });
useSeoMeta({ description: 'Восстановление доступа к аккаунту базы отдыха Яринг.' });

const auth = useAuthStore();
const { request, formatApiError } = useApi();

const step = ref<'request' | 'confirm'>('request');
const phone = ref('');
const code = ref('');
const newPassword = ref('');
const error = ref<string | null>(null);
const loading = ref(false);

async function requestReset() {
  loading.value = true;
  error.value = null;
  try {
    await request('/auth/reset-password/request', {
      method: 'POST',
      body: JSON.stringify({ phone: phone.value }),
    });
    step.value = 'confirm';
  } catch (e) {
    error.value = formatApiError(e);
  } finally {
    loading.value = false;
  }
}

async function confirmReset() {
  loading.value = true;
  error.value = null;
  try {
    const data = await request<{ accessToken: string; user: User }>(
      '/auth/reset-password/confirm',
      {
        method: 'POST',
        body: JSON.stringify({
          phone: phone.value,
          code: code.value,
          newPassword: newPassword.value,
        }),
      },
    );
    auth.setSession(data.accessToken, data.user);
    await navigateTo('/profile');
  } catch (e) {
    error.value = formatApiError(e);
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped lang="scss">
.auth-page {
  min-height: calc(100vh - var(--header-height) - 220px);
  display: flex;
  justify-content: center;
  align-items: center;
  padding-block: $space-10;

  &__card {
    @include card;
    width: 100%;
    max-width: 420px;
  }

  &__form {
    display: flex;
    flex-direction: column;
    gap: $space-4;
    margin-top: $space-5;
  }

  &__hint {
    font-size: $font-size-sm;
    color: var(--color-text-secondary);
    margin: 0;
  }

  &__footer {
    margin-top: $space-5;
    text-align: center;
    font-size: $font-size-sm;
    color: var(--color-text-secondary);
  }
}
</style>
