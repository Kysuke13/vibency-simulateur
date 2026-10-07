# Vibency Simulateur

Simulateur de budget et de conversions Google Ads. Une page statique : paramètres, mots-clés, funnel et indicateurs. Les simulations restent dans le navigateur (`localStorage`).

## Structure

```
.
├── index.html      # Page complète (HTML, CSS et JS)
├── netlify.toml    # Publication à la racine, sans build
└── README.md
```

L’export HTML embarque les simulations choisies dans le fichier téléchargé, pour qu’un client puisse l’ouvrir seul. Le CSS et le JS restent donc dans `index.html`.

## Aperçu local

```bash
npx --yes serve -l 8123
```

Puis ouvrir http://localhost:8123

## Déploiement Netlify

1. Ce dépôt est sur GitHub.
2. Dans Netlify : **Add new site** → **Import an existing project** → GitHub → `vibency-simulateur`.
3. Laisser la commande de build vide. Le dossier publié est `.` (`netlify.toml`).
4. Déployer. Chaque push sur `main` redéploie le site.

Aucune variable d’environnement n’est nécessaire.
