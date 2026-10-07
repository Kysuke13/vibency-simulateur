# Vibency Simulateur

Simulateur de budget et de conversions Google Ads. Une page statique : paramètres, mots-clés, funnel et indicateurs. Les simulations restent dans le navigateur (`localStorage`).

## Structure

```
.
├── index.html      # Page complète (HTML, CSS et JS)
├── .env            # URL et clé anon Supabase (non versionné)
├── build.js        # Produit config.js à partir du .env
├── netlify.toml    # Build : node build.js, publication à la racine
└── README.md
```

L’export HTML embarque les simulations choisies dans le fichier téléchargé, pour qu’un client puisse l’ouvrir seul. Le CSS et le JS restent donc dans `index.html`.

## Aperçu local

Copier `.env.example` vers `.env` et renseigner `SUPABASE_URL` et `SUPABASE_ANON_KEY`, puis :

```bash
node build.js
npx --yes serve -l 8123
```

Puis ouvrir http://localhost:8123

## Déploiement Netlify

1. Ce dépôt est sur GitHub.
2. Dans Netlify : **Add new site** → **Import an existing project** → GitHub → `vibency-simulateur`.
3. Variables d’environnement du site : `SUPABASE_URL` et `SUPABASE_ANON_KEY` (les mêmes que dans `.env`).
4. La commande de build est `node build.js`, le dossier publié est `.` (`netlify.toml`).
5. Déployer. Chaque push sur `main` redéploie le site.
