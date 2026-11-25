import { expect, test } from '@playwright/test';
import { openDayAhead, signInAsAdmin, uniqueName } from './helpers';

test('a visitor books a table with a game, and staff can cancel it', async ({ page, isMobile }) => {
  const name = uniqueName('Asha');
  const date = openDayAhead(isMobile ? 4 : 3);

  // Arrive from a game: the booking form preselects it.
  await page.goto('/book?game=catan');
  await expect(page.getByRole('heading', { name: 'Your table is waiting' })).toBeVisible();
  await expect(page.getByLabel('Reserve a game (optional)')).toHaveValue('catan');

  await page.getByLabel('Date').fill(date);
  await page.getByRole('button', { name: 'One more guest' }).click();
  await page.getByRole('button', { name: 'One more guest' }).click();
  await expect(page.locator('output')).toHaveText('4');

  // First free time on that day.
  const slot = page.locator('label:has(input[name="slot"]:not([disabled]))').first();
  await expect(slot).toBeVisible();
  const time = (await slot.locator('span').first().textContent())!.trim();
  await slot.click();

  await page.getByLabel('Name').fill(name);
  await page.getByLabel('Email').fill('asha@example.com');
  await page.getByLabel('Phone').fill('+91 98200 00000');
  await page.getByRole('button', { name: 'Book this table' }).click();

  await expect(page.getByRole('heading', { name: 'Table reserved!' })).toBeVisible();
  const code = await page.getByText(/^LUNA-[2-9A-HJ-NP-Z]{5}$/).textContent();
  expect(code).toMatch(/^LUNA-/);
  await expect(page.getByText('Catan')).toBeVisible();
  await expect(page.getByText(`${time} (90 min)`)).toBeVisible();

  if (isMobile) return; // the admin part runs once, on desktop

  // Staff side: the booking is listed and can be cancelled.
  await signInAsAdmin(page, '/admin/reservations');
  await page.getByLabel('From').fill(date);
  await page.getByLabel('To').fill(date);
  const row = page.getByRole('row', { name: new RegExp(name) });
  await expect(row).toContainText(code!);
  await row.getByRole('button', { name: 'Cancel' }).click();
  await page.getByRole('button', { name: 'Cancel booking' }).click();
  await expect(row).toBeHidden(); // the list shows confirmed bookings by default
  await page.getByLabel('Status').selectOption('cancelled');
  await expect(page.getByRole('row', { name: new RegExp(name) })).toContainText('Cancelled');
});

test('a fully booked time shows as full and cannot be picked', async ({ page, request }) => {
  // The 8-seat table is the only one for 8 people: book it, then try again.
  const date = openDayAhead(5);
  const body = { name: 'Big Group', email: 'big@example.com', phone: '+91 98200 11111', date, slotId: '2030', partySize: 8 };
  const first = await request.post('/api/reservations', { data: body });
  expect([201, 409]).toContain(first.status()); // 409 if a previous run already took it

  await page.goto('/book');
  await page.getByLabel('Date').fill(date);
  for (let i = 0; i < 6; i++) await page.getByRole('button', { name: 'One more guest' }).click();
  const late = page.locator('label', { has: page.locator('input[value="2030"]') });
  await expect(late).toContainText('Full');
  await expect(late.locator('input')).toBeDisabled();
});

test('a game reserved at a time shows as taken for that time', async ({ page, request, isMobile }) => {
  const date = openDayAhead(isMobile ? 7 : 6);
  const games = (await (await request.get('/api/games')).json()).games as { _id: string; slug: string; name: string }[];
  const azul = games.find((g) => g.slug === 'azul')!;
  const first = await request.post('/api/reservations', {
    data: { name: 'Game Lover', email: 'games@example.com', phone: '+91 98200 22222', date, slotId: '1600', partySize: 2, gameId: azul._id },
  });
  expect([201, 409]).toContain(first.status()); // 409 if a previous run already holds it

  await page.goto('/book?game=azul');
  await page.getByLabel('Date').fill(date);
  await page.locator('label', { has: page.locator('input[value="1600"]') }).click();
  await expect(page.getByText('Azul is already reserved at 16:00')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Book this table' })).toBeDisabled();
  // Another time is fine.
  await page.locator('label', { has: page.locator('input[value="1730"]') }).click();
  await expect(page.getByText('Azul is already reserved')).toBeHidden();
  await expect(page.getByRole('button', { name: 'Book this table' })).toBeEnabled();
});
