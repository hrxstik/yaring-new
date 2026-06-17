<template>
  <article v-if="page" class="content-page">
    <h1>{{ page.title }}</h1>
    <div class="prose" v-html="page.body" />
  </article>
  <ContentPageSkeleton v-else-if="loading" />
  <AppAlert
    v-else
    :title="error ? 'Не удалось загрузить страницу' : 'Страница не найдена'"
    :message="error ?? 'Попробуйте обновить страницу или вернитесь позже.'"
  >
    <template v-if="error" #actions>
      <AppButton size="sm" @click="load">Повторить</AppButton>
    </template>
  </AppAlert>
</template>

<script setup lang="ts">
import type { ContentPage } from '~/types';

const props = defineProps<{ slug: string }>();

const { request, formatApiError } = useApi();
const page = ref<ContentPage | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);

onMounted(load);

async function load() {
  loading.value = true;
  error.value = null;
  try {
    page.value = await request<ContentPage>(`/pages/${props.slug}`);
  } catch (e) {
    page.value = null;
    error.value = formatApiError(e);
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped lang="scss">
.content-page {
  max-width: 800px;
}
</style>
