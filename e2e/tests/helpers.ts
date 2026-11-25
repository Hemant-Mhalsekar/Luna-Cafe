import { expect, type Page } from '@playwright/test';

/** An open day (not Monday) a few days ahead, in café time (UTC+5:30), as YYYY-MM-DD. */
export function openDayAhead(days = 3): string {
  const d = new Date(Date.now() + 330 * 60_000);
  d.setUTCDate(d.getUTCDate() + days);
  while (d.getUTCDay() === 1) d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

export const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'admin@lunacafe.local';
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? '';

export async function signInAsAdmin(page: Page, next = '/admin') {
  await page.goto(next);
  await expect(page).toHaveURL(/\/admin\/login/);
  await page.getByLabel('Email').fill(ADMIN_EMAIL);
  await page.getByLabel('Password').fill(ADMIN_PASSWORD);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByRole('navigation', { name: 'Admin' })).toBeVisible();
}

/** A name nobody else will have, so parallel runs and retries don't confuse each other. */
export const uniqueName = (first: string) => `${first} ${Date.now().toString(36).toUpperCase()}`;
