<template>
  <div class="page-content auth-page">
    <div class="auth-page__card">
      <h1>Вход</h1>
      <form class="auth-page__form" @submit.prevent="submit">
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
          autocomplete="current-password"
        />
        <AppAlert v-if="error" :message="error" />
        <AppButton type="submit" block :loading="loading">Войти</AppButton>
      </form>
      <p class="auth-page__footer">
        <NuxtLink to="/reset-password">Забыли пароль?</NuxtLink>
      </p>
      <p class="auth-page__footer">
        Нет аккаунта?
        <NuxtLink to="/register">Зарегистрироваться</NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { User } from '~/types';

useHead({ title: 'Вход — Яринг' });

const route = useRoute();
const auth = useAuthStore();
const { request, formatApiError } = useApi();

const phone = ref('');
const password = ref('');
const error = ref<string | null>(null);
const loading = ref(false);

async function submit() {
  loading.value = true;
  error.value = null;
  try {
    const data = await request<{ accessToken: string; refreshToken: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ phone: phone.value, password: password.value }),
    });
    auth.setSession(data.accessToken, data.user, data.refreshToken);
    const redirect = (route.query.redirect as string) || '/profile';
    await navigateTo(redirect);
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
