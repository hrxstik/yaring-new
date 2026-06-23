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

    <AppAlert
      v-if="route.query.booked"
      variant="success"
      message="Бронирование успешно оплачено!"
    />

    <AppAlert v-if="actionError" :message="actionError" class="profile-page__action-error" />

    <section class="profile-page__section">
      <h2>Профиль</h2>
      <form class="profile-page__edit-form" @submit.prevent="saveProfile">
        <AppInput v-model="editName" label="Имя" :disabled="savingProfile" />
        <div class="profile-page__edit-actions">
          <AppButton type="submit" size="sm" :loading="savingProfile">Сохранить</AppButton>
        </div>
        <AppAlert v-if="profileError" :message="profileError" />
        <AppAlert v-if="profileSuccess" variant="success" message="Имя обновлено" />
      </form>
    </section>

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
            <span class="booking-item__status" :class="`booking-item__status--${booking.status}`">
              {{ statusLabel(booking.status) }}
            </span>
          </div>
          <div class="booking-item__side">
            <strong>{{ booking.totalPrice.toLocaleString('ru-RU') }} ₽</strong>
            <AppButton
              v-if="booking.status === 'pending_payment'"
              size="sm"
              :loading="payingId === booking.id"
              @click="payBooking(booking)"
            >
              Оплатить
            </AppButton>
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

definePageMeta({ middleware: 'auth' });

useHead({ title: 'Личный кабинет — Яринг' });

const auth = useAuthStore();
const route = useRoute();
const { request, formatApiError } = useApi();

const bookings = ref<Booking[]>([]);
const loading = ref(true);
const loadError = ref<string | null>(null);
const actionError = ref<string | null>(null);
const payingId = ref<string | null>(null);

const editName = ref(auth.user?.name ?? '');
const savingProfile = ref(false);
const profileError = ref<string | null>(null);
const profileSuccess = ref(false);

watch(() => auth.user?.name, (name) => {
  if (name && !editName.value) editName.value = name;
}, { immediate: true });

async function saveProfile() {
  savingProfile.value = true;
  profileError.value = null;
  profileSuccess.value = false;
  try {
    const updated = await request<{ name: string }>('/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify({ name: editName.value.trim() }),
    });
    if (auth.user) auth.user.name = updated.name;
    profileSuccess.value = true;
    setTimeout(() => { profileSuccess.value = false; }, 3000);
  } catch (e) {
    profileError.value = formatApiError(e);
  } finally {
    savingProfile.value = false;
  }
}

onMounted(async () => {
  await completeMockPaymentFromQuery();
  await loadBookings();
});

async function completeMockPaymentFromQuery() {
  const paymentId = route.query.paymentId;
  if (route.query.payment !== 'mock' || typeof paymentId !== 'string') return;

  try {
    await request(`/payments/${paymentId}/mock-complete`, { method: 'POST' });
    await navigateTo('/profile?booked=1', { replace: true });
  } catch (e) {
    actionError.value = formatApiError(e);
  }
}

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

async function logout() {
  try {
    if (auth.user && auth.refreshToken) {
      await request('/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ userId: auth.user.id, refreshToken: auth.refreshToken }),
      });
    }
  } catch { /* proceed with local logout regardless */ }
  auth.logout();
  await navigateTo('/');
}

async function payBooking(booking: Booking) {
  payingId.value = booking.id;
  actionError.value = null;

  try {
    const payment = await request<{ confirmationUrl?: string; paymentId: string }>(
      '/payments',
      {
        method: 'POST',
        body: JSON.stringify({
          bookingId: booking.id,
          amount: booking.totalPrice,
          description: `Бронирование: ${booking.entityName}`,
        }),
      },
    );

    if (payment.confirmationUrl?.includes('payment=mock')) {
      await request(`/payments/${payment.paymentId}/mock-complete`, { method: 'POST' });
      await loadBookings();
      return;
    }

    if (payment.confirmationUrl) {
      window.location.href = payment.confirmationUrl;
    }
  } catch (e) {
    actionError.value = formatApiError(e);
  } finally {
    payingId.value = null;
  }
}

async function cancelBooking(id: string) {
  if (!confirm('Отменить бронирование?\nВозврат рассчитывается по политике отмены.')) return;

  actionError.value = null;
  try {
    const result = await request<{ refundAmount: number; message: string }>(
      `/bookings/${id}/cancel-refund`,
      { method: 'POST' },
    );
    await loadBookings();
    if (result.refundAmount > 0) {
      alert(result.message);
    }
  } catch (e) {
    actionError.value = formatApiError(e);
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

  &__action-error {
    margin-bottom: $space-4;
  }

  &__section {
    @include card;
    margin-bottom: $space-5;
  }

  &__edit-form {
    display: flex;
    flex-direction: column;
    gap: $space-4;
    max-width: 380px;
    margin-top: $space-4;
  }

  &__edit-actions {
    display: flex;
    gap: $space-3;
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

    &--confirmed {
      background: rgba(61, 107, 79, 0.12);
      color: var(--color-primary);
    }

    &--cancelled {
      background: rgba(192, 57, 43, 0.1);
      color: #c0392b;
    }

    &--completed {
      background: rgba(41, 128, 185, 0.1);
      color: #2980b9;
    }
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
