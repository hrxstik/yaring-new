import type { BookableEntity } from '~/types';

export function useEntities(opts?: { all?: boolean }) {
  const { request, formatApiError } = useApi();
  const entities = ref<BookableEntity[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function load() {
    loading.value = true;
    error.value = null;
    try {
      const qs = opts?.all ? '?all=true' : '';
      entities.value = await request<BookableEntity[]>(`/entities${qs}`);
    } catch (e) {
      entities.value = [];
      error.value = formatApiError(e);
    } finally {
      loading.value = false;
    }
  }

  return { entities, loading, error, load };
}
