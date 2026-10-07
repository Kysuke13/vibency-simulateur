const { cookieHeader, json } = require('../lib/session');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Méthode refusée' });
  return json(200, { ok: true }, { 'Set-Cookie': cookieHeader('', event) });
};
