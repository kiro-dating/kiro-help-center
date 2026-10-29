# Refonte « Kiro Solid » du centre d'aide (aide.kirodating.com)

| Champ | Valeur |
|---|---|
| Identifiant | **HELP-REFONTE-2026-10-29** |
| Titre | Refonte visuelle du centre d'aide selon les maquettes « Kiro Solid » |
| Date | 2026-10-29 |
| Type | Refonte UI (site statique) + contrat de non-régression |
| Auteur / agent | Claude Code (Opus 5.5), agent A « centre d'aide », Guardian v2.1.0 |
| Dépôt | `kiro-dating/kiro-help-center` (clone local isolé, **aucun remote configuré**) |
| Chemin du clone | `/home/claude/kiro/A-help/kiro-help-center-refonte` (environnement Claude, pas le Mac de Pierre) |
| Branche | `claude/aide-refonte` (créée depuis `main`) ; branche optionnelle `claude/aide-refonte-seo` (§ 12) |
| Commit de référence (départ) | `e8059a2` (`main`, « style(help): finitions FAQ et page 404 ») |
| Dernier commit de code validé | `d0ab183` (après la revue indépendante, cycle 1) ; la pointe de branche est le commit de mise à jour de ce rapport (SHA dans `HANDOFF_FOR_REVIEW.md`) |
| Module(s) | `index.html`, `support.html`, `conditions-utilisation.html`, `politique-confidentialite.html`, `securite-enfants.html`, `404.html`, `assets/css/styles.css`, `assets/js/main.js`, `assets/img/` |
| Priorité | P2 (présentation ; aucune donnée ni backend) |
| Statut | **IMPLÉMENTÉ + TESTÉ (local), NON POUSSÉ, NON DÉPLOYÉ** |
| Conclusions | Refonte complète des 6 pages ; contrat 132/132 avant et après ; Inter hébergée sur le site, **aucune requête vers un tiers** ; Lighthouse mobile `/support` 100/100/100/100, `/conditions-utilisation` 99–100/100/100/100 (3 passages, rien de bloqué) ; aucune régression d'URL, d'ancre ni de texte juridique détectée |
| Actions | Revue de Pierre (captures + comparaisons), décision sur la branche SEO, vérification sur appareils réels, puis push sur `main` par Pierre |
| Tickets associés | SITE-SEO-2026-10-29 (patch `help.patch`, décision en attente) |
| Commits correctifs | 22 commits locaux (dont 4 de la revue, cycle 1, et 2 de rapport), § 3 |
| Tests de validation | `node scripts/check-contract.mjs` (132/132), validation Playwright 6 pages × 7 largeurs, axe-core, Lighthouse |
| État de déploiement | **NON EFFECTUÉ** (aucun push, aucun déploiement Vercel) |
| Dernière vérification | 2026-10-29 (UTC), après la revue indépendante (cycle 1) |
| Prochaine action | Pierre relit les captures `work/captures/comparaisons/`, puis décide GO / NO-GO et le sort de `claude/aide-refonte-seo` |

## 0. Déclaration de départ (Guardian § 0)

