<template>
  <article v-if="page" class="content-page">
    <h1>{{ page.title }}</h1>
    <div class="prose" v-html="page.body" />
  </article>
  <p v-else-if="loading">Загрузка…</p>
  <p v-else class="content-page__error">{{ error ?? 'Страница не найдена' }}</p>
</template>

<script setup lang="ts">
import type { ContentPage } from '~/types';

const props = defineProps<{ slug: string }>();

const { request } = useApi();
const page = ref<ContentPage | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);

onMounted(async () => {
  try {
    page.value = await request<ContentPage>(`/pages/${props.slug}`);
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Ошибка загрузки';
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped lang="scss">
.content-page {
  max-width: 800px;

  &__error {
    color: var(--color-text-muted);
  }
}
</style>
