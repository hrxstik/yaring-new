import { expect, test } from '@playwright/test';

test.describe('public site', () => {
  test('renders home page and primary navigation', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { name: 'База отдыха «Яринг»' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Почему выбирают Яринг' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Объекты для бронирования' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Цены' })).toHaveCount(0);
    await expect(page.getByRole('link', { name: 'Бронирование' }).first()).toBeVisible();

    const headerBox = await page.locator('.header').boundingBox();
    const titleBox = await page.getByRole('heading', { name: 'База отдыха «Яринг»' }).boundingBox();
    expect(headerBox && titleBox && headerBox.y + headerBox.height < titleBox.y).toBeTruthy();
  });

  test('shows contacts page with Yandex map marker coordinates', async ({ page }) => {
    await page.goto('/contacts');

    await expect(page.getByRole('heading', { name: 'Как нас найти' })).toBeVisible();
    const map = page.locator('iframe[title="Карта — Яринг"]').first();
    await expect(map).toBeVisible();
    await expect(map).toHaveAttribute('src', /ll=37\.521514%2C56\.557858/);
    await expect(map).toHaveAttribute('src', /z=18\.17/);
  });

  test('switches visual theme', async ({ page }) => {
    await page.goto('/');

    const before = await page.locator('html').getAttribute('data-theme');
    await page.getByRole('button', { name: 'Переключить тему' }).first().click();
    await expect
      .poll(() => page.locator('html').getAttribute('data-theme'))
      .not.toBe(before);
  });

  test('redirects guest from booking flow to login', async ({ page }) => {
    await page.goto('/booking');
    await page.getByRole('button', { name: 'Забронировать' }).first().click();

    await expect(page).toHaveURL(/\/login\?redirect=\/booking\?entity=/);
    await expect(page.getByRole('heading', { name: 'Вход' })).toBeVisible();
  });
});
