<template>
  <div>
    <h1>Бронирования</h1>
    <p v-if="loading">Загрузка…</p>
    <table v-else class="admin-table">
      <thead>
        <tr>
          <th>Объект</th>
          <th>Даты</th>
          <th>Сумма</th>
          <th>Статус</th>
          <th>User ID</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="booking in bookings" :key="booking.id">
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
          <td>{{ statusLabel(booking.status) }}</td>
          <td class="admin-table__muted">{{ booking.userId.slice(0, 8) }}…</td>
        </tr>
      </tbody>
    </table>
    <p v-if="!loading && !bookings.length" class="admin-empty">Броней пока нет</p>
  </div>
</template>

<script setup lang="ts">
import type { Booking } from '~/types';
import { formatRange, formatDateRu, BOOKING_STATUS_LABELS } from '~/utils/calendar';

definePageMeta({ layout: 'admin' });
useHead({ title: 'Брони — Админка' });

const { request } = useApi();
const bookings = ref<Booking[]>([]);
const loading = ref(true);

onMounted(async () => {
  try {
    bookings.value = await request<Booking[]>('/bookings');
  } finally {
    loading.value = false;
  }
});

function statusLabel(status: string) {
  return BOOKING_STATUS_LABELS[status] ?? status;
}
</script>

<style scoped lang="scss">
.admin-table {
  width: 100%;
  border-collapse: collapse;
  font-size: $font-size-sm;
  margin-top: $space-6;

  th,
  td {
    padding: $space-3 $space-4;
    text-align: left;
    border-bottom: 1px solid var(--color-border);
  }

  th {
    color: var(--color-text-muted);
  }

  &__muted {
    color: var(--color-text-muted);
    font-family: monospace;
  }
}

.admin-empty {
  color: var(--color-text-muted);
  margin-top: $space-6;
}
</style>
