<template>
  <div class="auth">
    <div class="auth__card">
      <div class="auth__head auth__head--start">
        <div class="auth__steps">
          <span class="auth__step-dot auth__step-dot--active" />
          <span class="auth__step-dot" :class="{ 'auth__step-dot--active': step === 'verify' }" />
          <span class="auth__step-label">Шаг {{ step === 'register' ? 1 : 2 }} из 2</span>
        </div>
        <h1 class="auth__title">{{ step === 'register' ? 'Регистрация' : 'Подтверждение' }}</h1>
        <p v-if="step === 'verify'" class="auth__hint">Код отправлен на {{ phone }}</p>
      </div>

      <form v-if="step === 'register'" class="auth__form" @submit.prevent="register">
        <AppInput v-model="name" label="Имя" autocomplete="name" />
        <AppInput
          v-model="phone"
          label="Телефон"
          type="tel"
          placeholder="+7 (999) 000-00-00"
          autocomplete="tel"
        />
        <AppInput
          v-model="password"
          label="Пароль"
          type="password"
          autocomplete="new-password"
        />
        <AppAlert v-if="error" variant="error" :message="error" />
        <AppButton type="submit" size="lg" block :loading="loading">Далее</AppButton>
      </form>

      <form v-else class="auth__form" @submit.prevent="verify">
        <AppInput v-model="code" label="Код из SMS" maxlength="6" />
        <AppAlert v-if="error" variant="error" :message="error" />
        <AppAlert v-if="resendMessage" variant="success" :message="resendMessage" />
        <AppButton type="submit" size="lg" block :loading="loading">Подтвердить</AppButton>
        <AppButton type="button" variant="ghost" block @click="resend">
          Отправить код повторно
        </AppButton>
      </form>

      <p class="auth__footer">
        Уже есть аккаунт?
        <NuxtLink to="/login">Войти</NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { User } from '~/types';

useHead({ title: 'Регистрация — Яринг' });

const auth = useAuthStore();
const { request, formatApiError } = useApi();

const step = ref<'register' | 'verify'>('register');
const name = ref('');
const phone = ref('');
const password = ref('');
const code = ref('');
const error = ref<string | null>(null);
const loading = ref(false);

async function register() {
  loading.value = true;
  error.value = null;
  try {
    await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: name.value,
        phone: phone.value,
        password: password.value,
      }),
    });
    step.value = 'verify';
  } catch (e) {
    error.value = formatApiError(e);
  } finally {
    loading.value = false;
  }
}

async function verify() {
  loading.value = true;
  error.value = null;
  try {
    const data = await request<{ accessToken: string; refreshToken: string; user: User }>(
      '/auth/verify-phone',
      {
        method: 'POST',
        body: JSON.stringify({ phone: phone.value, code: code.value }),
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

const resendMessage = ref<string | null>(null);

async function resend() {
  error.value = null;
  resendMessage.value = null;
  try {
    await request('/auth/resend-code', {
      method: 'POST',
      body: JSON.stringify({ phone: phone.value }),
    });
    resendMessage.value = 'Код отправлен повторно';
  } catch (e) {
    error.value = formatApiError(e);
  }
}
</script>

<style scoped lang="scss">
@use 'auth' as *;
</style>
