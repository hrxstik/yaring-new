<template>
  <div class="page-content profile-page">
    <nav class="breadcrumb">
      <NuxtLink to="/">Главная</NuxtLink>
      <ChevronRight :size="14" />
      <span>Личный кабинет</span>
    </nav>

    <div class="profile-page__header">
      <div class="profile-page__id">
        <h1>{{ auth.user?.name || 'Личный кабинет' }}</h1>
        <span v-if="auth.user" class="profile-page__phone">{{ auth.user.phone }}</span>
      </div>
      <AppButton variant="ghost" size="md" @click="logout">
        <LogOut :size="16" />Выйти
      </AppButton>
    </div>

    <AppAlert
      v-if="route.query.booked"
      variant="success"
      message="Бронирование успешно оплачено!"
    />
    <AppAlert v-if="actionError" variant="error" :message="actionError" />

    <section class="card">
      <h3 class="card__title">Профиль</h3>
      <AppAlert v-if="profileSuccess" variant="success" title="Изменения сохранены" />
      <AppAlert v-if="profileError" variant="error" :message="profileError" />
      <form class="profile-page__edit" @submit.prevent="saveProfile">
        <AppInput v-model="editName" label="Имя" :disabled="savingProfile" />
        <AppButton type="submit" :loading="savingProfile">Сохранить</AppButton>
      </form>
    </section>

    <section class="card">
      <h3 class="card__title">Мои бронирования</h3>

      <div v-if="loading" class="profile-page__list">
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

      <div v-else-if="!bookings.length" class="empty">
        <span class="empty__icon"><CalendarX :size="40" /></span>
        <div class="empty__text">
          <h4>Пока нет бронирований</h4>
          <p>Выберите домик, баню или беседку и забронируйте отдых.</p>
        </div>
        <AppButton size="lg" @click="navigateTo('/booking')">Забронировать</AppButton>
      </div>

      <div v-else class="profile-page__list">
        <article v-for="booking in bookings" :key="booking.id" class="booking-item">
          <div class="booking-item__info">
            <span class="booking-item__name">{{ booking.entityName }}</span>
            <span class="booking-item__dates">
              <template v-if="booking.bookingType === 'hourly'">
                {{ formatDateRu(booking.startDate) }} · {{ booking.startTime }} — {{ booking.endTime }}
              </template>
              <template v-else>
                {{ formatRange(booking.startDate, booking.endDate) }}
              </template>
            </span>
            <span class="status-badge" :class="`status-badge--${booking.status}`">
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
import { ChevronRight, LogOut, CalendarX } from 'lucide-vue-next';
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
.breadcrumb {
  display: flex;
  align-items: center;
  gap: $space-1 + 2px;
  font-size: $font-size-sm;
  color: var(--color-text-muted);
  margin-bottom: $space-4;

  a {
    color: var(--color-text-secondary);
    text-decoration: none;

    &:hover {
      color: var(--color-primary);
    }
  }

  span {
    color: var(--color-text);
    font-weight: 600;
  }
}

.profile-page {
  max-width: 860px;
  margin-inline: auto;
  display: flex;
  flex-direction: column;
  gap: $space-5;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: $space-4;

    h1 {
      margin: 0;
      font-size: var(--font-2xl);
    }
  }

  &__id {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  &__phone {
    font-size: var(--font-sm);
    color: var(--color-text-secondary);
  }

  &__edit {
    display: flex;
    flex-direction: column;
    gap: $space-3;

    @include sm {
      flex-direction: row;
      align-items: flex-end;

      :deep(.field) {
        flex: 1;
      }
    }
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: $space-3;
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

.card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: $space-5;
  display: flex;
  flex-direction: column;
  gap: $space-4;

  &__title {
    margin: 0;
    font-size: var(--font-lg);
    font-weight: 700;
  }
}

.status-badge {
  @include status-badge;
}

.booking-item {
  display: flex;
  flex-direction: column;
  gap: $space-3;
  padding: $space-4;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);

  @include sm {
    flex-direction: row;
    align-items: center;
  }

  &__info {
    display: flex;
    flex-direction: column;
    gap: $space-2 - 1px;
    flex: 1;
    min-width: 0;
  }

  &__name {
    font-size: var(--font-base);
    font-weight: 700;
  }

  &__dates {
    font-size: $font-size-sm;
    color: var(--color-text-secondary);
  }

  &__side {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: $space-3;
    padding-top: $space-3;
    border-top: 1px solid var(--color-border);

    strong {
      font-size: var(--font-lg);
      font-weight: 800;
    }

    @include sm {
      flex-direction: column;
      align-items: flex-end;
      padding-top: 0;
      border-top: none;
    }
  }
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $space-4;
  padding: $space-6 $space-4;
  text-align: center;

  &__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 88px;
    height: 88px;
    border-radius: var(--radius-xl);
    background: var(--color-surface-elevated);
    color: var(--color-text-muted);
  }

  &__text {
    display: flex;
    flex-direction: column;
    gap: $space-1 + 2px;

    h4 {
      margin: 0;
      font-size: var(--font-lg);
      font-weight: 700;
    }

    p {
      margin: 0;
      max-width: 260px;
      font-size: var(--font-sm);
      color: var(--color-text-secondary);
    }
  }
}
</style>
