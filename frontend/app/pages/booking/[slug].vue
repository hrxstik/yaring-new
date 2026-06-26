<template>
  <div class="page-content entity-detail">
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
      <NuxtLink to="/booking" class="entity-detail__back">
        <ArrowLeft :size="16" />Все объекты
      </NuxtLink>

      <div class="entity-detail__layout">
        <div class="entity-detail__media">
          <img v-if="imageSrc" :src="imageSrc" :alt="entity.name" />
          <span v-else class="entity-detail__placeholder">фото объекта</span>
        </div>

        <div class="entity-detail__info">
          <h1 class="entity-detail__title">{{ entity.name }}</h1>

          <div class="entity-detail__meta">
            <span class="chip">
              <component :is="typeIcon" :size="14" />{{ typeLabel }}
            </span>
            <span class="chip">
              <Users :size="14" />до {{ entity.capacity }} чел.
            </span>
            <span class="chip chip--price">{{ priceLabel }}</span>
          </div>

          <p class="entity-detail__desc">{{ entity.description }}</p>

          <div v-if="entity.amenities.length" class="entity-detail__amenities">
            <span class="entity-detail__amenities-label">Удобства</span>
            <div class="entity-detail__amenities-list">
              <span v-for="item in entity.amenities" :key="item" class="amenity">
                <component :is="amenityIcon(item)" :size="16" />{{ item }}
              </span>
            </div>
          </div>

          <AppButton size="lg" block @click="openBooking">Выбрать даты</AppButton>
        </div>
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
        show-back
        @close="confirmOpen = false"
        @back="confirmOpen = false"
      >
        <div class="booking-confirm">
          <h3 class="booking-confirm__name">{{ entity.name }}</h3>
          <div class="booking-confirm__rows">
            <span class="booking-confirm__row"><Calendar :size="16" />{{ dateLabel }}</span>
            <span v-if="timeLabel" class="booking-confirm__row"><Clock :size="16" />{{ timeLabel }}</span>
          </div>
          <AppAlert variant="info" message="Бронь действует 15 минут до оплаты." />
          <AppAlert v-if="bookingError" variant="error" :message="bookingError" />
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
    </template>
  </div>
</template>

<script setup lang="ts">
import {
  ArrowLeft, Calendar, Clock, Users, Flame, Waves, Sofa, Droplets,
  BedDouble, Utensils, Wifi, Car, Lamp, TreePine, DoorOpen,
} from 'lucide-vue-next';
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

const placeholders: Record<string, string> = {
  'domik-u-ozera': '/entity-cottage.png',
  banya: '/entity-sauna.png',
  besedka: '/entity-gazebo.png',
};

const imageSrc = computed(() => {
  if (!entity.value) return null;
  const url = entity.value.imageUrl;
  if (url && (url.startsWith('http') || url.startsWith('/'))) return url;
  return placeholders[entity.value.slug] ?? null;
});

const typeLabel = computed(() =>
  entity.value?.bookingType === 'hourly' ? 'Почасово' : 'Посуточно',
);
const typeIcon = computed(() => (entity.value?.bookingType === 'hourly' ? Clock : Calendar));

const priceLabel = computed(() => {
  if (!entity.value) return '';
  if (entity.value.bookingType === 'hourly') {
    return `${(entity.value.pricePerHour ?? 0).toLocaleString('ru-RU')} ₽ / час`;
  }
  return `${entity.value.pricePerDay.toLocaleString('ru-RU')} ₽ / сутки`;
});

const dateLabel = computed(() => {
  if (!entity.value) return '';
  if (entity.value.bookingType === 'hourly') {
    return formatRange(selection.startDate, selection.startDate);
  }
  return formatRange(selection.startDate, selection.endDate);
});

const timeLabel = computed(() => {
  if (entity.value?.bookingType !== 'hourly') return '';
  return formatTimeRange(selection.startTime, selection.endTime);
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

function amenityIcon(item: string) {
  const v = item.toLowerCase();
  if (v.includes('парн') || v.includes('мангал') || v.includes('камин')) return Flame;
  if (v.includes('купел') || v.includes('озер') || v.includes('вид')) return Waves;
  if (v.includes('отдых') || v.includes('гостин') || v.includes('диван')) return Sofa;
  if (v.includes('душ') || v.includes('вода')) return Droplets;
  if (v.includes('спаль')) return BedDouble;
  if (v.includes('кух')) return Utensils;
  if (v.includes('wi-fi') || v.includes('wifi')) return Wifi;
  if (v.includes('парков')) return Car;
  if (v.includes('освещ')) return Lamp;
  if (v.includes('террас') || v.includes('лес')) return TreePine;
  if (v.includes('гост')) return Users;
  return DoorOpen;
}

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
.entity-detail {
  &__back {
    display: inline-flex;
    align-items: center;
    gap: $space-1 + 2px;
    margin-bottom: $space-4;
    font-size: $font-size-sm;
    font-weight: 600;
    color: var(--color-text-secondary);
    text-decoration: none;

    &:hover {
      color: var(--color-primary);
    }
  }

  &__layout {
    display: grid;
    gap: $space-5;

    @include sm {
      grid-template-columns: 1fr 1fr;
      gap: $space-6;
      align-items: start;
    }
  }

  &__media {
    @include photo-placeholder;
    aspect-ratio: 16 / 10;
    border-radius: var(--radius-lg);
    overflow: hidden;

    @include sm {
      aspect-ratio: 4 / 3;
    }

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  &__placeholder {
    font-family: monospace;
    font-size: $font-size-xs;
    color: var(--color-text-muted);
    background: var(--color-surface);
    padding: $space-1 $space-3;
    border-radius: $radius-full;
  }

  &__info {
    display: flex;
    flex-direction: column;
    gap: $space-4;
  }

  &__title {
    margin: 0;
  }

  &__meta {
    display: flex;
    flex-wrap: wrap;
    gap: $space-2;
  }

  &__desc {
    margin: 0;
    font-size: var(--font-base);
    line-height: 1.55;
    color: var(--color-text-secondary);
  }

  &__amenities {
    display: flex;
    flex-direction: column;
    gap: $space-3;
  }

  &__amenities-label {
    font-size: $font-size-sm;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--color-text-muted);
  }

  &__amenities-list {
    display: flex;
    flex-wrap: wrap;
    gap: $space-2;
  }
}

.chip {
  display: flex;
  align-items: center;
  gap: $space-1 + 2px;
  padding: $space-1 + 2px $space-3;
  border-radius: $radius-full;
  font-size: $font-size-sm;
  font-weight: 600;
  color: var(--color-text-secondary);
  background: var(--color-surface-elevated);

  svg {
    color: var(--color-primary);
  }

  &--price {
    color: var(--color-primary);
    font-weight: 700;
    background: var(--color-primary-tint);
  }
}

.amenity {
  display: flex;
  align-items: center;
  gap: $space-2 - 1px;
  padding: $space-2 $space-3;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: $font-size-sm;
  color: var(--color-text-secondary);

  svg {
    color: var(--color-primary);
    flex: none;
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
