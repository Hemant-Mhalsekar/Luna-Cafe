import { randomBytes } from 'node:crypto';
import jwt from 'jsonwebtoken';
import type { CookieOptions } from 'express';
import { getEnv } from '../config/env.js';

export const AUTH_COOKIE = 'luna_admin';
const SESSION_HOURS = 8;

let devSecret: string | undefined;

/** Production requires JWT_SECRET (checked in env.ts). Locally a random one is used if it's missing. */
function secret(): string {
  const env = getEnv();
  if (env.JWT_SECRET && env.JWT_SECRET.length >= 32) return env.JWT_SECRET;
  if (!devSecret) {
    devSecret = randomBytes(48).toString('base64url');
    if (env.NODE_ENV === 'development') {
      console.warn('JWT_SECRET is not set: using a temporary one, so admin sessions end when the server restarts.');
    }
  }
  return devSecret;
}

export function signAdminToken(adminId: string): string {
  return jwt.sign({}, secret(), { subject: adminId, expiresIn: `${SESSION_HOURS}h`, algorithm: 'HS256' });
}

/** Returns the admin id and issue time (seconds), or null if the token is missing, expired or forged. */
export function verifyAdminToken(token: string | undefined): { adminId: string; issuedAt: number } | null {
  if (!token) return null;
  try {
    const payload = jwt.verify(token, secret(), { algorithms: ['HS256'] });
    if (typeof payload !== 'object' || !payload.sub || typeof payload.iat !== 'number') return null;
    return { adminId: payload.sub, issuedAt: payload.iat };
  } catch {
    return null;
  }
}

/** A session is stale if it was issued before the password last changed (JWT times are whole seconds). */
export function issuedBeforePasswordChange(issuedAt: number, passwordChangedAt: Date | null | undefined): boolean {
  return Boolean(passwordChangedAt) && issuedAt < Math.floor(passwordChangedAt!.getTime() / 1000);
}

export function authCookieOptions(): CookieOptions {
  const prod = getEnv().NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: prod,
    sameSite: 'lax',
    path: '/api',
    maxAge: SESSION_HOURS * 60 * 60 * 1000,
  };
}
