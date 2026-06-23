import { ApiError, formatApiError } from '~/utils/api-error';

export function useApi() {
  const config = useRuntimeConfig();
  const auth = useAuthStore();

  async function request<T>(
    path: string,
    options: RequestInit = {},
    _retrying = false,
  ): Promise<T> {
    let response: Response;

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
      };

      if (auth.token) {
        headers.Authorization = `Bearer ${auth.token}`;
      }

      response = await fetch(`${config.public.apiUrl}${path}`, { ...options, headers });
    } catch {
      throw new ApiError(
        'Не удалось связаться с сервером. Запустите backend: npm run start:all',
        0,
        'NETWORK',
      );
    }

    // Auto-refresh on 401 (once)
    if (response.status === 401 && !_retrying && auth.refreshToken) {
      const refreshed = await auth.tryRefresh();
      if (refreshed) return request<T>(path, options, true);
      auth.logout();
      if (import.meta.client) await navigateTo('/login');
      throw new ApiError('Сессия истекла. Войдите снова.', 401);
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const message = (data as { message?: string | string[] }).message;
      const text = Array.isArray(message)
        ? message.join(', ')
        : message ?? `Ошибка сервера (${response.status})`;
      throw new ApiError(text, response.status);
    }

    return data as T;
  }

  return { request, formatApiError };
}
