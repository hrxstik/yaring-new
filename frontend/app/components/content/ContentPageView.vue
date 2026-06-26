<template>
  <article v-if="page" class="content-page">
    <h1 v-if="!embedded">{{ page.title }}</h1>
    <div class="prose" v-html="safeBody" />
  </article>
  <ContentPageSkeleton v-else-if="loading && !embedded" />
  <AppAlert
    v-else-if="!embedded"
    :title="error ? 'Не удалось загрузить страницу' : 'Страница не найдена'"
    :message="error ?? 'Попробуйте обновить страницу или вернитесь позже.'"
  >
    <template v-if="error" #actions>
      <AppButton size="sm" @click="load">Повторить</AppButton>
    </template>
  </AppAlert>
</template>

<script setup lang="ts">
import DOMPurify from 'isomorphic-dompurify';
import type { ContentPage } from '~/types';

const props = defineProps<{ slug: string; embedded?: boolean }>();

const { request, formatApiError } = useApi();

const safeBody = computed(() =>
  page.value ? DOMPurify.sanitize(page.value.body) : '',
);
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
  max-width: 760px;

  h1 {
    margin-bottom: $space-5;
  }
}
</style>
