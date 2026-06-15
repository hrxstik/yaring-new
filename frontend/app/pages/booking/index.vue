<template>
  <div class="page-content booking-page">
    <h1>Бронирование</h1>
    <p class="booking-page__hint">
      Выберите объект и укажите даты. Бронирование доступно после входа в аккаунт.
    </p>

    <div v-if="loading" class="booking-page__loading">Загрузка объектов…</div>

    <div v-else class="booking-page__grid">
      <EntityCard
        v-for="entity in entities"
        :key="entity.id"
        :entity="entity"
        @book="openBooking"
      />
    </div>

    <BookingCalendarDrawer
      :open="drawerOpen"
      :booking-type="selectedEntity?.bookingType ?? 'daily'"
      :availability="availability"
      :initial-start="selection.startDate"
      :initial-end="selection.endDate"
      :initial-start-time="selection.startTime"
      :initial-end-time="selection.endTime"
      @close="drawerOpen = false"
      @apply="onSelectionApply"
    />

    <AppDrawer
      :open="confirmOpen"
      title="Подтверждение"
      @close="confirmOpen = false"
    >
      <div v-if="selectedEntity" class="booking-confirm">
        <h3>{{ selectedEntity.name }}</h3>
        <p>{{ summaryText }}</p>
        <p class="booking-confirm__price">
          Итого: <strong>{{ estimatedPrice.toLocaleString('ru-RU') }} ₽</strong>
        </p>
        <p v-if="error" class="booking-confirm__error">{{ error }}</p>
      </div>
      <template #footer>
        <div class="booking-confirm__actions">
          <AppButton variant="secondary" @click="confirmOpen = false">Назад</AppButton>
          <AppButton :loading="submitting" @click="submitBooking">
            {{ auth.isLoggedIn ? 'Оплатить' : 'Войти и оплатить' }}
          </AppButton>
        </div>
      </template>
    </AppDrawer>
  </div>
</template>

<script setup lang="ts">
import type { BookableEntity, Availability, Booking } from '~/types';
import { formatRange, formatTimeRange } from '~/utils/calendar';

useHead({ title: 'Бронирование — Яринг' });

const auth = useAuthStore();
const { request } = useApi();

const entities = ref<BookableEntity[]>([]);
const loading = ref(true);
const drawerOpen = ref(false);
const confirmOpen = ref(false);
const selectedEntity = ref<BookableEntity | null>(null);
const availability = ref<Availability | undefined>();
const submitting = ref(false);
const error = ref<string | null>(null);

const selection = reactive({
  startDate: undefined as string | undefined,
  endDate: undefined as string | undefined,
  startTime: undefined as string | undefined,
  endTime: undefined as string | undefined,
});

onMounted(async () => {
  try {
    entities.value = await request<BookableEntity[]>('/entities');
  } finally {
    loading.value = false;
  }
});

const summaryText = computed(() => {
  if (!selectedEntity.value) return '';
  if (selectedEntity.value.bookingType === 'hourly') {
    return `${formatRange(selection.startDate, selection.startDate)} · ${formatTimeRange(selection.startTime, selection.endTime)}`;
  }
  return formatRange(selection.startDate, selection.endDate);
});

const estimatedPrice = computed(() => {
  const e = selectedEntity.value;
  if (!e || !selection.startDate) return 0;
  if (e.bookingType === 'hourly' && selection.startTime && selection.endTime) {
    const [sh, sm] = selection.startTime.split(':').map(Number);
    const [eh, em] = selection.endTime.split(':').map(Number);
    const hours = (eh * 60 + em - (sh * 60 + sm)) / 60;
    return hours * (e.pricePerHour ?? 0);
  }
  if (!selection.endDate) return e.pricePerDay;
  const start = new Date(selection.startDate);
  const end = new Date(selection.endDate);
  const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / 86400000) + 1);
  return days * e.pricePerDay;
});

async function openBooking(entity: BookableEntity) {
  if (!auth.isLoggedIn) {
    await navigateTo('/login?redirect=/booking');
    return;
  }

  selectedEntity.value = entity;
  selection.startDate = undefined;
  selection.endDate = undefined;
  selection.startTime = undefined;
  selection.endTime = undefined;
  error.value = null;

  const from = new Date().toISOString().slice(0, 10);
  const toDate = new Date();
  toDate.setMonth(toDate.getMonth() + 3);
  const to = toDate.toISOString().slice(0, 10);

  try {
    availability.value = await request<Availability>(
      `/availability/${entity.id}?from=${from}&to=${to}`,
    );
  } catch {
    availability.value = { blockedDates: [], blockedSlots: [] };
  }

  drawerOpen.value = true;
}

function onSelectionApply(payload: {
  startDate: string;
  endDate: string;
  startTime?: string;
  endTime?: string;
}) {
  selection.startDate = payload.startDate;
  selection.endDate = payload.endDate;
  selection.startTime = payload.startTime;
  selection.endTime = payload.endTime;
  confirmOpen.value = true;
}

async function submitBooking() {
  if (!auth.isLoggedIn) {
    await navigateTo('/login?redirect=/booking');
    return;
  }
  if (!selectedEntity.value || !selection.startDate) return;

  submitting.value = true;
  error.value = null;

  try {
    const booking = await request<Booking>('/bookings', {
      method: 'POST',
      body: JSON.stringify({
        entityId: selectedEntity.value.id,
        startDate: selection.startDate,
        endDate: selection.endDate ?? selection.startDate,
        startTime: selection.startTime,
        endTime: selection.endTime,
      }),
    });

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
      await navigateTo('/profile?booked=1');
      return;
    }

    if (payment.confirmationUrl) {
      window.location.href = payment.confirmationUrl;
    }
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Ошибка бронирования';
  } finally {
    submitting.value = false;
  }
}
</script>

<style scoped lang="scss">
.booking-page {
  &__hint {
    color: var(--color-text-secondary);
    margin-bottom: $space-6;
  }

  &__grid {
    display: grid;
    gap: $space-5;

    @include md {
      grid-template-columns: repeat(2, 1fr);
    }

    @include lg {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  &__loading {
    color: var(--color-text-muted);
  }
}

.booking-confirm {
  &__price {
    font-size: $font-size-lg;
    margin-top: $space-4;
  }

  &__error {
    color: #c0392b;
    font-size: $font-size-sm;
  }

  &__actions {
    display: flex;
    justify-content: flex-end;
    gap: $space-3;
  }
}
</style>
