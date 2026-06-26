<template>
  <div class="auth">
    <div class="auth__card">
      <div class="auth__head auth__head--start">
        <h1 class="auth__title">{{ step === 'request' ? 'Сброс пароля' : 'Новый пароль' }}</h1>
        <p class="auth__hint">
          {{ step === 'request'
            ? 'Введите телефон — отправим код для сброса'
            : `Код отправлен на ${phone}` }}
        </p>
      </div>

      <form v-if="step === 'request'" class="auth__form" @submit.prevent="requestReset">
        <AppInput
          v-model="phone"
          label="Телефон"
          type="tel"
          placeholder="+7 (999) 000-00-00"
          autocomplete="tel"
        />
        <AppAlert v-if="error" variant="error" :message="error" />
        <AppButton type="submit" size="lg" block :loading="loading">Отправить код</AppButton>
      </form>

      <form v-else class="auth__form" @submit.prevent="confirmReset">
        <AppInput v-model="code" label="Код из SMS" maxlength="6" />
        <AppInput
          v-model="newPassword"
          label="Новый пароль"
          type="password"
          autocomplete="new-password"
        />
        <AppAlert v-if="error" variant="error" :message="error" />
        <AppButton type="submit" size="lg" block :loading="loading">Сохранить пароль</AppButton>
        <AppButton type="button" variant="ghost" block @click="step = 'request'">
          Назад
        </AppButton>
      </form>

      <p class="auth__footer">
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
    const data = await request<{ accessToken: string; refreshToken: string; user: User }>(
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
    auth.setSession(data.accessToken, data.user, data.refreshToken);
    await navigateTo('/profile');
  } catch (e) {
    error.value = formatApiError(e);
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped lang="scss">
@use 'auth' as *;
</style>
