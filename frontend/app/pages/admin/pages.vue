<template>
  <div class="admin-pages">
    <h2 class="admin-pages__title">Страницы</h2>

    <nav class="admin-pages__tabs">
      <button
        v-for="slug in pageSlugs"
        :key="slug"
        type="button"
        class="admin-pages__tab"
        :class="{ 'admin-pages__tab--active': slug === activeSlug }"
        @click="selectPage(slug)"
      >
        {{ slugLabels[slug] }}
      </button>
    </nav>

    <form v-if="page" class="admin-pages__form" @submit.prevent="save">
      <AppInput v-model="page.title" label="Заголовок" />
      <label class="field">
        <span class="field__label">HTML-содержимое</span>
        <textarea v-model="page.body" rows="14" class="field__code" />
      </label>
      <AppAlert v-if="message" :variant="message === 'Сохранено' ? 'success' : 'error'" :message="message" />
      <div class="admin-pages__actions">
        <AppButton type="submit" :loading="saving">Сохранить</AppButton>
      </div>
    </form>
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
.admin-pages {
  display: flex;
  flex-direction: column;
  gap: $space-4;

  &__title {
    margin: 0;
    font-size: var(--font-2xl);
  }

  &__tabs {
    display: flex;
    gap: $space-2;
    flex-wrap: wrap;
  }

  &__tab {
    padding: $space-2 - 1px $space-4;
    border: none;
    border-radius: $radius-full;
    background: transparent;
    color: var(--color-text-secondary);
    font-family: inherit;
    font-size: $font-size-sm;
    font-weight: 500;
    cursor: pointer;

    &--active {
      background: var(--color-primary);
      color: var(--color-primary-contrast);
      font-weight: 600;
    }
  }

  &__form {
    display: flex;
    flex-direction: column;
    gap: $space-4;
    max-width: 760px;
  }

  &__actions {
    display: flex;
    gap: $space-3;
  }
}

.field {
  display: flex;
  flex-direction: column;
  gap: $space-1 + 2px;

  &__label {
    font-size: $font-size-sm;
    font-weight: 500;
    color: var(--color-text-secondary);
  }

  &__code {
    padding: $space-3 $space-3 + 2px;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-surface-elevated);
    color: var(--color-text);
    font-family: monospace;
    font-size: $font-size-sm;
    line-height: 1.5;
    outline: none;
    resize: vertical;

    &:focus {
      border-color: var(--color-primary);
      box-shadow: 0 0 0 3px var(--color-primary-tint);
    }
  }
}
</style>
