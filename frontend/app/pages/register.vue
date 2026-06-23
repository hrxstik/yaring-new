<template>
  <div class="page-content auth-page">
    <div class="auth-page__card">
      <h1>{{ step === 'register' ? 'Регистрация' : 'Подтверждение телефона' }}</h1>

      <form v-if="step === 'register'" class="auth-page__form" @submit.prevent="register">
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
        <AppAlert v-if="error" :message="error" />
        <AppButton type="submit" block :loading="loading">Зарегистрироваться</AppButton>
      </form>

      <form v-else class="auth-page__form" @submit.prevent="verify">
        <p class="auth-page__hint">Код отправлен на {{ phone }}</p>
        <AppInput v-model="code" label="Код из SMS" maxlength="6" />
        <AppAlert v-if="error" :message="error" />
        <AppAlert v-if="resendMessage" variant="success" :message="resendMessage" />
        <AppButton type="submit" block :loading="loading">Подтвердить</AppButton>
        <AppButton type="button" variant="ghost" block @click="resend">
          Отправить код повторно
        </AppButton>
      </form>

      <p class="auth-page__footer">
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

  &__error {
    color: #c0392b;
    font-size: $font-size-sm;
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
