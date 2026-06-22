<template>
  <div class="page-content booking-page">
    <div v-if="entityLoading">
      <EntityCardSkeleton :count="1" />
    </div>

    <AppAlert
      v-else-if="entityError"
      title="Объект не найден"
      :message="entityError"
    >
      <template #actions>
        <AppButton size="sm" @click="navigateTo('/booking')">Все объекты</AppButton>
      </template>
    </AppAlert>

    <template v-else-if="entity">
      <div class="booking-page__entity">
        <NuxtLink to="/booking" class="booking-page__back">← Все объекты</NuxtLink>
        <h1>{{ entity.name }}</h1>
        <p class="booking-page__desc">{{ entity.description }}</p>

        <ul v-if="entity.amenities.length" class="booking-page__amenities">
          <li v-for="item in entity.amenities" :key="item">{{ item }}</li>
        </ul>

        <p class="booking-page__price">
          <template v-if="entity.bookingType === 'hourly'">
            от {{ (entity.pricePerHour ?? 0).toLocaleString('ru-RU') }} ₽ / час
          </template>
          <template v-else>
            от {{ entity.pricePerDay.toLocaleString('ru-RU') }} ₽ / сутки
          </template>
        </p>

        <AppButton @click="openBooking">Выбрать даты</AppButton>
      </div>

      <BookingCalendarDrawer
        :open="drawerOpen"
        :booking-type="entity.bookingType"
        :availability="availability"
        @close="drawerOpen = false"
        @apply="onSelectionApply"
      />

      <AppDrawer
        :open="confirmOpen"
        title="Подтверждение"
        @close="confirmOpen = false"
      >
        <div class="booking-confirm">
          <h3>{{ entity.name }}</h3>
          <p>{{ summaryText }}</p>
          <p class="booking-confirm__price">
            Итого: <strong>{{ estimatedPrice.toLocaleString('ru-RU') }} ₽</strong>
          </p>
          <AppAlert v-if="bookingError" :message="bookingError" />
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
    </template>
  </div>
</template>

<script setup lang="ts">
import type { BookableEntity, Availability, Booking } from '~/types';
import { formatRange, formatTimeRange, localTodayIso, addDaysIso, daysBetweenIso } from '~/utils/calendar';

const route = useRoute();
const auth = useAuthStore();
const { request, formatApiError } = useApi();

const slug = computed(() => route.params.slug as string);

const entity = ref<BookableEntity | null>(null);
const entityLoading = ref(true);
const entityError = ref<string | null>(null);
const availability = ref<Availability | undefined>();
const drawerOpen = ref(false);
const confirmOpen = ref(false);
const submitting = ref(false);
const bookingError = ref<string | null>(null);

const selection = reactive({
  startDate: undefined as string | undefined,
  endDate: undefined as string | undefined,
  startTime: undefined as string | undefined,
  endTime: undefined as string | undefined,
});

useHead(() => ({
  title: entity.value ? `${entity.value.name} — Яринг` : 'Объект — Яринг',
}));

onMounted(async () => {
  entityLoading.value = true;
  try {
    const entities = await request<BookableEntity[]>('/entities');
    entity.value = entities.find((e) => e.slug === slug.value) ?? null;
    if (!entity.value) {
      entityError.value = 'Объект не найден';
    }
  } catch (e) {
    entityError.value = formatApiError(e);
  } finally {
    entityLoading.value = false;
  }
});

const summaryText = computed(() => {
  if (!entity.value) return '';
  if (entity.value.bookingType === 'hourly') {
    return `${formatRange(selection.startDate, selection.startDate)} · ${formatTimeRange(selection.startTime, selection.endTime)}`;
  }
  return formatRange(selection.startDate, selection.endDate);
});

const estimatedPrice = computed(() => {
  const e = entity.value;
  if (!e || !selection.startDate) return 0;
  if (e.bookingType === 'hourly' && selection.startTime && selection.endTime) {
    const [sh, sm] = selection.startTime.split(':').map(Number);
    const [eh, em] = selection.endTime.split(':').map(Number);
    return ((eh * 60 + em - (sh * 60 + sm)) / 60) * (e.pricePerHour ?? 0);
  }
  if (!selection.endDate) return e.pricePerDay;
  return daysBetweenIso(selection.startDate, selection.endDate) * e.pricePerDay;
});

async function openBooking() {
  if (!auth.isLoggedIn) {
    await navigateTo({ path: '/login', query: { redirect: route.fullPath } });
    return;
  }
  if (!entity.value) return;

  const from = localTodayIso();
  const to = addDaysIso(from, 90);
  try {
    availability.value = await request<Availability>(
      `/availability/${entity.value.id}?from=${from}&to=${to}`,
    );
  } catch {
    // proceed without availability data
  }
  drawerOpen.value = true;
}

function onSelectionApply(payload: {
  startDate: string; endDate: string; startTime?: string; endTime?: string;
}) {
  Object.assign(selection, payload);
  confirmOpen.value = true;
}

async function submitBooking() {
  if (!auth.isLoggedIn) {
    await navigateTo({ path: '/login', query: { redirect: route.fullPath } });
    return;
  }
  if (!entity.value || !selection.startDate) return;

  submitting.value = true;
  bookingError.value = null;
  try {
    const booking = await request<Booking>('/bookings', {
      method: 'POST',
      body: JSON.stringify({
        entityId: entity.value.id,
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
    bookingError.value = formatApiError(e);
  } finally {
    submitting.value = false;
  }
}
</script>

<style scoped lang="scss">
.booking-page {
  &__entity {
    max-width: 640px;
  }

  &__back {
    display: inline-block;
    margin-bottom: $space-4;
    font-size: $font-size-sm;
    color: var(--color-text-muted);

    &:hover {
      color: var(--color-primary);
    }
  }

  &__desc {
    color: var(--color-text-secondary);
    margin-bottom: $space-4;
  }

  &__amenities {
    list-style: none;
    padding: 0;
    margin: 0 0 $space-4;
    display: flex;
    flex-wrap: wrap;
    gap: $space-2;

    li {
      font-size: $font-size-sm;
      padding: $space-1 $space-3;
      background: var(--color-surface-elevated);
      border-radius: $radius-full;
      color: var(--color-text-secondary);
    }
  }

  &__price {
    font-size: $font-size-xl;
    font-weight: 700;
    color: var(--color-primary);
    margin-bottom: $space-5;
  }
}

.booking-confirm {
  &__price {
    font-size: $font-size-lg;
    margin-top: $space-4;
  }

  &__actions {
    display: flex;
    justify-content: flex-end;
    gap: $space-3;
  }
}
</style>
