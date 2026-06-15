export function useApi() {
  const config = useRuntimeConfig();
  const auth = useAuthStore();

  async function request<T>(
    path: string,
    options: RequestInit = {},
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (auth.token) {
      headers.Authorization = `Bearer ${auth.token}`;
    }

    const response = await fetch(`${config.public.apiUrl}${path}`, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const message = (data as { message?: string | string[] }).message;
      const text = Array.isArray(message)
        ? message.join(', ')
        : message ?? `Ошибка ${response.status}`;
      throw new Error(text);
    }

    return data as T;
  }

  return { request };
}
