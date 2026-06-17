export class ApiError extends Error {
  constructor(
    message: string,
    readonly status?: number,
    readonly code?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function formatApiError(error: unknown): string {
  if (error instanceof ApiError) return error.message;

  if (error instanceof TypeError) {
    const msg = error.message.toLowerCase();
    if (msg.includes('fetch') || msg.includes('network')) {
      return 'Не удалось связаться с сервером. Убедитесь, что backend запущен.';
    }
  }

  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    if (msg.includes('failed to fetch') || msg.includes('networkerror')) {
      return 'Нет соединения с сервером. Проверьте интернет и запуск backend.';
    }
    if (msg.includes('json')) {
      return 'Сервер вернул некорректный ответ. Попробуйте позже.';
    }
    return error.message;
  }

  return 'Произошла неизвестная ошибка. Попробуйте ещё раз.';
}
