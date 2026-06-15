export const CALENDAR_MONTHS = [
  'Январь',
  'Февраль',
  'Март',
  'Апрель',
  'Май',
  'Июнь',
  'Июль',
  'Август',
  'Сентябрь',
  'Октябрь',
  'Ноябрь',
  'Декабрь',
];

export const CALENDAR_WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

export function toIsoDate(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

export function getFirstDayOfWeek(year: number, month: number) {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
}

export function formatRange(start?: string, end?: string) {
  if (!start && !end) return 'Выберите даты';
  if (start && !end) return `${formatDateRu(start)} — …`;
  if (start && end) return `${formatDateRu(start)} — ${formatDateRu(end)}`;
  return 'Выберите даты';
}

export function formatDateRu(iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  return `${String(d).padStart(2, '0')}.${String(m).padStart(2, '0')}.${y}`;
}

export function formatTimeRange(start?: string, end?: string) {
  if (!start || !end) return 'Выберите время';
  return `${start} — ${end}`;
}

export const HOURLY_SLOTS = (() => {
  const slots: string[] = [];
  for (let h = 8; h <= 22; h++) {
    slots.push(`${String(h).padStart(2, '0')}:00`);
    if (h < 22) slots.push(`${String(h).padStart(2, '0')}:30`);
  }
  return slots;
})();

export const BOOKING_STATUS_LABELS: Record<string, string> = {
  pending_payment: 'Ожидает оплаты',
  confirmed: 'Подтверждено',
  cancelled: 'Отменено',
  completed: 'Завершено',
};
