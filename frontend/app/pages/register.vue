<template>
  <div class="page-content auth-page">
    <div class="auth-page__card">
      <h1>{{ step === 'register' ? 'Регистрация' : 'Подтверждение email' }}</h1>

      <form v-if="step === 'register'" class="auth-page__form" @submit.prevent="register">
        <AppInput v-model="name" label="Имя" autocomplete="name" />
        <AppInput v-model="email" label="Email" type="email" autocomplete="email" />
        <AppInput
          v-model="password"
          label="Пароль"
          type="password"
          autocomplete="new-password"
        />
        <p v-if="error" class="auth-page__error">{{ error }}</p>
        <AppButton type="submit" block :loading="loading">Зарегистрироваться</AppButton>
      </form>

      <form v-else class="auth-page__form" @submit.prevent="verify">
        <p class="auth-page__hint">Код отправлен на {{ email }}</p>
        <AppInput v-model="code" label="Код из письма" maxlength="6" />
        <p v-if="error" class="auth-page__error">{{ error }}</p>
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
const { request } = useApi();

const step = ref<'register' | 'verify'>('register');
const name = ref('');
const email = ref('');
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
        email: email.value,
        password: password.value,
      }),
    });
    step.value = 'verify';
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Ошибка регистрации';
  } finally {
    loading.value = false;
  }
}

async function verify() {
  loading.value = true;
  error.value = null;
  try {
    const data = await request<{ accessToken: string; user: User }>(
      '/auth/verify-email',
      {
        method: 'POST',
        body: JSON.stringify({ email: email.value, code: code.value }),
      },
    );
    auth.setSession(data.accessToken, data.user);
    await navigateTo('/profile');
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Неверный код';
  } finally {
    loading.value = false;
  }
}

async function resend() {
  try {
    await request('/auth/resend-code', {
      method: 'POST',
      body: JSON.stringify({ email: email.value }),
    });
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Ошибка отправки';
  }
}
</script>

<style scoped lang="scss">
.auth-page {
  display: flex;
  justify-content: center;
  padding-top: $space-10;

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
