# Site Kiro - Help Center

Mini-site statique en white mode pour l’application de rencontre Kiro. Il utilise les langages les plus courants pour ce type de site: HTML, CSS et JavaScript.

## Structure

- `index.html`: landing page du centre d’aide Kiro.
- `conditions-utilisation.html`: conditions d’utilisation structurées par sections.
- `politique-confidentialite.html`: politique de confidentialité détaillée (exigée par l’App Store et Google Play).
- `support.html`: FAQ filtrable, recherche, plans et coordonnées de contact.
- `assets/css/styles.css`: design system « Kiro Solid » (jetons en tête de fichier, puis composants).
- `assets/js/main.js`: menu mobile plein écran, recherche et filtres FAQ, sommaire des pages légales (amélioration progressive).
- `assets/img/kiro-symbol-red.svg`: symbole Kiro rouge (#F01C43) utilisé dans l’en-tête.
- `assets/img/kiro-symbol.svg`: symbole Kiro noir, utilisé comme favicon.
- `assets/img/kiro-wordmark.svg`: wordmark Kiro noir généré depuis le logo officiel.

## À personnaliser avant publication

- Point de contact public confirmé : `contact@kirosocial.com` (général) et `support@kirosocial.com` (support). ✅
- Plans confirmés : Gratuit, Standard, Premium, Max (prix affichés dans l’app font foi). ✅
- Politique de confidentialité créée (`politique-confidentialite.html`). ✅
- Ajouter le nom légal de l’éditeur, la juridiction applicable, le responsable de la protection des renseignements personnels (Loi 25) et la mention de copyright — voir les marqueurs `[À CONFIRMER: …]` dans les pages.
- Faire relire les conditions d’utilisation ET la politique de confidentialité par un professionnel du droit.
- Lien de suppression de compte pour Google Play : `support.html#supprimer-compte`.

## Vérifications locales

- `node scripts/check-contract.mjs` : contrat à ne pas casser (URL, ancres dont `#supprimer-compte`, textes légaux et FAQ mot pour mot, `?q=`, `<head>`, poids CSS + JS). Aucune dépendance.
- `node scripts/serve.mjs` : sert le site sur http://127.0.0.1:4173 comme Vercel (`cleanUrls`, `trailingSlash: false`, page 404).
- `scripts/` et `docs/` ne sont pas publiés (`.vercelignore`).

## Déploiement

Le site est statique. Tu peux héberger le dossier avec Netlify, Vercel, GitHub Pages, Cloudflare Pages, Firebase Hosting ou n’importe quel hébergement web classique.
