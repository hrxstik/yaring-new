<template>
  <div class="page-content profile-page">
    <div class="profile-page__header">
      <div>
        <h1>Личный кабинет</h1>
        <p v-if="auth.user" class="profile-page__user">
          {{ auth.user.name }} · {{ auth.user.phone }}
        </p>
      </div>
      <AppButton variant="secondary" size="sm" @click="logout">Выйти</AppButton>
    </div>

    <p v-if="route.query.booked" class="profile-page__success">
      Бронирование успешно оплачено!
    </p>

    <section class="profile-page__section">
      <h2>Мои бронирования</h2>

      <div v-if="loading" class="profile-page__skeletons">
        <div v-for="n in 2" :key="n" class="profile-page__skeleton-item">
          <AppSkeleton variant="title" width="40%" />
          <AppSkeleton width="60%" />
          <AppSkeleton width="30%" height="12px" />
        </div>
      </div>

      <AppAlert
        v-else-if="loadError"
        title="Не удалось загрузить брони"
        :message="loadError"
      >
        <template #actions>
          <AppButton size="sm" @click="loadBookings">Повторить</AppButton>
        </template>
      </AppAlert>

      <p v-else-if="!bookings.length" class="profile-page__empty">
        У вас пока нет бронирований.
        <NuxtLink to="/booking">Забронировать</NuxtLink>
      </p>
      <div v-else class="profile-page__list">
        <article v-for="booking in bookings" :key="booking.id" class="booking-item">
          <div>
            <h3>{{ booking.entityName }}</h3>
            <p class="booking-item__dates">
              <template v-if="booking.bookingType === 'hourly'">
                {{ formatDateRu(booking.startDate) }} ·
                {{ booking.startTime }} — {{ booking.endTime }}
              </template>
              <template v-else>
                {{ formatRange(booking.startDate, booking.endDate) }}
              </template>
            </p>
            <span class="booking-item__status">{{ statusLabel(booking.status) }}</span>
          </div>
          <div class="booking-item__side">
            <strong>{{ booking.totalPrice.toLocaleString('ru-RU') }} ₽</strong>
            <AppButton
              v-if="booking.status === 'confirmed'"
              size="sm"
              variant="ghost"
              @click="cancelBooking(booking.id)"
            >
              Отменить
            </AppButton>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { Booking } from '~/types';
import { formatRange, formatDateRu, BOOKING_STATUS_LABELS } from '~/utils/calendar';

useHead({ title: 'Личный кабинет — Яринг' });

const auth = useAuthStore();
const route = useRoute();
const { request, formatApiError } = useApi();

const bookings = ref<Booking[]>([]);
const loading = ref(true);
const loadError = ref<string | null>(null);

onMounted(async () => {
  if (!auth.isLoggedIn) {
    await navigateTo('/login?redirect=/profile');
    return;
  }
  await loadBookings();
});

async function loadBookings() {
  loading.value = true;
  loadError.value = null;
  try {
    bookings.value = await request<Booking[]>('/bookings/my');
  } catch (e) {
    bookings.value = [];
    loadError.value = formatApiError(e);
  } finally {
    loading.value = false;
  }
}

function statusLabel(status: string) {
  return BOOKING_STATUS_LABELS[status] ?? status;
}

function logout() {
  auth.logout();
  navigateTo('/');
}

async function cancelBooking(id: string) {
  try {
    await request(`/bookings/${id}/cancel`, { method: 'POST' });
    await loadBookings();
  } catch {
    /* ignore */
  }
}
</script>

<style scoped lang="scss">
.profile-page {
  &__header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: $space-4;
    margin-bottom: $space-6;
  }

  &__user {
    color: var(--color-text-secondary);
    margin: 0;
  }

  &__success {
    padding: $space-4;
    background: rgba(61, 107, 79, 0.15);
    color: var(--color-primary);
    border-radius: $radius-md;
    margin-bottom: $space-6;
  }

  &__section {
    @include card;
  }

  &__empty {
    color: var(--color-text-muted);
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: $space-4;
    margin-top: $space-4;
  }

  &__skeletons {
    display: flex;
    flex-direction: column;
    gap: $space-4;
    margin-top: $space-4;
  }

  &__skeleton-item {
    padding: $space-4;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    display: flex;
    flex-direction: column;
    gap: $space-3;
  }
}

.booking-item {
  display: flex;
  justify-content: space-between;
  gap: $space-4;
  padding: $space-4;
  border: 1px solid var(--color-border);
  border-radius: $radius-md;

  h3 {
    margin-bottom: $space-2;
    font-size: $font-size-base;
  }

  &__dates {
    font-size: $font-size-sm;
    color: var(--color-text-secondary);
    margin: 0 0 $space-2;
  }

  &__status {
    font-size: $font-size-xs;
    padding: $space-1 $space-2;
    background: var(--color-surface-elevated);
    border-radius: $radius-full;
    color: var(--color-text-secondary);
  }

  &__side {
    text-align: right;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: $space-2;
  }
}
</style>
