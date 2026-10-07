const { sessionFromEvent, json } = require('../lib/session');

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') return json(405, { error: 'Méthode refusée' });
  const session = sessionFromEvent(event);
  if (!session) return json(401, { ok: false });
  return json(200, { ok: true });
};
