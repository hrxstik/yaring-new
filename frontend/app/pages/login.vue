<template>
  <div class="auth">
    <div class="auth__card">
      <div class="auth__head">
        <span class="auth__logo"><Trees :size="26" /></span>
        <h1 class="auth__title">Вход</h1>
        <p class="auth__subtitle">Рады видеть вас снова в «Яринг»</p>
      </div>

      <form class="auth__form" @submit.prevent="submit">
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
        <NuxtLink to="/reset-password" class="auth__forgot">Забыли пароль?</NuxtLink>
        <AppAlert v-if="error" variant="error" :message="error" />
        <AppButton type="submit" size="lg" block :loading="loading">Войти</AppButton>
      </form>

      <p class="auth__footer">
        Нет аккаунта?
        <NuxtLink to="/register">Зарегистрироваться</NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Trees } from 'lucide-vue-next';
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
@use 'auth' as *;
</style>
