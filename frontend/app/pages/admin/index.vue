<template>
  <div>
    <h1>Админ-панель</h1>
    <p class="admin-home__desc">Управление объектами, бронированиями и контентом сайта.</p>
    <div class="admin-home__grid">
      <NuxtLink to="/admin/entities" class="admin-home__card">
        <Building2 :size="32" />
        <span>Объекты</span>
      </NuxtLink>
      <NuxtLink to="/admin/bookings" class="admin-home__card">
        <Calendar :size="32" />
        <span>Брони</span>
      </NuxtLink>
      <NuxtLink to="/admin/pages" class="admin-home__card">
        <FileText :size="32" />
        <span>Страницы</span>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Building2, Calendar, FileText } from 'lucide-vue-next';

definePageMeta({ layout: 'admin', middleware: 'admin' });
useHead({ title: 'Админка — Яринг' });
</script>

<style scoped lang="scss">
.admin-home {
  &__desc {
    color: var(--color-text-secondary);
    margin-bottom: $space-6;
  }

  &__grid {
    display: grid;
    gap: $space-4;

    @include sm {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  &__card {
    @include card;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: $space-3;
    text-decoration: none;
    color: var(--color-text);
    transition: border-color $transition;

    &:hover {
      border-color: var(--color-primary);
      text-decoration: none;
    }

    svg {
      color: var(--color-primary);
    }
  }
}
</style>
