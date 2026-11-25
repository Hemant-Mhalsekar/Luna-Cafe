import { expect, test } from '@playwright/test';
import { signInAsAdmin, uniqueName } from './helpers';

test('the game quiz suggests three games that seat the group', async ({ page }) => {
  await page.goto('/games');
  const quiz = page.locator('#quiz');
  await quiz.getByRole('button', { name: /3 or 4/ }).click();
  await quiz.getByRole('button', { name: /About an hour/ }).click();
  await quiz.getByRole('button', { name: /Brainy/ }).click();
  await expect(quiz.getByRole('heading', { name: 'Your Luna table matches' })).toBeVisible();
  await expect(quiz.getByRole('listitem')).toHaveCount(3);
  await expect(quiz.getByRole('link', { name: /Book a table for/ })).toBeVisible();
});

test('game filters live in the URL and survive a reload', async ({ page }) => {
  await page.goto('/games');
  await page.getByLabel('How many players?').selectOption('6');
  await page.getByRole('button', { name: 'silly', exact: true }).click();
  await expect(page).toHaveURL(/players=6/);
  await expect(page).toHaveURL(/mood=silly/);
  const count = page.getByText(/\d+ of \d+ games/);
  const before = await count.textContent();
  await page.reload();
  await expect(count).toHaveText(before!);
});

test('a contact message reaches the admin inbox', async ({ page }) => {
  const name = uniqueName('Ravi');
  await page.goto('/contact');
  await page.getByLabel('Name').fill(name);
  await page.getByLabel('Email').fill('ravi@example.com');
  await page.getByLabel('Message').fill('Can we book the whole café for a birthday on a Saturday?');
  await page.getByRole('button', { name: 'Send message' }).click();
  await expect(page.getByText('Thanks, message received!')).toBeVisible();

  await signInAsAdmin(page, '/admin/messages');
  await expect(page.getByText(name)).toBeVisible();
});

test('the admin dashboard lists the latest bookings with when they were made', async ({ page, request }) => {
  const name = uniqueName('Latest');
  const d = new Date(Date.now() + 330 * 60_000);
  d.setUTCDate(d.getUTCDate() + 9);
  while (d.getUTCDay() === 1) d.setUTCDate(d.getUTCDate() + 1);
  const res = await request.post('/api/reservations', {
    data: { name, email: 'latest@example.com', phone: '+91 98200 33333', date: d.toISOString().slice(0, 10), slotId: '1130', partySize: 2 },
  });
  expect(res.status()).toBe(201);
  await signInAsAdmin(page, '/admin');
  const card = page.getByRole('listitem').filter({ hasText: name });
  await expect(card).toContainText('11:30');
  await expect(card).toContainText(/Booked \d{1,2} \w{3}, \d{2}:\d{2}/);
});

test('admin pages need a session', async ({ page }) => {
  await page.goto('/admin/games');
  await expect(page).toHaveURL(/\/admin\/login\?next=%2Fadmin%2Fgames/);
  await page.getByLabel('Email').fill('admin@lunacafe.local');
  await page.getByLabel('Password').fill('definitely-wrong');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByText('Email or password is incorrect.')).toBeVisible();
});
