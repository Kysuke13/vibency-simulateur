const http = require('http');
const fs = require('fs');
const path = require('path');

for (const line of fs.readFileSync(path.join(__dirname, '.env'), 'utf8').split(/\r?\n/)) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eq = trimmed.indexOf('=');
  if (eq === -1) continue;
  const key = trimmed.slice(0, eq);
  if (!process.env[key]) process.env[key] = trimmed.slice(eq + 1);
}

const functions = {
  login: require('./netlify/functions/login'),
  logout: require('./netlify/functions/logout'),
  session: require('./netlify/functions/session'),
  simulations: require('./netlify/functions/simulations'),
  'public-simulation': require('./netlify/functions/public-simulation'),
};

const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
};

function readBody(req) {
  return new Promise(resolve => {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (url.pathname.startsWith('/api/')) {
    const name = url.pathname.slice('/api/'.length);
    const fn = functions[name];
    if (!fn) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Introuvable' }));
      return;
    }
    const query = {};
    url.searchParams.forEach((value, key) => { query[key] = value; });
    const result = await fn.handler({
      httpMethod: req.method,
      headers: req.headers,
      queryStringParameters: query,
      body: await readBody(req),
    });
    res.writeHead(result.statusCode, result.headers || {});
    res.end(result.body || '');
    return;
  }

  let filePath = path.join(__dirname, decodeURIComponent(url.pathname));
  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403);
    res.end();
    return;
  }
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) filePath = path.join(__dirname, 'index.html');
  res.writeHead(200, { 'Content-Type': types[path.extname(filePath)] || 'application/octet-stream' });
  fs.createReadStream(filePath).pipe(res);
});

const port = Number(process.env.PORT) || 8123;
server.listen(port, () => {
  console.log('http://localhost:' + port);
});
