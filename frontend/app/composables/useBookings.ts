import type { Booking } from '~/types';

export function useBookings(scope: 'my' | 'all' = 'my') {
  const { request, formatApiError } = useApi();
  const bookings = ref<Booking[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function load() {
    loading.value = true;
    error.value = null;
    try {
      const path = scope === 'all' ? '/bookings' : '/bookings/my';
      bookings.value = await request<Booking[]>(path);
    } catch (e) {
      bookings.value = [];
      error.value = formatApiError(e);
    } finally {
      loading.value = false;
    }
  }

  async function cancel(id: string): Promise<boolean> {
    try {
      await request(`/bookings/${id}/cancel`, { method: 'POST' });
      await load();
      return true;
    } catch (e) {
      error.value = formatApiError(e);
      return false;
    }
  }

  return { bookings, loading, error, load, cancel };
}
