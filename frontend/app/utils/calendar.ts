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

export function localTodayIso() {
  const now = new Date();
  return toIsoDate(now.getFullYear(), now.getMonth(), now.getDate());
}

export function addDaysIso(iso: string, days: number) {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  return toIsoDate(date.getFullYear(), date.getMonth(), date.getDate());
}

export function daysBetweenIso(start: string, end: string) {
  const [sy, sm, sd] = start.split('-').map(Number);
  const [ey, em, ed] = end.split('-').map(Number);
  const s = new Date(sy, sm - 1, sd);
  const e = new Date(ey, em - 1, ed);
  return Math.max(1, Math.round((e.getTime() - s.getTime()) / 86400000) + 1);
}

export const BOOKING_MIN_ADVANCE_DAYS = 1;
export const HOURLY_MIN_HOURS = 1;
export const HOURLY_MAX_HOURS = 12;

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
