<template>
  <div>
    <h1>Страницы сайта</h1>
    <div class="pages-admin">
      <nav class="pages-admin__nav">
        <button
          v-for="slug in pageSlugs"
          :key="slug"
          type="button"
          :class="{ 'pages-admin__nav-item--active': slug === activeSlug }"
          @click="selectPage(slug)"
        >
          {{ slugLabels[slug] }}
        </button>
      </nav>
      <form v-if="page" class="pages-admin__form" @submit.prevent="save">
        <AppInput v-model="page.title" label="Заголовок" />
        <label class="pages-admin__field">
          <span>Содержимое (HTML)</span>
          <textarea v-model="page.body" rows="16" />
        </label>
        <p v-if="message" class="pages-admin__message">{{ message }}</p>
        <AppButton type="submit" :loading="saving">Сохранить</AppButton>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ContentPage } from '~/types';

definePageMeta({ layout: 'admin', middleware: 'admin' });
useHead({ title: 'Страницы — Админка' });

const { request, formatApiError } = useApi();

const pageSlugs = ['contacts', 'rules', 'privacy'] as const;
const slugLabels: Record<string, string> = {
  contacts: 'Контакты',
  rules: 'Правила',
  privacy: 'Политика',
};

const activeSlug = ref<(typeof pageSlugs)[number]>('contacts');
const page = ref<ContentPage | null>(null);
const saving = ref(false);
const message = ref<string | null>(null);

onMounted(() => selectPage('contacts'));

async function selectPage(slug: (typeof pageSlugs)[number]) {
  activeSlug.value = slug;
  message.value = null;
  page.value = await request<ContentPage>(`/pages/${slug}`);
}

async function save() {
  if (!page.value) return;
  saving.value = true;
  message.value = null;
  try {
    page.value = await request<ContentPage>(`/pages/${activeSlug.value}`, {
      method: 'PUT',
      body: JSON.stringify({
        title: page.value.title,
        body: page.value.body,
      }),
    });
    message.value = 'Сохранено';
  } catch (e) {
    message.value = formatApiError(e);
  } finally {
    saving.value = false;
  }
}
</script>

<style scoped lang="scss">
.pages-admin {
  display: grid;
  gap: $space-6;
  margin-top: $space-6;

  @include md {
    grid-template-columns: 200px 1fr;
  }

  &__nav {
    display: flex;
    flex-direction: column;
    gap: $space-2;
  }

  &__nav-item--active,
  button {
    padding: $space-3 $space-4;
    border: 1px solid var(--color-border);
    border-radius: $radius-md;
    background: var(--color-surface);
    color: var(--color-text);
    cursor: pointer;
    text-align: left;
  }

  &__nav-item--active {
    border-color: var(--color-primary);
    color: var(--color-primary);
  }

  &__form {
    @include card;
    display: flex;
    flex-direction: column;
    gap: $space-4;
  }

  &__field {
    display: flex;
    flex-direction: column;
    gap: $space-2;
    font-size: $font-size-sm;
    color: var(--color-text-secondary);

    textarea {
      padding: $space-3;
      border: 1px solid var(--color-border);
      border-radius: $radius-md;
      background: var(--color-surface);
      color: var(--color-text);
      font-family: monospace;
      font-size: $font-size-sm;
    }
  }

  &__message {
    color: var(--color-primary);
    margin: 0;
  }
}
</style>
