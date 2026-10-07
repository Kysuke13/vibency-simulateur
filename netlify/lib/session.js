const crypto = require('crypto');

const COOKIE = 'vibency_session';
const MAX_AGE = 60 * 60 * 24 * 14;

function secret() {
  return process.env.SESSION_SECRET || '';
}

function sign(payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', secret()).update(body).digest('base64url');
  return body + '.' + sig;
}

function verify(token) {
  if (!token || !secret()) return null;
  const dot = token.lastIndexOf('.');
  if (dot === -1) return null;
  const body = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = crypto.createHmac('sha256', secret()).update(body).digest('base64url');
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (!payload || payload.exp < Date.now()) return null;
    return payload;
  } catch (e) {
    return null;
  }
}

function readCookie(header, name) {
  if (!header) return '';
  const parts = header.split(';');
  for (const part of parts) {
    const i = part.indexOf('=');
    if (i === -1) continue;
    if (part.slice(0, i).trim() === name) return decodeURIComponent(part.slice(i + 1).trim());
  }
  return '';
}

function sessionFromEvent(event) {
  const headers = event.headers || {};
  const raw = headers.cookie || headers.Cookie || '';
  return verify(readCookie(raw, COOKIE));
}

function cookieHeader(token, event) {
  const proto = ((event.headers || {})['x-forwarded-proto'] || '').split(',')[0].trim();
  const secure = proto === 'https' ? '; Secure' : '';
  const value = token
    ? COOKIE + '=' + token + '; HttpOnly; Path=/; Max-Age=' + MAX_AGE + '; SameSite=Lax' + secure
    : COOKIE + '=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax' + secure;
  return value;
}

function json(statusCode, body, extraHeaders) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      ...(extraHeaders || {}),
    },
    body: JSON.stringify(body),
  };
}

function safeEqual(a, b) {
  const left = Buffer.from(String(a));
  const right = Buffer.from(String(b));
  if (left.length !== right.length) {
    crypto.timingSafeEqual(left, left);
    return false;
  }
  return crypto.timingSafeEqual(left, right);
}

module.exports = {
  COOKIE,
  MAX_AGE,
  sign,
  verify,
  sessionFromEvent,
  cookieHeader,
  json,
  safeEqual,
};
