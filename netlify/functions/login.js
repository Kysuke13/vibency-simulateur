const { sign, cookieHeader, json, safeEqual, MAX_AGE } = require('../lib/session');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Méthode refusée' });
  const username = process.env.VIBENCY_USERNAME || '';
  const password = process.env.VIBENCY_PASSWORD || '';
  if (!username || !password || !process.env.SESSION_SECRET) {
    return json(500, { error: 'Connexion non configurée' });
  }
  let body = {};
  try { body = JSON.parse(event.body || '{}'); } catch (e) { body = {}; }
  const ok = safeEqual(String(body.username || '').trim(), username)
    && safeEqual(String(body.password || ''), password);
  if (!ok) return json(401, { error: 'Identifiant ou mot de passe incorrect' });
  const token = sign({ u: username, exp: Date.now() + MAX_AGE * 1000 });
  return json(200, { ok: true }, { 'Set-Cookie': cookieHeader(token, event) });
};