- Agent : Claude Code (Opus 5.5), agent A, sous-traitant de l'orchestrateur ; Pierre absent pendant l'intervention.
- Projet : centre d'aide Kiro, clone indépendant `/home/claude/kiro/A-help/kiro-help-center-refonte` (règle 1 : un agent = un clone ; les agents B et C travaillent dans d'autres dossiers, non lus ni modifiés).
- Branche `claude/aide-refonte`, SHA de départ `e8059a2`, état initial `## claude/aide-refonte` sans modification (clone propre).
- Périmètre : présentation des 6 pages du centre d'aide (HTML, CSS, JS), ajout d'outils de vérification sans dépendance. Plateforme : web (mobile d'abord).
- Interdits respectés : texte juridique, FAQ, `<title>`, meta description, canonical, `robots.txt`, `sitemap.xml`, `vercel.json` inchangés ; aucun push, merge, rebase, tag, reset, clean, déploiement ; `help.patch` non appliqué sur cette branche.
- Responsable de l'intégration : Pierre.

**État préexistant à signaler (non touché).** Sur le Mac de Pierre, le dossier d'origine (`Kiro_tech/outputs/qna-rencontre-site`) contient une suppression **non commitée** de `assets/img/kiro_red.png` et un dossier `_to_delete/` (anciens verrous Git). Ce clone part d'un bundle de `main` : il ne contient ni l'une ni l'autre. `kiro_red.png` est toujours suivi par Git dans `main` et dans cette branche ; je ne l'ai ni supprimé ni modifié. Il n'est référencé par aucune page.

## 1. Résumé

| Page | Avant | Après |
|---|---|---|
| Toutes | En-tête à symbole noir, menu mobile avec voile flouté (`backdrop-filter`), bouton flottant « ↑ », Inter déclarée mais jamais chargée | En-tête Kiro Solid commun (symbole rouge `#F01C43`, logotype, pastille « AIDE », navigation FAQ · Sécurité · Confidentialité · Conditions · Contact, bouton « kirodating.com ↗ »), menu mobile plein écran opaque qui piège le focus, Échap le ferme et rend le focus au bouton ; pied de page commun ; Inter **hébergée sur le site** (`assets/fonts/`, `font-display: swap`, préchargée), aucune requête tierce ; plus de bouton flottant |
| `/` | Héros « Kiro Help Center » sur photo, 8 cartes, aperçu FAQ, tuiles marketing | Héros « Comment pouvons-nous t'aider ? » + grande recherche (formulaire GET natif vers `/support?q=…#faq`, marche sans JavaScript), 6 sujets, aperçu FAQ (4 questions inchangées), bloc contact sombre. `hero-connection.png` retirée |
| `/support` | Héros, plans, FAQ + panneau contact latéral | En-tête de page, plans (pastilles de couleur, rangée défilante sur mobile), FAQ à deux colonnes (filtres verticaux collants sur desktop, rangée horizontale sur mobile, compteur « N réponses » annoncé, message « Aucune réponse trouvée… »), bloc contact sombre |
| Pages légales | Héros + sommaire en puces + article | En-tête compact, colonne de 680 px, sélecteur de section collant « 3/13 · Compte ▾ » (mobile) ou sommaire latéral collant (≥ 1024 px), « L'essentiel », titres numérotés, précédent/suivant par section (mobile), encadré « Une question sur … ? », lien « Haut de page » |
| `/404` | Héros + 2 boutons | Message existant + « Accueil de l'aide » et « kirodating.com ↗ » |

Poids `styles.css` + `main.js` : **44 654 → 43 270 octets** (−3,1 %, règle du cahier des charges respectée). `styles.css` 37 360 → 33 861 ; `main.js` 7 294 → 9 409 (menu accessible, filtres, sommaire). **Polices ajoutées** (hors règle CSS + JS) : `inter-latin-wght-normal.woff2` 48 256 o (chargé sur chaque page), `inter-latin-ext-wght-normal.woff2` 85 068 o (téléchargé seulement si la page contient des caractères du latin étendu ; c'est le cas des conditions d'utilisation), `OFL.txt` 4 477 o. En regard, `hero-connection.png` (1 045 985 o) a été retiré.

## 2. Contrat (vérifié avant toute modification puis à chaque commit)

`scripts/check-contract.mjs` (Node, aucune dépendance) + `scripts/contract-baseline.json` générée sur `e8059a2` **avant** toute modification (premier commit). Résultat : **132/132 sur le code de départ, 132/132 à chaque commit, 132/132 sur la branche finale.**

Vérifications :

1. 6 pages, `robots.txt`, `sitemap.xml`, `vercel.json`, CSS et JS présents.
2. `<head>` identique : `<title>`, meta description, canonical, meta robots, `lang`.
3. `robots.txt` et `sitemap.xml` identiques (sha256) ; `vercel.json` identique (`cleanUrls: true`, `trailingSlash: false`).
4. Ancres exigées par le cahier des charges sur les 4 pages (dont `#supprimer-compte`, `#delete-account`, `#account-deletion`, `#publicite`, `#contenu`) ; aucun id en double.
5. Texte normalisé de `<main>` identique pour `support.html` et les 3 pages légales.
6. Pages légales : chaque section (13 + 13 + 9) identique, ordre des sections, liens de chaque section, commentaires « À CONFIRMER (avocat) ».
7. FAQ : 21 questions, catégories, ids et réponses mot pour mot, dans l'ordre.
8. `#supprimer-compte` est un `<details>` ; `main.js` l'ouvre depuis les trois ancres.
9. `?q=` : `#faq-search` existe, `main.js` lit `q` ; la recherche de l'accueil mène à `/support?q=…#faq` (formulaire natif sur la branche).
10. Liens et ressources internes résolus avec la logique `cleanUrls`, fragments compris.
11. Une seule `<h1>`, langue française, lien d'évitement vers `<main id="contenu">`.
12. Poids CSS + JS ≤ référence.

**Règle d'exclusion (transparente).** Le texte comparé de `<main>` exclut `.toc` (sommaire, qui reprend les titres), `.page-actions` (boutons « Commencer la lecture ») et `[data-ui]` (ajouts d'interface de la refonte : libellé « L'essentiel », compteurs, précédent/suivant, encadré question, message « aucune réponse », phrase d'âge recopiée dans « L'essentiel »). Tout texte existant placé par erreur dans un `[data-ui]` disparaîtrait de la comparaison et ferait échouer le contrat. Tests de mutation faits sur une copie : modification d'un mot légal, d'une ancre, du titre, d'une question, d'un commentaire, d'un lien, de `robots.txt`, du paramètre `q`, d'une catégorie → chaque fois détecté.

## 3. Commits (`claude/aide-refonte`, du plus ancien au plus récent)

| SHA | Message |
|---|---|
| `5bdc251` | test(aide): script de contrat sans dépendance et référence de départ |
| `610f4cf` | test(aide): serveur local sans dépendance qui imite cleanUrls de Vercel |
| `9681182` | chore(aide): exclure scripts/ et docs/ du déploiement Vercel |
| `96e3f71` | refactor(aide): retirer les règles CSS mortes |
| `de4bacf` | feat(aide): retirer le bouton flottant « retour en haut » |
| `4f34ffa` | style(aide): jetons Kiro Solid en tête de styles.css et police Inter |
| `4779f4d` | feat(aide): symbole Kiro rouge (#F01C43) depuis le tracé officiel |
| `64e9389` | feat(aide): en-tête, pied de page et base Kiro Solid communs aux 6 pages |
| `89b08e8` | feat(aide): accueil Kiro Solid (héros de recherche, 6 sujets, contact) |
| `3d91557` | feat(aide): support Kiro Solid (FAQ filtrable, plans, contact) |
| `350efa3` | feat(aide): gabarit Kiro Solid des pages légales |
| `2811764` | feat(aide): page 404 Kiro Solid |
| `031659c` | fix(aide): rétablir le style du bouton « Contact général » (.btn-night) |
| `de5641f` | refactor(aide): retirer les anciennes variables et hero-connection.png |
| `7353602` | fix(aide): accessibilité relevée par axe et la mesure des cibles tactiles |
| `5ea282d` | docs(aide): README à jour (Kiro Solid, symbole rouge, scripts de vérification) |
| `6b7246d` | docs(aide): rapport HELP-REFONTE-2026-10-29 (ce fichier, première version) |
| `a7e0ae5` | feat(aide): héberger Inter sur le site, sans requête vers Google Fonts (revue C-H-01) |
| `6cc8525` | fix(aide): texte indicatif des recherches lisible en entier à toutes les largeurs (revue C-H-05) |
| `844193c` | style(aide): sélecteur de section mobile sans ombre (revue C-H-10) |
| `d0ab183` | style(aide): mise en évidence de la question ciblée par un contour, pas une ombre (suite de C-H-10) |
| (suivant) | docs(aide): rapport mis à jour après la revue indépendante, cycle 1 |

Note honnête : `031659c` corrige une régression introduite par mon propre nettoyage automatique (la règle `.btn-night` avait été retirée dans `89b08e8` car encore inutilisée, puis manquait dans `3d91557`). Découverte par l'audit des classes, corrigée avant la fin.

## 4. Fichiers modifiés (`e8059a2..5ea282d`)

| Fichier | Changement | Justification |
|---|---|---|
| `index.html` | `<main>`, en-tête, pied de page, préchargement de la police | Accueil selon `aide-desktop` / `aide-accueil-mobile` |
| `assets/fonts/` | Nouveau : Inter variable (latin, latin étendu) + `OFL.txt` (SIL OFL 1.1), depuis `@fontsource-variable/inter` 5.3.0 (installé hors dépôt, dans `work/tools`) | Police hébergée, aucune requête vers Google (revue C-H-01) |
| `support.html` | Structure de `<main>`, en-tête, pied de page (textes déplacés tels quels) | FAQ deux colonnes, filtres, contact |
| `conditions-utilisation.html`, `politique-confidentialite.html`, `securite-enfants.html` | Habillage autour du texte légal (inchangé), `<script>` d'une ligne dans `<head>` (classe `js`) | Gabarit `page-legale-mobile`, sans décalage de mise en page |
| `404.html` | `<main>`, en-tête, pied de page | Deux boutons demandés |
| `assets/css/styles.css` | Jetons Kiro Solid en tête, puis composants ; anciennes règles retirées (chaque sélecteur vérifié par recherche dans les 6 pages et `main.js`) | Refonte |
| `assets/js/main.js` | Menu accessible, FAQ (filtres, compteurs, `?cat=`), ouverture par ancre, sommaire ; bouton flottant et carrousel mort retirés | Refonte |
| `assets/img/kiro-symbol-red.svg` | Nouveau : copie exacte de `premium-landing-page/public/icons/kiro-symbol.svg` (`main`) | Logo rouge |
| `assets/img/hero-connection.png` | Supprimé (1 Mo), plus référencé nulle part | Fondations § 7 |
| `scripts/check-contract.mjs`, `scripts/contract-baseline.json`, `scripts/serve.mjs` | Nouveaux, sans dépendance | Contrat, serveur local `cleanUrls` |
| `.vercelignore` | Nouveau : `/scripts`, `/docs` | Ne pas publier les outils ni ce rapport sur aide.kirodating.com |
| `README.md` | Structure et commandes de vérification | Documentation |

Non modifiés : `vercel.json`, `robots.txt`, `sitemap.xml`, favicon (`kiro-symbol.svg` noir, toujours référencé), `kiro-wordmark.svg`, `kiro_red.png`.

## 5. Tests et validations réellement exécutés

Environnement : clone local, `node scripts/serve.mjs 4173`, Chromium 1243 via Playwright, `prefers-reduced-motion: reduce`. Depuis le cycle 1 de la revue, Inter est servie par le site lui-même : les captures et mesures utilisent exactement les fichiers qui seront déployés (vérifié : `document.fonts` charge « Inter » depuis `/assets/fonts/`).

| Contrôle | Résultat |
|---|---|
| Contrat | 132/132 (départ, chaque commit, final) |
| URL avec et sans `.html` (serveur imitant Vercel) | `/`, `/support`, `/conditions-utilisation`, `/politique-confidentialite`, `/securite-enfants`, `/404` : **200** ; `*.html` et `/index.html` : **308** vers l'URL propre puis **200** (comportement `cleanUrls` de Vercel) ; `/page-inexistante` : **404** avec `404.html` ; `robots.txt`, `sitemap.xml`, CSS, JS, SVG : 200 |
| Défilement horizontal (6 pages × 360, 375, 390, 768, 1024, 1280, 1440) | **Aucun** (`scrollWidth ≤ innerWidth` partout) |
| Cibles tactiles ≥ 44 px (liens, boutons, `summary`, champs ; liens dans un texte courant exemptés, WCAG 2.5.8) | **Aucune cible plus petite** sur les 42 combinaisons |
| Une seule `<h1>`, `lang` français | 6/6 pages |
| Liens réels app/stores | `/support#supprimer-compte`, `#delete-account`, `#account-deletion` : question ouverte, sommet à 80 px (mobile) / 88 px (desktop), sous l'en-tête collant (64/72 px), à toutes les largeurs ; `/support?q=supprimer#faq` : champ pré-rempli « supprimer », « 2 réponses » (même résultat qu'avant), `#faq` sous l'en-tête ; `/support.html?q=supprimer#faq` → 308 vers `/support?q=supprimer#faq` ; `/securite-enfants` : 200 ; `/politique-confidentialite#publicite` : section placée sous l'en-tête et le sélecteur collants (148 px mobile, 88 px desktop) |
| Menu mobile au clavier (390 px) | Lien d'évitement en premier ; Entrée sur le bouton ouvre le menu, focus sur « FAQ », `<main>` inerte ; 9 tabulations restent dans le menu (boucle bouton ↔ liens), Maj+Tab aussi ; Échap ferme et rend le focus au bouton, `<main>` redevient actif |
| FAQ au clavier | Tabulation jusqu'à la 1re question, Entrée ouvre puis referme ; filtre « Sécurité » au clavier : `aria-pressed="true"`, « 5 réponses » dans un `aria-live="polite"` ; recherche sans résultat : « 0 réponse » + « Aucune réponse trouvée. Écris-nous à support@kirosocial.com. » |
| Sélecteur de section (légal) au clavier | Entrée ouvre (`aria-expanded="true"`, « 3/13 · Compte » sur `#compte`), Échap ferme et rend le focus au bouton ; suivi au défilement vérifié (sections 3, 5, 6 selon la position) |
| Sans JavaScript | FAQ en `<details>` natifs, recherche de l'accueil fonctionnelle (`/support?q=supprimer#faq`), sommaire légal affiché en liste de liens. Limite : le bouton du menu mobile ne fait rien (liens du pied de page disponibles) |
| axe-core 4 (WCAG 2.0/2.1 A et AA + bonnes pratiques), 6 pages × 390 et 1440 | **0 violation** (2 corrigées pendant la validation : contraste de « Sommaire », repère `<nav>` répété) |
| Erreurs console | 0 |
| Requêtes vers un tiers (journal Playwright, 6 pages + `/support?q=supprimer#faq`, à 390 et 1440) | **0**. 6 requêtes par page (HTML, CSS, JS, police latine, symbole, logotype), 7 sur les conditions (police latin étendu). Preuve : `work/captures/apres/requetes-reseau.json` ; Lighthouse ne liste qu'un hôte, `127.0.0.1:4173` |
| Contrastes (calculés) | Encre/blanc 18,4:1 ; texte secondaire `#5F5F5F`/blanc 6,4:1, /canvas 6,0:1 ; corps légal `#252525` 15,3:1 ; rouge action `#D92525`/blanc 4,95:1, /canvas 4,66:1, /rouge doux 4,50:1 ; blanc/`#D92525` 4,95:1 ; `#A0A0A5`/encre 7,1:1 ; `#FF4A4A`/encre 5,6:1. `#F72C25` (3,9:1 avec du blanc) n'est utilisé pour aucun texte : le filtre actif utilise `#D92525` |
| Mouvement | Aucune animation en boucle ; transitions de 160–220 ms ; `prefers-reduced-motion` respecté (jetons) ; défilement doux uniquement si l'utilisateur ne l'a pas désactivé, saut direct à l'arrivée depuis un lien externe |
| Surfaces | Aucune transparence de fond, aucun `backdrop-filter` (le flou de l'ancien menu est retiré), **aucune `box-shadow`** dans la feuille (revue C-H-10) |

## 6. Lighthouse (mobile, Lighthouse 12.8.2, Chromium 1243)

Mesuré sur le serveur local (sans compression gzip, contrairement à Vercel). **Après la revue (cycle 1) : rien n'est bloqué**, toutes les ressources (police comprise) viennent du site ; un seul hôte contacté.

| Page | Performance | Accessibilité | Bonnes pratiques | SEO | FCP | LCP | CLS | TBT |
|---|---|---|---|---|---|---|---|---|
| `/support` avant (`e8059a2`) | 77 | 100 | 100 | 100 | 1,1 s | 6,8 s | 0 | 10 ms |
| `/support` **après**, 3 passages | **100 / 100 / 100** | **100** | **100** | **100** | 1,1 s | 1,6–1,7 s | 0 | 0–20 ms |
| `/conditions-utilisation` avant | 77 | 100 | 100 | 100 | 1,1 s | 6,6 s | 0 | 0 ms |
| `/conditions-utilisation` **après**, 3 passages | **99 / 100 / 99** | **100** | **100** | **100** | 1,5 s | 1,7–2,1 s | 0 | 0 ms |

Écart à 99 : variation du LCP simulé (la page télécharge aussi la police latin étendu). Lighthouse signale encore `styles.css` comme ressource bloquant le rendu (≈ 0,3–0,7 s estimés) et l'absence de compression (le serveur local ne compresse pas ; Vercel le fait). Les scores de production restent à mesurer sur un aperçu (PageSpeed Insights). Rapports : `work/lighthouse/cycle1/` (premier cycle, avec Google Fonts bloqué : `work/lighthouse/`).

## 7. Captures

Toutes sous `/home/claude/kiro/A-help/work/captures/` (manifeste : `MANIFEST.md`) :

- `apres/` (régénéré après le cycle 1 ; ancienne série dans `archive-cycle0/`) : 6 pages × 360, 375, 390, 768, 1024, 1280, 1440 (page entière), `validation.json`, `requetes-reseau.json` ; captures ciblées : accueil desktop et mobile, FAQ ouverte (desktop et via `#supprimer-compte`), recherche `?q=supprimer` (390 et 1440), page légale mobile, sélecteur de section ouvert, menu mobile ouvert, sommaire desktop, rendus sans JavaScript ;
- `avant/` : état `e8059a2` à 390 et 1440 ;
- `maquettes/` : les 3 maquettes rendues (aide-desktop à 1440, 1024, 768, 390) ;
- `comparaisons/` : 7 images côte à côte (maquette à gauche, refonte à droite, même largeur).

## 8. Écarts avec les maquettes

Le contenu existant fait foi ; les maquettes décident de l'apparence.

1. **Pas de pastille « FR »** dans l'en-tête : site en français seulement (cahier des charges, fondations § 11).
2. **Accueil et support séparés.** `aide-desktop` montre une page unique (héros, sujets, FAQ, contact) ; selon la correspondance du cahier des charges, l'accueil reprend héros + sujets + contact (avec un aperçu FAQ de 4 questions, comme `aide-accueil-mobile`) et `/support` la FAQ.
3. **Textes existants à la place des textes de maquette** : sous-titre du héros (texte actuel de l'accueil, et non « Compte, position… les réponses sont ici »), surtitre « Centre d'aide officiel » conservé, titre du contact « Encore besoin d'aide ? » (accueil) et texte « Écris-nous, l'équipe Kiro te répondra dès que possible. » (support), mention de copyright actuelle « © 2026 Kiro Dating. Tous droits réservés. » (la maquette affiche « 9572-2724 Québec Inc. » : non inséré, la mention attend la validation de l'avocat).
4. **Sujets** : icônes au trait (style Lucide) au lieu des lettres C/S/A/D/×/R ; les 6 sujets aussi sur mobile (la maquette mobile en montre 5) et dans l'ordre desktop. Descriptions : textes des anciennes cartes pour Sécurité, Abonnements, Données et Règles ; lignes de la maquette pour « Compte & connexion » (« Connexion, langues, compte suspendu. ») et « Supprimer mon compte » (« La marche à suivre et ce qui est effacé. »), car elles décrivent des réponses existantes de la FAQ et retirent la mention « vérification » de l'ancienne carte.
5. **Recherche** : texte indicatif « Rechercher une réponse… » (texte de l'ancien accueil) au lieu de « Compte, signalement, abonnement… », qui était tronqué ; sous 480 px, le bouton devient un rond avec une flèche (la maquette mobile n'a pas de bouton) ; la colonne gauche de la FAQ fait 300 px sur desktop (0,36 fr dans la maquette).
6. **Support** : le bloc « Abonnements » reste avant la FAQ (ordre du contenu existant, protégé par le contrat) ; la FAQ a son propre champ de recherche (pilule) en colonne gauche ; aucune question n'est ouverte par défaut (la maquette ouvre la première) ; le bloc contact garde ses 3 lignes existantes (Support, Contact général, Demandes couvertes) sous forme de boutons.
7. **Filtre actif** en `#D92525` et non `#F72C25` : texte blanc de 14–15 px, contraste AA (décision d'accessibilité des fondations § 2). Le « − » de la question ouverte reste en `#F72C25` (graphique).
8. **Pages légales** : en-tête commun (logo + menu) au lieu de la barre « ← Document légal » de la maquette ; le sélecteur de section apparaît sous l'en-tête de page puis devient collant ; pas de puces « Mis à jour le… » ni « [N] min de lecture » (aucune phrase source pour la durée) : la note légale existante (date, contact) est affichée en encadré ; titres « 1. Acceptation des conditions » (texte existant) au lieu de « 01 Acceptation » ; « L'essentiel » reprend les 3 points clés existants de chaque page et, pour les conditions et la confidentialité, la phrase d'âge minimum de la page, mot pour mot ; pas de libellés « Réservé aux adultes. » / « Respect obligatoire. » inventés ; navigation précédent/suivant sous chaque section (la maquette n'en montre qu'une).
9. **Desktop légal** : aucune maquette ; sommaire latéral collant de 240 px + colonne de 680 px, d'après les fondations (§ 4, § 6).
10. **404** : aucune maquette ; reprend l'en-tête de page des autres gabarits.

## 9. Mentions inexactes trouvées (non corrigées)

Lignes de la branche `claude/aide-refonte` après la revue (cycle 1), identiques au commit de ce rapport. Les pages légales demandent une relecture juridique ; la FAQ sera mise à jour dans un chantier séparé (voir aussi § 12).

**Connexion par code SMS, numéro de téléphone, Twilio**
- `support.html:174` (« La connexion se fait par code SMS à usage unique, Google ou Apple ») ; `support.html:369` (« depuis l'adresse ou le numéro associé à ton compte ») ; `support.html:413` (« les SMS » parmi les sous-traitants).
- `conditions-utilisation.html:113` (point clé « Connexion par SMS à usage unique, Google ou Apple ») ; `:196` (« par code SMS à usage unique ») ; `:202` (« Les codes SMS sont à usage unique… ») ; `:212–215` (délai entre deux codes, « fournir un numéro qui t'appartient », « accès à ton téléphone ») ; `:385` (« numéro de téléphone » parmi les données) ; `:437` (« Twilio pour les codes SMS ») ; `:467` (« empreinte… du téléphone ou de l'e-mail »).
- `politique-confidentialite.html:168–169` (« numéro de téléphone (connexion par code SMS) ») ; `:301` (« Twilio : envoi des codes SMS de connexion ») ; `:453` (Twilio parmi les transferts) ; `:487` (empreinte « du téléphone ») ; `:508` (« la connexion repose sur des codes SMS à usage unique »).

**Inscription par téléphone et liste de pays**
- `support.html:184–188` (« L'inscription par téléphone est disponible dans un nombre limité de pays, dont le Canada… la Belgique »).
- `conditions-utilisation.html:175–176` (disponibilité dans une liste de pays) ; `:213` (« restriction aux pays pris en charge »).

**Traduction des messages**
- `support.html:101` (plan Standard : « traductions chaque jour ») ; `:253` (quotas « ou les traductions ») ; `:345–351` (question « Comment fonctionne la traduction des messages ? ») ; `:414` (« la traduction » parmi les sous-traitants).
- `conditions-utilisation.html:440` (« Azure Translator ou LibreTranslate ») ; `:509` (« plus de traductions ») ; `:515` (quotas de traductions) ; `:590` (« traductions automatiques »).
- `politique-confidentialite.html:239` (« les traductions de messages ») ; `:307` (services de traduction).

**Cercles, speed dating, communautés**
- `support.html:111` (plan Premium : « speed dating ») ; `:287` (« cercles » parmi les données effacées : conservé volontairement par SITE-SEO, exact pour les comptes existants) ; `:301–308` (question « Qu'est-ce qu'un Cercle ? », « communauté ») ; `:313–317` (question « speed dating »).
- `conditions-utilisation.html:171` (« fonctions Cercles ») ; `:313–314` (« messages de speed dating dans les Cercles ») ; `:399` (« Cercle ») ; `:461` (« cercles » effacés) ; `:509–511` (« plus de Cercles simultanés », « speed dating ») ; `:626–627` (« les Cercles ou le speed dating »).
- `politique-confidentialite.html:187` (« Cercles ») ; `:210` (« QR code de Cercle ») ; `:239` (« les Cercles ») ; `:479` (« cercles » effacés).
- Faux positifs écartés : « Règles de communauté » (`index.html:124`, `conditions-utilisation.html:235`, `politique-confidentialite.html:244`) désigne les règles de conduite, pas une fonction « communautés ».

**Badge vérifié / vérification par selfie**
- `support.html:323–329` (question « Comment obtenir le badge vérifié ? ») ; `:120` (plan Max : « badges exclusifs »).
- `conditions-utilisation.html:355–358` (badge « vérifié » par selfie) ; `:511` (« badges exclusifs ») ; `:579` (« La vérification par selfie… »).
- `index.html:143` (aperçu FAQ : « complète les étapes de vérification et de profil »). La carte « Profils vérifiés » de l'ancien accueil a disparu avec les tuiles marketing (refonte).

**Autres mentions de fonctions non garanties (signalées par SITE-SEO-2026-10-29)**
- `support.html:101` (« Super Flames »), `:111` (« mode incognito »), `:119` (« boost de visibilité inclus ») ; `conditions-utilisation.html:425` (« mode incognito »), `:507–511` (Super Flames, boosts, incognito), `:527` (« un boost »), `:626` (« Super Flames »).

**Bêta, TestFlight, Telegram** : **aucune occurrence** dans les 6 pages.

**Marqueurs « À CONFIRMER »** (commentaires HTML, invisibles, conservés)
- `conditions-utilisation.html:99` (×2 : entité légale et juridiction ; validation avant publication), `:600` (droit applicable), `:617` (titulaire des droits et marques), `:668` (nom légal, juridiction, mentions de paiement).
- `politique-confidentialite.html:101` (responsable du traitement), `:632` (responsable Loi 25, juridiction).
- Pied de page des 6 pages (mention de copyright) : `index.html:200`, `support.html:459`, `conditions-utilisation.html:688`, `politique-confidentialite.html:651`, `securite-enfants.html:474`, `404.html:75`.

## 10. Risques et points restants

1. **Police** : Inter est hébergée sur le site (décision de l'orchestrateur, revue C-H-01) ; le cahier des charges proposait Google Fonts. Seul le style droit est fourni : l'italique des deux `<em>` de `securite-enfants.html` (CSAE, CSAM) est simulé par le navigateur. +133 Ko de polices au maximum par visite (48 Ko sur la plupart des pages).
2. **`.vercelignore` — vérification OBLIGATOIRE sur l'aperçu Vercel avant `main`** (revue C-H-02 : impossible à prouver localement). Les deux commandes doivent renvoyer `404` :
   `curl -s -o /dev/null -w "%{http_code}\n" https://<aperçu>/docs/audits/KIRO_HELP_CENTER_REFONTE_2026-10-29.md`
   `curl -s -o /dev/null -w "%{http_code}\n" https://<aperçu>/scripts/serve.mjs`
   Si l'une renvoie `200`, ne pas publier : déplacer `docs/` et `scripts/` hors du dossier servi ou les exclure autrement.
3. **Menu mobile sans JavaScript** : inopérant (liens du pied de page disponibles). Les autres fonctions dégradent proprement.
4. **Nouveau paramètre `?cat=`** (sujets de l'accueil → filtre) : ajout, sans effet sans JavaScript ; non protégé par le contrat.
5. **`<script>` en ligne** dans le `<head>` des 3 pages légales (une ligne, classe `js`) : à autoriser par empreinte si une CSP est ajoutée un jour.
6. **`/404` explicite** : mon serveur local répond 200 ; le statut exact de Vercel pour `/404` n'est pas vérifié (les pages absentes répondent bien 404).
7. **Validation sur appareils réels** (Safari iOS, Chrome Android, VoiceOver, TalkBack) : **non faite**. Seul Chromium a été utilisé.
8. **`<h1>` de l'accueil** passe de « Kiro Help Center » à « Comment pouvons-nous t'aider ? » (le `<title>` reste « Kiro Help Center ») : effet SEO probablement neutre, à surveiller.
9. **Favicon** inchangé (symbole noir) : le cahier des charges permet de passer au symbole rouge ; non fait, le contrat le gèle. Option pour Pierre.
10. **Registre** : la ligne pour `audits/REPORT_REGISTRY.md` du projet est proposée ci-dessous ; je n'ai pas accès en écriture au registre du projet depuis ce clone. À inscrire par l'orchestrateur ou Pierre :
    `| HELP-REFONTE-2026-10-29 | 2026-10-29 | Refonte Kiro Solid du centre d'aide | kiro-help-center, claude/aide-refonte | IMPLÉMENTÉ + TESTÉ (local), NON POUSSÉ, NON DÉPLOYÉ | docs/audits/KIRO_HELP_CENTER_REFONTE_2026-10-29.md |`

## 11. Statut Git, push et déploiement

- Avant : `claude/aide-refonte` = `main` @ `e8059a2`, propre.
- Après : 22 commits locaux sur `claude/aide-refonte` (dont ce rapport et sa mise à jour) ; arbre propre. Branches optionnelles `claude/aide-refonte-seo` (première version, conservée telle quelle) et `claude/aide-refonte-seo-v2` (à jour, § 12).
- **Push : NON EFFECTUÉ. Merge : NON EFFECTUÉ. Tag : NON. Déploiement Vercel : NON EFFECTUÉ.** Aucun remote n'est configuré dans ce clone.
- Retour arrière : la branche est indépendante de `main` ; ne pas la fusionner suffit.

## 12. Patch SEO (`help.patch`, SITE-SEO-2026-10-29) — branche séparée

Le patch n'est **pas** appliqué sur `claude/aide-refonte`. Pour faciliter la décision de Pierre, la branche **`claude/aide-refonte-seo-v2`** (créée depuis la pointe de `claude/aide-refonte` après la revue, cycle 1, par report des 3 commits SEO avec `cherry-pick`, sans rebase ; l'ancienne `claude/aide-refonte-seo`, basée sur `6b7246d`, est laissée intacte et ne doit plus servir) porte ses 18 corrections sur le nouveau balisage (`index.html` et `support.html` uniquement ; pages légales non touchées), puis met à jour la référence du contrat dans un commit séparé. Elle ne doit jamais être fusionnée dans `claude/aide-refonte`.

| # | Fichier | Correction | Statut |
|---|---|---|---|
| 1 | index.html | meta description | PORTÉ |
| 2 | index.html | `<title>` « Centre d'aide Kiro — compte, sécurité et abonnements » | PORTÉ |
| 3 | index.html | carte « Compte & suppression » sans « vérification » | ABANDONNÉ : la carte n'existe plus ; les nouveaux sujets ne mentionnent pas la vérification |
| 4 | index.html | réponse « Comment créer un compte » (Google, Apple sur iPhone) | PORTÉ |
| 5 | index.html | tuile « Profils vérifiés » → « Signalement et blocage » | ABANDONNÉ : tuile retirée par la refonte |
| 6 | support.html | `<title>` « Support et FAQ — Kiro » | PORTÉ |
| 7–9 | support.html | textes des plans Standard, Premium, Max | PORTÉ |
| 10 | support.html | connexion Google / Apple sur iPhone | PORTÉ |
| 11 | support.html | inscription sans téléphone ni liste de pays | PORTÉ |
| 12 | support.html | quotas sans traductions | PORTÉ |
| 13–16 | support.html | questions Cercle, speed dating, badge vérifié, traduction retirées (21 → 17 questions) | PORTÉ |
| 17 | support.html | « adresse e-mail associée » | PORTÉ |
| 18 | support.html | sous-traitants sans SMS ni traduction | PORTÉ |

Bilan : 16 portées, 2 abandonnées (objets supprimés par la refonte). Le contrat de la branche SEO échoue sur 19 points avec l'ancienne référence (preuve qu'il détecte ces changements), puis passe avec la référence régénérée dans le commit dédié. SHA dans `HANDOFF_FOR_REVIEW.md`.

## 12 bis. Revue indépendante — cycle 1 (agent C)

Verdict de l'agent C sur `claude/aide-refonte` @ `6b7246d` : **RÉVISION DEMANDÉE**. Intégrité des textes, ancres, liens, accessibilité et absence de régressions : vérifiés par C.

| Constat | Gravité | Problème | Correction |
|---|---|---|---|
| C-H-01 | Majeur | Google Fonts chargé sur les 6 pages, y compris la politique de confidentialité : requête vers un tiers que le site ne faisait pas avant (Inter déclarée, jamais chargée) et que la politique ne décrit pas | `a7e0ae5` : Inter variable hébergée dans `assets/fonts/` (latin + latin étendu, licence OFL jointe), `@font-face` avec `font-display: swap` et `unicode-range`, préchargement du fichier latin, toute référence à `fonts.googleapis.com` / `fonts.gstatic.com` retirée. Preuve : 0 requête tierce sur les 6 pages (journal Playwright, `requetes-reseau.json`) ; Lighthouse relancé sans rien bloquer (§ 6) |
| C-H-05 | Mineur | Texte indicatif de recherche tronqué (accueil à 360–390 px, colonne FAQ à 1440 px) | `6cc8525` : texte « Rechercher une réponse… », bouton rond à flèche sous 480 px, colonne FAQ de 300 px et champ en 15 px sur desktop. Mesuré de 360 à 1440 px : le texte tient. Aucun texte protégé modifié |
| C-H-10 | Info | Ombre sous la liste du sélecteur de section mobile (les fondations ne l'autorisent que sous le menu mobile) | `844193c` : ombre retirée, filet `#ECECEC` conservé ; `d0ab183` : l'anneau temporaire de la question ciblée passe de `box-shadow` à `outline`. Plus aucune `box-shadow` |
| C-H-02 | Mineur | `.vercelignore` non prouvable localement | Conservé ; vérification `curl` obligatoire sur l'aperçu documentée au § 10, point 2, et reprise dans la recommandation |

Après corrections : contrat 132/132 ; validation 6 pages × 7 largeurs refaite (aucun défilement horizontal, aucune cible < 44 px, liens profonds conformes, clavier conforme, axe-core 0 violation, 0 erreur console) ; captures `apres/` régénérées ; branche SEO reconstruite en `claude/aide-refonte-seo-v2`.

## 13. Recommandation

**GO conditionnel** pour une revue visuelle par Pierre puis un déploiement de **prévisualisation** Vercel, avec trois vérifications avant `main` : (1) `.vercelignore` effectif, prouvé par les deux `curl` du § 10 (réponses `404`), (2) PageSpeed Insights mobile sur l'aperçu, (3) essai sur un iPhone et un Android réels des liens `/support#supprimer-compte`, `/support?q=supprimer#faq` et du menu. **NO-GO** pour une mise en production directe sans ces trois vérifications. Contrat, contenu juridique et ancres Google Play : aucune régression détectée.
