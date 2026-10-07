const { sessionFromEvent, json } = require('../lib/session');
const { slugify, toClient, rest, uniqueSlug } = require('../lib/sims');

function guard(event) {
  if (!sessionFromEvent(event)) return json(401, { error: 'Connexion requise' });
  return null;
}

exports.handler = async (event) => {
  const denied = guard(event);
  if (denied) return denied;
  try {
    if (event.httpMethod === 'GET') {
      const rows = await rest('simulations?select=id,name,slug,keywords,params,updated_at&order=updated_at.asc');
      return json(200, { simulations: (rows || []).map(toClient) });
    }
    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body || '{}');
      const name = String(body.name || '').trim() || 'Simulation';
      const slug = await uniqueSlug(slugify(name));
      const id = 'sim_' + Date.now();
      const rows = await rest('simulations', {
        method: 'POST',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify({
          id,
          name,
          slug,
          keywords: Array.isArray(body.keywords) ? body.keywords : [],
          params: body.params && typeof body.params === 'object' ? body.params : {},
          updated_at: new Date().toISOString(),
        }),
      });
      return json(200, toClient(rows && rows[0]));
    }
    if (event.httpMethod === 'PUT') {
      const body = JSON.parse(event.body || '{}');
      const id = String(body.id || '');
      if (!id) return json(400, { error: 'Simulation manquante' });
      const name = String(body.name || '').trim() || 'Simulation';
      const slug = await uniqueSlug(slugify(name), id);
      const rows = await rest('simulations?id=eq.' + encodeURIComponent(id), {
        method: 'PATCH',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify({
          name,
          slug,
          keywords: Array.isArray(body.keywords) ? body.keywords : [],
          params: body.params && typeof body.params === 'object' ? body.params : {},
          updated_at: new Date().toISOString(),
        }),
      });
      if (!rows || !rows.length) return json(404, { error: 'Simulation introuvable' });
      return json(200, toClient(rows[0]));
    }
    if (event.httpMethod === 'DELETE') {
      const params = event.queryStringParameters || {};
      const id = String(params.id || '');
      if (!id) return json(400, { error: 'Simulation manquante' });
      await rest('simulations?id=eq.' + encodeURIComponent(id), { method: 'DELETE' });
      return json(200, { ok: true });
    }
    return json(405, { error: 'Méthode refusée' });
  } catch (err) {
    return json(err.status && err.status < 500 ? err.status : 500, { error: 'Enregistrement impossible' });
  }
};
