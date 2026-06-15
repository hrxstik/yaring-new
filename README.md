# Яринг — база отдыха

Сайт базы отдыха с бронированием, личным кабинетом и админкой.

## Стек

- **Frontend:** Nuxt 4, Vue 3, SCSS, Pinia, Lucide Icons
- **Backend:** NestJS микросервисы (gateway, auth, catalog, booking, payment)
- **Оплата:** ЮKassa
- **Email:** Unisender Go (подтверждение регистрации кодом)

## Запуск

### Backend

```bash
cd backend
cp .env.example .env
npm install
mkdir -p data
npm run start:all
```

Сервисы:
- Gateway: http://localhost:4000
- Auth: 3001, Catalog: 3002, Booking: 3003, Payment: 3004

Админ по умолчанию: `admin@yaring.ru` / `admin123`

Без `UNISENDER_API_KEY` код подтверждения пишется в лог auth-сервиса.
Без ключей ЮKassa используется mock-оплата.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Сайт: http://localhost:3000

## Страницы

- Главная, цены, контакты, правила, политика конфиденциальности
- Бронирование (календарь в drawer, посуточно/почасово)
- Вход / регистрация с подтверждением email
- Личный кабинет (мои брони)
- Админка: CMS объектов, брони, редактирование страниц

## Дизайн

- 5 breakpoints: 360 / 576 / 768 / 1024 / 1280 px
- Шаг сетки 8px
- Акцентный цвет — еловый (#3d6b4f / #6aab7a)
- Светлая и тёмная тема
