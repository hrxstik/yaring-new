<template>
  <div class="page-content booking-page">
    <nav class="breadcrumb">
      <NuxtLink to="/">Главная</NuxtLink>
      <ChevronRight :size="14" />
      <span>Бронирование</span>
    </nav>
    <h1 class="booking-page__title">Бронирование</h1>
    <p class="booking-page__hint">
      Выберите объект, даты и время — оплата онлайн.
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
      show-back
      @close="confirmOpen = false"
      @back="confirmOpen = false"
    >
      <div v-if="selectedEntity" class="booking-confirm">
        <h3 class="booking-confirm__name">{{ selectedEntity.name }}</h3>
        <div class="booking-confirm__rows">
          <span class="booking-confirm__row"><Calendar :size="16" />{{ dateLabel }}</span>
          <span v-if="timeLabel" class="booking-confirm__row"><Clock :size="16" />{{ timeLabel }}</span>
        </div>
        <AppAlert variant="info" message="Бронь действует 15 минут до оплаты." />
        <AppAlert v-if="error" variant="error" :message="error" />
        <div class="booking-confirm__total">
          <span>Итого</span>
          <strong>{{ estimatedPrice.toLocaleString('ru-RU') }} ₽</strong>
        </div>
      </div>
      <template #footer>
        <AppButton variant="secondary" block @click="confirmOpen = false">Назад</AppButton>
        <AppButton block :loading="submitting" @click="submitBooking">
          {{ auth.isLoggedIn ? 'Оплатить' : 'Войти и оплатить' }}
        </AppButton>
      </template>
    </AppDrawer>
  </div>
</template>

<script setup lang="ts">
import { ChevronRight, Calendar, Clock } from 'lucide-vue-next';
import type { BookableEntity, Availability, Booking } from '~/types';
import { formatRange, formatTimeRange, localTodayIso, addDaysIso, daysBetweenIso } from '~/utils/calendar';

useHead({ title: 'Бронирование — Яринг' });
useSeoMeta({ description: 'Забронируйте домик, баню или беседку на базе отдыха Яринг онлайн.' });

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

const dateLabel = computed(() => {
  if (!selectedEntity.value) return '';
  if (selectedEntity.value.bookingType === 'hourly') {
    return formatRange(selection.startDate, selection.startDate);
  }
  return formatRange(selection.startDate, selection.endDate);
});

const timeLabel = computed(() => {
  if (selectedEntity.value?.bookingType !== 'hourly') return '';
  return formatTimeRange(selection.startTime, selection.endTime);
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
.breadcrumb {
  display: flex;
  align-items: center;
  gap: $space-1 + 2px;
  font-size: $font-size-sm;
  color: var(--color-text-muted);
  margin-bottom: $space-2;

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

.booking-page {
  &__title {
    margin: 0 0 $space-1;
  }

  &__hint {
    color: var(--color-text-secondary);
    margin-bottom: $space-6;
  }

  &__grid {
    display: grid;
    gap: $space-4;

    @include sm {
      grid-template-columns: repeat(2, 1fr);
    }

    @include md {
      grid-template-columns: repeat(3, 1fr);
    }
  }
}

.booking-confirm {
  display: flex;
  flex-direction: column;
  gap: $space-4;

  &__name {
    margin: 0;
    font-size: var(--font-xl);
  }

  &__rows {
    display: flex;
    flex-direction: column;
    gap: $space-2 + 2px;
  }

  &__row {
    display: flex;
    align-items: center;
    gap: $space-2 + 2px;
    font-size: $font-size-sm;
    color: var(--color-text-secondary);

    svg {
      color: var(--color-primary);
      flex: none;
    }
  }

  &__total {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    padding-top: $space-4;
    border-top: 1px solid var(--color-border);

    span {
      font-size: $font-size-base;
      color: var(--color-text-secondary);
    }

    strong {
      font-size: var(--font-2xl);
      font-weight: 800;
      color: var(--color-primary);
    }
  }
}
</style>
