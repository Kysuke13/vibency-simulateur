const RESERVED = new Set([
  'api', 'index', 'index.html', 'config.js', 'assets', 'netlify',
  'favicon.ico', 'robots.txt', 'login', 'sitemap.xml',
]);

function slugify(name) {
  const base = String(name || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  if (!base || RESERVED.has(base)) return 'simulation';
  return base;
}

function toClient(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name || '',
    slug: row.slug || '',
    keywords: Array.isArray(row.keywords) ? row.keywords : [],
    params: row.params && typeof row.params === 'object' ? row.params : {},
    updatedAt: row.updated_at ? new Date(row.updated_at).getTime() : Date.now(),
  };
}

async function rest(path, options) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    const err = new Error('Configuration Supabase manquante');
    err.status = 500;
    throw err;
  }
  const res = await fetch(url.replace(/\/$/, '') + '/rest/v1/' + path, {
    method: (options && options.method) || 'GET',
    headers: {
      apikey: key,
      Authorization: 'Bearer ' + key,
      'Content-Type': 'application/json',
      ...(options && options.headers ? options.headers : {}),
    },
    body: options && options.body ? options.body : undefined,
  });
  const text = await res.text();
  let data = null;
  if (text) {
    try { data = JSON.parse(text); } catch (e) { data = { message: text }; }
  }
  if (!res.ok) {
    const err = new Error((data && data.message) || res.statusText);
    err.status = res.status;
    throw err;
  }
  return data;
}

async function uniqueSlug(base, exceptId) {
  let slug = base;
  let n = 2;
  for (;;) {
    const rows = await rest('simulations?slug=eq.' + encodeURIComponent(slug) + '&select=id');
    const taken = (rows || []).some(row => row.id !== exceptId);
    if (!taken) return slug;
    slug = base + '-' + n;
    n += 1;
  }
}

module.exports = { slugify, toClient, rest, uniqueSlug };
