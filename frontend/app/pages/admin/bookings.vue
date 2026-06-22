<template>
  <div>
    <div class="admin-bookings__header">
      <h1>Бронирования</h1>
      <div class="admin-bookings__filters">
        <select v-model="filterStatus" class="admin-bookings__select">
          <option value="">Все статусы</option>
          <option value="pending_payment">Ожидает оплаты</option>
          <option value="confirmed">Подтверждено</option>
          <option value="cancelled">Отменено</option>
          <option value="completed">Завершено</option>
        </select>
        <input
          v-model="search"
          class="admin-bookings__search"
          placeholder="Поиск по объекту..."
          type="search"
        />
      </div>
    </div>

    <div v-if="loading" class="admin-skeleton">
      <AppSkeleton v-for="n in 6" :key="n" height="44px" />
    </div>
    <AppAlert v-else-if="loadError" :message="loadError" />
    <template v-else>
      <AppAlert v-if="actionError" :message="actionError" />
      <table class="admin-table">
        <thead>
          <tr>
            <th>Объект</th>
            <th>Даты</th>
            <th>Сумма</th>
            <th>Статус</th>
            <th>User ID</th>
            <th />
          </tr>
        </thead>
        <tbody>
          <tr v-for="booking in filteredBookings" :key="booking.id">
            <td>{{ booking.entityName }}</td>
            <td>
              <template v-if="booking.bookingType === 'hourly'">
                {{ formatDateRu(booking.startDate) }}
                {{ booking.startTime }}–{{ booking.endTime }}
              </template>
              <template v-else>
                {{ formatRange(booking.startDate, booking.endDate) }}
              </template>
            </td>
            <td>{{ booking.totalPrice.toLocaleString('ru-RU') }} ₽</td>
            <td>
              <span class="admin-status" :class="`admin-status--${booking.status}`">
                {{ statusLabel(booking.status) }}
              </span>
            </td>
            <td class="admin-table__muted">{{ booking.userId.slice(0, 8) }}…</td>
            <td class="admin-table__actions">
              <AppButton
                v-if="booking.status === 'confirmed' || booking.status === 'pending_payment'"
                size="sm"
                variant="danger"
                :loading="cancellingId === booking.id"
                @click="cancelBooking(booking.id)"
              >
                Отменить
              </AppButton>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-if="!filteredBookings.length" class="admin-empty">
        {{ bookings.length ? 'Ничего не найдено' : 'Броней пока нет' }}
      </p>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { Booking } from '~/types';
import { formatRange, formatDateRu, BOOKING_STATUS_LABELS } from '~/utils/calendar';

definePageMeta({ layout: 'admin', middleware: 'admin' });
useHead({ title: 'Брони — Админка' });

const { request, formatApiError } = useApi();
const bookings = ref<Booking[]>([]);
const loading = ref(true);
const loadError = ref<string | null>(null);
const actionError = ref<string | null>(null);
const cancellingId = ref<string | null>(null);
const filterStatus = ref('');
const search = ref('');

const filteredBookings = computed(() => {
  return bookings.value.filter((b) => {
    if (filterStatus.value && b.status !== filterStatus.value) return false;
    if (search.value && !b.entityName.toLowerCase().includes(search.value.toLowerCase())) return false;
    return true;
  });
});

onMounted(load);

async function load() {
  loading.value = true;
  loadError.value = null;
  try {
    bookings.value = await request<Booking[]>('/bookings');
  } catch (e) {
    bookings.value = [];
    loadError.value = formatApiError(e);
  } finally {
    loading.value = false;
  }
}

async function cancelBooking(id: string) {
  if (!confirm('Отменить бронирование?')) return;
  cancellingId.value = id;
  actionError.value = null;
  try {
    await request(`/bookings/${id}/cancel`, { method: 'POST' });
    await load();
  } catch (e) {
    actionError.value = formatApiError(e);
  } finally {
    cancellingId.value = null;
  }
}

function statusLabel(status: string) {
  return BOOKING_STATUS_LABELS[status] ?? status;
}
</script>

<style scoped lang="scss">
.admin-bookings {
  &__header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    flex-wrap: wrap;
    gap: $space-4;
    margin-bottom: $space-4;
  }

  &__filters {
    display: flex;
    gap: $space-3;
    flex-wrap: wrap;
  }

  &__select,
  &__search {
    padding: $space-2 $space-3;
    border: 1px solid var(--color-border);
    border-radius: $radius-md;
    background: var(--color-surface);
    color: var(--color-text);
    font-size: $font-size-sm;
    min-width: 160px;

    &:focus {
      outline: none;
      border-color: var(--color-primary);
    }
  }
}

.admin-table {
  @include admin-table;
  margin-top: $space-4;

  &__actions {
    text-align: right;
  }
}

.admin-status {
  @include admin-status;
}

.admin-empty {
  color: var(--color-text-muted);
  margin-top: $space-6;
}

.admin-skeleton {
  display: flex;
  flex-direction: column;
  gap: $space-2;
  margin-top: $space-4;
}
</style>
