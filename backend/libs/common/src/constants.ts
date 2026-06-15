export const BOOKING_RULES = {
  minAdvanceDays: 1,
  maxAdvanceDays: 365,
  cancellationFreeDays: 7,
  cancellationPartialDays: 3,
  checkInTime: '14:00',
  checkOutTime: '12:00',
  hourlyMinHours: 1,
  hourlyMaxHours: 12,
  hourlySlotMinutes: 30,
};

export const DEFAULT_CONTENT_PAGES = [
  {
    slug: 'prices',
    title: 'Цены',
    body: '<p>Актуальные цены на размещение и услуги базы отдыха.</p>',
  },
  {
    slug: 'contacts',
    title: 'Контакты',
    body: '<p>Телефон: +7 (900) 000-00-00<br>Email: info@yaring.ru<br>Адрес: Ленинградская область</p>',
  },
  {
    slug: 'rules',
    title: 'Правила проживания',
    body: `<h2>Общие правила</h2>
<ul>
<li>Заезд с 14:00, выезд до 12:00.</li>
<li>Бесплатная отмена за 7 и более дней до заезда.</li>
<li>Отмена за 3–6 дней — возврат 50%.</li>
<li>Отмена менее чем за 3 дня — без возврата.</li>
<li>Курение только в отведённых зонах.</li>
<li>Домашние животные по предварительному согласованию.</li>
<li>Тишина с 23:00 до 08:00.</li>
</ul>`,
  },
  {
    slug: 'privacy',
    title: 'Политика конфиденциальности',
    body: `<p>Мы обрабатываем персональные данные в соответствии с ФЗ-152.</p>
<p>Данные используются для бронирования, связи с гостями и улучшения сервиса.</p>
<p>По вопросам обработки данных: privacy@yaring.ru</p>`,
  },
];
