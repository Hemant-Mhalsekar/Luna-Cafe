import { describe, expect, it } from 'vitest';
import { ApiError, isWakingUp, retryWhileWaking, retryWriteWhileWaking } from './api';

const err = (status: number) => new ApiError(status, 'X', 'x');

describe('cold-start retry policy', () => {
  it('treats network errors and 502/503/504 as "still waking up"', () => {
    expect([0, 502, 503, 504].every((s) => isWakingUp(err(s)))).toBe(true);
    expect([400, 401, 404, 409, 500].some((s) => isWakingUp(err(s)))).toBe(false);
  });

  it('keeps reading for about two and a half minutes while waking', () => {
    expect(retryWhileWaking(29, err(502))).toBe(true);
    expect(retryWhileWaking(30, err(502))).toBe(false);
  });

  it('does not retry client errors, retries a server error once', () => {
    expect(retryWhileWaking(0, err(401))).toBe(false);
    expect(retryWhileWaking(0, err(404))).toBe(false);
    expect(retryWhileWaking(0, err(500))).toBe(true);
    expect(retryWhileWaking(1, err(500))).toBe(false);
  });

  it('only retries writes that never reached the app', () => {
    expect(retryWriteWhileWaking(0, err(503))).toBe(true);
    expect(retryWriteWhileWaking(0, err(0))).toBe(true);
    expect(retryWriteWhileWaking(0, err(504))).toBe(false); // may have been saved
    expect(retryWriteWhileWaking(0, err(409))).toBe(false);
    expect(retryWriteWhileWaking(0, err(500))).toBe(false);
  });
});
