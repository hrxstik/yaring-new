<template>
  <div class="page-content auth-page">
    <div class="auth-page__card">
      <h1>Вход</h1>
      <form class="auth-page__form" @submit.prevent="submit">
        <AppInput v-model="email" label="Email" type="email" autocomplete="email" />
        <AppInput
          v-model="password"
          label="Пароль"
          type="password"
          autocomplete="current-password"
        />
        <p v-if="error" class="auth-page__error">{{ error }}</p>
        <AppButton type="submit" block :loading="loading">Войти</AppButton>
      </form>
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
const { request } = useApi();

const email = ref('');
const password = ref('');
const error = ref<string | null>(null);
const loading = ref(false);

async function submit() {
  loading.value = true;
  error.value = null;
  try {
    const data = await request<{ accessToken: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: email.value, password: password.value }),
    });
    auth.setSession(data.accessToken, data.user);
    const redirect = (route.query.redirect as string) || '/profile';
    await navigateTo(redirect);
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Ошибка входа';
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped lang="scss">
.auth-page {
  display: flex;
  justify-content: center;
  align-items: flex-start;
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
