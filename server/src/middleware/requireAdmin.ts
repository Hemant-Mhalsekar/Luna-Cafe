import type { RequestHandler } from 'express';
import { Admin } from '../models/index.js';
import { AUTH_COOKIE, issuedBeforePasswordChange, verifyAdminToken } from '../lib/auth.js';
import { HttpError } from '../lib/httpError.js';

declare module 'express-serve-static-core' {
  interface Request {
    adminId?: string;
  }
}

/**
 * Checks the admin session cookie. POSTs must also be JSON: a plain HTML form on another site can only
 * send GET or POST with form encoding, so this (with SameSite=Lax cookies) blocks CSRF. PATCH and DELETE
 * from another site would need a CORS preflight, which the server does not allow.
 */
export const requireAdmin: RequestHandler = async (req, _res, next) => {
  if (req.method === 'POST' && !req.is('application/json')) {
    throw new HttpError(415, 'JSON_REQUIRED', 'Requests must be sent as JSON.');
  }
  const session = verifyAdminToken(req.cookies?.[AUTH_COOKIE]);
  const admin = session ? await Admin.findById(session.adminId).select('passwordChangedAt').lean() : null;
  if (!session || !admin || issuedBeforePasswordChange(session.issuedAt, admin.passwordChangedAt)) {
    throw new HttpError(401, 'UNAUTHENTICATED', 'Please sign in again.');
  }
  req.adminId = session.adminId;
  next();
};
