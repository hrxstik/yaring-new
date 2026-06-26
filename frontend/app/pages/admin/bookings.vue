<template>
  <div class="admin-bookings">
    <div class="admin-bookings__header">
      <h2 class="admin-bookings__title">Брони</h2>
      <div class="admin-bookings__filters">
        <select v-model="filterStatus" class="admin-bookings__select">
          <option value="">Все статусы</option>
          <option value="pending_payment">Ожидает оплаты</option>
          <option value="confirmed">Подтверждено</option>
          <option value="cancelled">Отменено</option>
          <option value="completed">Завершено</option>
        </select>
        <div class="admin-bookings__search">
          <Search :size="15" />
          <input v-model="search" placeholder="Поиск по объекту…" type="search" />
        </div>
      </div>
    </div>

    <div v-if="loading" class="admin-skeleton">
      <AppSkeleton v-for="n in 6" :key="n" height="44px" />
    </div>
    <AppAlert v-else-if="loadError" variant="error" :message="loadError" />
    <template v-else>
      <AppAlert v-if="actionError" variant="error" :message="actionError" />

      <div v-if="!filteredBookings.length" class="empty-state">
        <span class="empty-state__icon"><SearchX :size="34" /></span>
        <div class="empty-state__text">
          <span class="empty-state__title">{{ bookings.length ? 'Ничего не найдено' : 'Броней пока нет' }}</span>
          <span v-if="bookings.length" class="empty-state__sub">Измените фильтр или поисковый запрос.</span>
        </div>
      </div>

      <div v-else class="admin-card">
        <div class="admin-card__scroll">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Объект</th>
                <th>Даты / время</th>
                <th>Сумма</th>
                <th>Статус</th>
                <th>Гость</th>
                <th />
              </tr>
            </thead>
            <tbody>
              <tr v-for="booking in filteredBookings" :key="booking.id">
                <td class="admin-table__strong">{{ booking.entityName }}</td>
                <td>
                  <template v-if="booking.bookingType === 'hourly'">
                    {{ formatDateRu(booking.startDate) }} · {{ booking.startTime }}–{{ booking.endTime }}
                  </template>
                  <template v-else>
                    {{ formatRange(booking.startDate, booking.endDate) }}
                  </template>
                </td>
                <td class="admin-table__strong">{{ booking.totalPrice.toLocaleString('ru-RU') }} ₽</td>
                <td>
                  <span class="status-badge" :class="`status-badge--${booking.status}`">
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
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { Search, SearchX } from 'lucide-vue-next';
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
  display: flex;
  flex-direction: column;
  gap: $space-4;

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: $space-3;
  }

  &__title {
    margin: 0;
    font-size: var(--font-2xl);
  }

  &__filters {
    display: flex;
    gap: $space-2;
    flex-wrap: wrap;
  }

  &__select {
    height: 38px;
    padding: 0 $space-3;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-surface);
    color: var(--color-text);
    font-family: inherit;
    font-size: $font-size-sm;
    font-weight: 600;
    cursor: pointer;

    &:focus {
      outline: none;
      border-color: var(--color-primary);
    }
  }

  &__search {
    display: flex;
    align-items: center;
    gap: $space-2;
    height: 38px;
    padding: 0 $space-3;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-surface);
    color: var(--color-text-muted);

    &:focus-within {
      border-color: var(--color-primary);
    }

    input {
      border: none;
      background: none;
      color: var(--color-text);
      font-family: inherit;
      font-size: $font-size-sm;
      outline: none;
      width: 180px;
      max-width: 50vw;
    }
  }
}

.admin-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;

  &__scroll {
    overflow-x: auto;
  }
}

.admin-table {
  @include admin-table;
  min-width: 640px;

  thead th {
    background: var(--color-surface-elevated);
    font-size: $font-size-xs;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }

  &__strong {
    font-weight: 700;
  }

  &__actions {
    text-align: right;
  }
}

.status-badge {
  @include status-badge;
  display: inline-block;
}

.admin-skeleton {
  display: flex;
  flex-direction: column;
  gap: $space-2;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $space-3;
  padding: $space-9 $space-4;
  text-align: center;

  &__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 72px;
    height: 72px;
    border-radius: var(--radius-lg);
    background: var(--color-surface-elevated);
    color: var(--color-text-muted);
  }

  &__text {
    display: flex;
    flex-direction: column;
    gap: $space-1;
  }

  &__title {
    font-size: var(--font-lg);
    font-weight: 700;
  }

  &__sub {
    font-size: $font-size-sm;
    color: var(--color-text-secondary);
  }
}
</style>
