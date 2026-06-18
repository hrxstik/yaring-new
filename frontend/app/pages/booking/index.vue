<template>
  <div class="page-content booking-page">
    <h1>Бронирование</h1>
    <p class="booking-page__hint">
      Выберите объект и укажите даты. Бронирование доступно после входа в аккаунт.
    </p>

    <EntityCardSkeleton v-if="loading" :count="3" />

    <AppAlert
      v-else-if="loadError"
      title="Объекты недоступны"
      :message="loadError"
    >
      <template #actions>
        <AppButton size="sm" @click="loadEntities">Повторить</AppButton>
      </template>
    </AppAlert>

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
        <AppAlert v-if="error" :message="error" />
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
import { formatRange, formatTimeRange, localTodayIso, addDaysIso, daysBetweenIso } from '~/utils/calendar';

useHead({ title: 'Бронирование — Яринг' });

const auth = useAuthStore();
const route = useRoute();
const { request, formatApiError } = useApi();

const entities = ref<BookableEntity[]>([]);
const loading = ref(true);
const loadError = ref<string | null>(null);
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

onMounted(loadEntities);

async function loadEntities() {
  loading.value = true;
  loadError.value = null;
  try {
    entities.value = await request<BookableEntity[]>('/entities');
  } catch (e) {
    entities.value = [];
    loadError.value = formatApiError(e);
  } finally {
    loading.value = false;
  }

  await openEntityFromQuery();
}

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
  return daysBetweenIso(selection.startDate, selection.endDate) * e.pricePerDay;
});

async function openBooking(entity: BookableEntity) {
  const target = entityBookingPath(entity);
  if (route.fullPath !== target) {
    await navigateTo(target, { replace: true });
  }

  if (!auth.isLoggedIn) {
    await navigateTo({
      path: '/login',
      query: { redirect: target },
    });
    return;
  }

  selectedEntity.value = entity;
  selection.startDate = undefined;
  selection.endDate = undefined;
  selection.startTime = undefined;
  selection.endTime = undefined;
  error.value = null;

  const from = localTodayIso();
  const to = addDaysIso(from, 90);

  try {
    availability.value = await request<Availability>(
      `/availability/${entity.id}?from=${from}&to=${to}`,
    );
  } catch (e) {
    error.value = formatApiError(e);
    return;
  }

  drawerOpen.value = true;
}

async function openEntityFromQuery() {
  const slug = route.query.entity;
  if (typeof slug !== 'string') return;

  const entity = entities.value.find((item) => item.slug === slug);
  if (entity) {
    await openBooking(entity);
  }
}

function entityBookingPath(entity: BookableEntity) {
  return `/booking?entity=${encodeURIComponent(entity.slug)}`;
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
    const target = selectedEntity.value
      ? entityBookingPath(selectedEntity.value)
      : '/booking';
    await navigateTo({
      path: '/login',
      query: { redirect: target },
    });
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
    error.value = formatApiError(e);
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

    @include sm {
      grid-template-columns: repeat(2, 1fr);
    }

    @include md {
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
