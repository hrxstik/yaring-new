import { expect, test } from '@playwright/test';
import { uniquePhone } from './helpers';

test.describe('auth', () => {
  test('logs in with admin credentials and opens profile', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel('Телефон').fill('+79990000000');
    await page.getByLabel('Пароль').fill('admin123');
    await page.getByRole('main').getByRole('button', { name: 'Войти' }).click();

    await expect(page).toHaveURL(/\/profile/);
    await expect(page.getByRole('heading', { name: 'Личный кабинет' })).toBeVisible();
    await expect(page.getByText('79990000000')).toBeVisible();
  });

  test('shows validation message for wrong credentials', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel('Телефон').fill(uniquePhone());
    await page.getByLabel('Пароль').fill('bad-password');
    await page.getByRole('main').getByRole('button', { name: 'Войти' }).click();

    await expect(page.getByText('Неверный телефон или пароль')).toBeVisible();
  });

  test('registers a new visitor and opens phone verification step', async ({ page }) => {
    const phone = uniquePhone();

    await page.goto('/register');
    await page.getByLabel('Имя').fill('Новый гость');
    await page.getByLabel('Телефон').fill(phone);
    await page.getByLabel('Пароль').fill('User12345!');
    await page.getByRole('button', { name: 'Зарегистрироваться' }).click();

    await expect(page.getByRole('heading', { name: 'Подтверждение телефона' })).toBeVisible();
    await expect(page.getByText(`Код отправлен на ${phone}`)).toBeVisible();
    await expect(page.getByLabel('Код из SMS')).toBeVisible();
  });
});
