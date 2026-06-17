import { expect, test } from '@playwright/test';
import {
  API_URL,
  authorizePage,
  createPaidBooking,
  createVerifiedUser,
  loginByApi,
} from './helpers';

async function adminSession(request: Parameters<typeof loginByApi>[0]) {
  return loginByApi(request, '+79990000000', 'admin123');
}

test.describe('admin scenarios', () => {
  test('redirects guest away from admin area', async ({ page }) => {
    await page.goto('/admin');

    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole('heading', { name: 'Вход' })).toBeVisible();
  });

  test('opens admin dashboard for admin user', async ({ page, request }) => {
    const admin = await adminSession(request);
    await authorizePage(page, admin);

    await page.goto('/admin');

    await expect(page.getByRole('heading', { name: 'Админ-панель' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Объекты' }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: 'Брони' }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: 'Страницы' }).first()).toBeVisible();
  });

  test('creates, edits and deletes a bookable entity', async ({ page, request }) => {
    const admin = await adminSession(request);
    const slug = `e2e-entity-${Date.now()}`;
    const initialName = `E2E домик ${Date.now()}`;
    const editedName = `${initialName} обновлён`;
    await authorizePage(page, admin);

    await page.goto('/admin/entities');
    await page.getByRole('button', { name: 'Добавить' }).click();
    await page.getByLabel('Название').fill(initialName);
    await page.getByLabel('Slug').fill(slug);
    await page.getByLabel('Описание').fill('Тестовый объект для e2e-проверки админки.');
    await page.getByLabel('Цена за сутки').fill('7100');
    await page.getByLabel('Вместимость').fill('4');
    await page.getByLabel('Удобства (через запятую)').fill('Wi-Fi, терраса');
    await page.getByRole('button', { name: 'Сохранить' }).click();

    await expect(page.getByRole('cell', { name: initialName })).toBeVisible();

    await page
      .locator('tr')
      .filter({ hasText: initialName })
      .getByRole('button', { name: 'Изменить' })
      .click();
    await page.getByLabel('Название').fill(editedName);
    await page.getByRole('button', { name: 'Сохранить' }).click();

    await expect(page.getByRole('cell', { name: editedName })).toBeVisible();

    page.once('dialog', (dialog) => dialog.accept());
    await page
      .locator('tr')
      .filter({ hasText: editedName })
      .getByRole('button', { name: 'Удалить' })
      .click();
    await expect(page.getByRole('cell', { name: editedName })).toHaveCount(0);
  });

  test('edits CMS contacts page and restores it', async ({ page, request }) => {
    const admin = await adminSession(request);
    const original = await (await request.get(`${API_URL}/pages/contacts`)).json() as {
      title: string;
      body: string;
    };
    const title = `Контакты E2E ${Date.now()}`;
    await authorizePage(page, admin);

    try {
      await page.goto('/admin/pages');
      await page.getByRole('button', { name: 'Контакты' }).click();
      await page.getByLabel('Заголовок').fill(title);
      await page.getByLabel('Содержимое (HTML)').fill('<p>E2E контакты обновлены</p>');
      await page.getByRole('button', { name: 'Сохранить' }).click();

      await expect(page.getByText('Сохранено')).toBeVisible();
      await page.goto('/contacts');
      await expect(page.getByRole('heading', { name: title })).toBeVisible();
      await expect(page.getByText('E2E контакты обновлены')).toBeVisible();
    } finally {
      await request.put(`${API_URL}/pages/contacts`, {
        headers: { Authorization: `Bearer ${admin.accessToken}` },
        data: original,
      });
    }
  });

  test('shows user bookings in admin bookings list', async ({ page, request }) => {
    const admin = await adminSession(request);
    const user = await createVerifiedUser(request);
    const { booking } = await createPaidBooking(request, user, {
      type: 'daily',
      startOffsetDays: 63,
    });
    await authorizePage(page, admin);

    await page.goto('/admin/bookings');

    await expect(page.getByRole('heading', { name: 'Бронирования' })).toBeVisible();
    const bookingRow = page.locator('tr').filter({ hasText: booking.entityName }).first();
    await expect(bookingRow).toBeVisible();
    await expect(bookingRow).toContainText('Подтверждено');
  });
});
