const fs = require('fs');
const path = require('path');

function loadEnv(file) {
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnv(path.join(__dirname, '.env'));

const url = process.env.SUPABASE_URL || '';
const anonKey = process.env.SUPABASE_ANON_KEY || '';
if (!url || !anonKey) {
  console.error('SUPABASE_URL et SUPABASE_ANON_KEY sont requis dans .env, ou dans les variables Netlify.');
  process.exit(1);
}

const config = 'window.VIBENCY_SUPABASE = ' + JSON.stringify({ url, anonKey }) + ';\n';
fs.writeFileSync(path.join(__dirname, 'config.js'), config);
console.log('config.js généré');
