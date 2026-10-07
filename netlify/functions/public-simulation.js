const { json } = require('../lib/session');
const { toClient, rest } = require('../lib/sims');

function slugOf(event) {
  const params = event.queryStringParameters || {};
  return String(params.slug || '').toLowerCase();
}

exports.handler = async (event) => {
  const slug = slugOf(event);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return json(404, { error: 'Simulation introuvable' });
  try {
    if (event.httpMethod === 'GET') {
      const rows = await rest('simulations?slug=eq.' + encodeURIComponent(slug) + '&select=id,name,slug,keywords,params,updated_at');
      if (!rows || !rows.length) return json(404, { error: 'Simulation introuvable' });
      return json(200, toClient(rows[0]));
    }
    if (event.httpMethod === 'PUT') {
      const body = JSON.parse(event.body || '{}');
      const rows = await rest('simulations?slug=eq.' + encodeURIComponent(slug), {
        method: 'PATCH',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify({
          keywords: Array.isArray(body.keywords) ? body.keywords : [],
          params: body.params && typeof body.params === 'object' ? body.params : {},
          updated_at: new Date().toISOString(),
        }),
      });
      if (!rows || !rows.length) return json(404, { error: 'Simulation introuvable' });
      return json(200, toClient(rows[0]));
    }
    return json(405, { error: 'Méthode refusée' });
  } catch (err) {
    return json(500, { error: 'Simulation indisponible' });
  }
};
