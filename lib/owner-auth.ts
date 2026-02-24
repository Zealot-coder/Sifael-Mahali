import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import type { NextRequest } from 'next/server';

export const OWNER_SESSION_COOKIE = 'owner_session';
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 14;

function getSecret() {
  return (
    process.env.OWNER_SESSION_SECRET ??
    process.env.OWNER_PASSWORD ??
    'owner-session-fallback-secret'
  );
}

function createSignature(payload: string) {
  return createHmac('sha256', getSecret()).update(payload).digest('base64url');
}

export function createOwnerSessionToken() {
  const payload = JSON.stringify({
    iat: Date.now(),
    nonce: randomUUID()
  });
  const encodedPayload = Buffer.from(payload).toString('base64url');
  const signature = createSignature(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

export function verifyOwnerSessionToken(token?: string | null) {
  if (!token) return false;

  const [encodedPayload, signature] = token.split('.');
  if (!encodedPayload || !signature) return false;

  const expected = createSignature(encodedPayload);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;

  try {
    const payload = JSON.parse(
      Buffer.from(encodedPayload, 'base64url').toString('utf8')
    ) as { iat?: number };

    if (!payload.iat) return false;
    const ageSeconds = (Date.now() - payload.iat) / 1000;
    return ageSeconds <= SESSION_MAX_AGE_SECONDS;
  } catch {
    return false;
  }
}

export function isOwnerAuthenticated(request: NextRequest) {
  return verifyOwnerSessionToken(request.cookies.get(OWNER_SESSION_COOKIE)?.value);
}

export function hasOwnerPasswordConfigured() {
  return Boolean(process.env.OWNER_PASSWORD);
}

export function isOwnerPasswordValid(password: string) {
  const configured = process.env.OWNER_PASSWORD;
  if (!configured) return false;

  const a = Buffer.from(password);
  const b = Buffer.from(configured);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function getOwnerSessionCookieMaxAge() {
  return SESSION_MAX_AGE_SECONDS;
}
