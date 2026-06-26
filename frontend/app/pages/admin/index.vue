<template>
  <div class="dashboard">
    <h2 class="dashboard__title">Дашборд</h2>

    <div class="dashboard__cards">
      <NuxtLink to="/admin/entities" class="stat-card">
        <span class="stat-card__icon"><House :size="24" /></span>
        <span class="stat-card__body">
          <span class="stat-card__name">Объекты</span>
          <span class="stat-card__sub">{{ entityCount }} активных</span>
        </span>
      </NuxtLink>
      <NuxtLink to="/admin/bookings" class="stat-card">
        <span class="stat-card__icon"><CalendarCheck :size="24" /></span>
        <span class="stat-card__body">
          <span class="stat-card__name">Брони</span>
          <span class="stat-card__sub">{{ bookingCount }} всего</span>
        </span>
      </NuxtLink>
      <NuxtLink to="/admin/pages" class="stat-card">
        <span class="stat-card__icon"><FileText :size="24" /></span>
        <span class="stat-card__body">
          <span class="stat-card__name">Страницы</span>
          <span class="stat-card__sub">3 страницы</span>
        </span>
      </NuxtLink>
    </div>

    <div class="panel">
      <div class="panel__head">
        <span class="panel__title">Последние бронирования</span>
        <NuxtLink to="/admin/bookings" class="panel__link">Все брони →</NuxtLink>
      </div>
      <div v-if="loading" class="panel__skeleton">
        <AppSkeleton v-for="n in 3" :key="n" height="40px" />
      </div>
      <p v-else-if="!recent.length" class="panel__empty">Броней пока нет</p>
      <div v-else class="panel__list">
        <div v-for="b in recent" :key="b.id" class="panel__row">
          <span class="panel__name">{{ b.entityName }}</span>
          <span class="panel__total">{{ b.totalPrice.toLocaleString('ru-RU') }} ₽</span>
          <span class="status-badge" :class="`status-badge--${b.status}`">{{ statusLabel(b.status) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { House, CalendarCheck, FileText } from 'lucide-vue-next';
import type { Booking, BookableEntity } from '~/types';
import { BOOKING_STATUS_LABELS } from '~/utils/calendar';

definePageMeta({ layout: 'admin', middleware: 'admin' });
useHead({ title: 'Админка — Яринг' });

const { request } = useApi();
const bookings = ref<Booking[]>([]);
const entities = ref<BookableEntity[]>([]);
const loading = ref(true);

const entityCount = computed(() => entities.value.filter((e) => e.isActive).length);
const bookingCount = computed(() => bookings.value.length);
const recent = computed(() => bookings.value.slice(0, 5));

function statusLabel(status: string) {
  return BOOKING_STATUS_LABELS[status] ?? status;
}

onMounted(async () => {
  loading.value = true;
  try {
    [bookings.value, entities.value] = await Promise.all([
      request<Booking[]>('/bookings'),
      request<BookableEntity[]>('/entities?all=true'),
    ]);
  } catch {
    bookings.value = [];
    entities.value = [];
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped lang="scss">
.dashboard {
  display: flex;
  flex-direction: column;
  gap: $space-5;

  &__title {
    margin: 0;
    font-size: var(--font-2xl);
  }

  &__cards {
    display: grid;
    gap: $space-4;

    @include sm {
      grid-template-columns: repeat(3, 1fr);
    }
  }
}

.stat-card {
  display: flex;
  align-items: center;
  gap: $space-4;
  padding: $space-5;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  text-decoration: none;
  color: var(--color-text);
  transition: border-color $transition;

  &:hover {
    border-color: var(--color-primary);
    text-decoration: none;
  }

  &__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    flex: none;
    border-radius: 13px;
    background: var(--color-primary-tint);
    color: var(--color-primary);
  }

  &__body {
    display: flex;
    flex-direction: column;
  }

  &__name {
    font-size: var(--font-lg);
    font-weight: 700;
  }

  &__sub {
    font-size: $font-size-sm;
    color: var(--color-text-muted);
  }
}

.panel {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;

  &__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: $space-4 $space-5;
    border-bottom: 1px solid var(--color-border);
  }

  &__title {
    font-size: var(--font-lg);
    font-weight: 700;
  }

  &__link {
    font-size: $font-size-sm;
    font-weight: 600;
    color: var(--color-primary);
    text-decoration: none;
  }

  &__list {
    display: flex;
    flex-direction: column;
  }

  &__row {
    display: flex;
    align-items: center;
    gap: $space-3;
    padding: $space-3 $space-5;
    border-bottom: 1px solid var(--color-border);

    &:last-child {
      border-bottom: none;
    }
  }

  &__name {
    flex: 1;
    min-width: 0;
    font-size: $font-size-sm;
    font-weight: 700;
  }

  &__total {
    font-size: $font-size-sm;
    color: var(--color-text-secondary);
  }

  &__skeleton {
    display: flex;
    flex-direction: column;
    gap: $space-2;
    padding: $space-4 $space-5;
  }

  &__empty {
    margin: 0;
    padding: $space-5;
    color: var(--color-text-muted);
  }
}

.status-badge {
  @include status-badge;
}
</style>
