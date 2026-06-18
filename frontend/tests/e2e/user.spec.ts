import { expect, test } from '@playwright/test';
import {
  authorizePage,
  cancelBooking,
  createPaidBooking,
  createVerifiedUser,
} from './helpers';

test.describe('user scenarios', () => {
  test('opens profile for authenticated user', async ({ page, request }) => {
    const user = await createVerifiedUser(request);
    await authorizePage(page, user);

    await page.goto('/profile');

    await expect(page.getByRole('heading', { name: 'Личный кабинет' })).toBeVisible();
    await expect(page.getByText(user.user.phone)).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Мои бронирования' })).toBeVisible();
  });

  test('shows paid daily booking in profile', async ({ page, request }) => {
    const user = await createVerifiedUser(request);
    const { booking } = await createPaidBooking(request, user, {
      type: 'daily',
      startOffsetDays: 21,
    });
    await authorizePage(page, user);

    await page.goto('/profile?booked=1');

    await expect(page.getByText('Бронирование успешно оплачено!')).toBeVisible();
    await expect(page.getByText(booking.entityName)).toBeVisible();
    await expect(page.getByText('Подтверждено')).toBeVisible();
  });

  test('shows paid hourly booking with time range in profile', async ({ page, request }) => {
    const user = await createVerifiedUser(request);
    const { booking } = await createPaidBooking(request, user, {
      type: 'hourly',
      startOffsetDays: 35,
    });
    await authorizePage(page, user);

    await page.goto('/profile');

    const bookingCard = page.locator('.booking-item').filter({ hasText: booking.entityName });
    await expect(bookingCard).toBeVisible();
    await expect(bookingCard).toContainText('10:00 — 12:00');
    await expect(bookingCard).toContainText('Подтверждено');
  });

  test('cancels own confirmed booking from profile', async ({ page, request }) => {
    const user = await createVerifiedUser(request);
    const { booking } = await createPaidBooking(request, user, {
      type: 'daily',
      startOffsetDays: 49,
    });
    await authorizePage(page, user);

    await page.goto('/profile');
    page.once('dialog', (dialog) => dialog.accept());
    await page
      .locator('.booking-item')
      .filter({ hasText: booking.entityName })
      .getByRole('button', { name: 'Отменить' })
      .click();

    await expect(
      page.locator('.booking-item').filter({ hasText: booking.entityName }),
    ).toContainText('Отменено');

    await cancelBooking(request, user, booking.id).catch(() => undefined);
  });
});
