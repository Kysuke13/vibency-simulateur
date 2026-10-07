# Vibency Simulateur

Simulateur de budget et de conversions Google Ads.

La page d’accueil `/` demande une connexion. Chaque simulation a aussi une page publique, par exemple `/notham-grenoble`, où l’on peut modifier cette simulation seulement.

Le nom est transformé en adresse : minuscules, sans accents, espaces remplacés par `-`. Renommer une simulation depuis le compte connecté met à jour cette adresse.

## Aperçu local

Renseigner `.env` (voir `.env.example`), appliquer la migration Supabase, puis :

```bash
node dev-server.js
```

Puis ouvrir http://localhost:8123. `netlify dev` convient aussi.

## Déploiement Netlify

Variables d’environnement du site :

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `VIBENCY_USERNAME`
- `VIBENCY_PASSWORD`
- `SESSION_SECRET`

Aucune commande de build. Le dossier publié est `.`. Les fonctions sont dans `netlify/functions`.

## Migration

```bash
supabase db push
```
