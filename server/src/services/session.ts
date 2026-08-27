import crypto from 'crypto';
import { AuthPayload } from '../types.js';

const secret = process.env.AUTH_SECRET || 'aitu-development-secret-change-in-production';

const encode = (value: string) => Buffer.from(value).toString('base64url');

export const createSessionToken = (payload: Omit<AuthPayload, 'expiresAt'>, ttlSeconds = 60 * 60 * 8) => {
  const complete: AuthPayload = { ...payload, expiresAt: Math.floor(Date.now() / 1000) + ttlSeconds };
  const body = encode(JSON.stringify(complete));
  const signature = crypto.createHmac('sha256', secret).update(body).digest('base64url');
  return `${body}.${signature}`;
};

export const verifySessionToken = (token: string): AuthPayload | null => {
  const [body, signature] = token.split('.');
  if (!body || !signature) return null;
  const expected = crypto.createHmac('sha256', secret).update(body).digest();
  const actual = Buffer.from(signature, 'base64url');
  if (expected.length !== actual.length || !crypto.timingSafeEqual(expected, actual)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as AuthPayload;
    if (payload.expiresAt <= Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
};
