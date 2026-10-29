#!/usr/bin/env node
// Contrat du centre d'aide Kiro (aide.kirodating.com) — script sans dépendance.
//
// Vérifie que la refonte visuelle ne casse rien de ce dont l'app, les stores
// et Google dépendent : URL, ancres, <head>, textes légaux et FAQ mot pour mot,
// recherche « ?q= », liens internes, poids CSS + JS.
//
// Usage :
//   node scripts/check-contract.mjs                   vérifie contre la référence
//   node scripts/check-contract.mjs --write-baseline  (ré)écrit la référence
//
// La référence (scripts/contract-baseline.json) a été générée sur `main`
// @ e8059a2, avant toute modification. Ne la régénérer que sur décision
// explicite (changement de contenu validé par Pierre), dans un commit dédié.

import { createHash } from "node:crypto";
import { existsSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const BASELINE_PATH = join(ROOT, "scripts", "contract-baseline.json");

const PAGES = [
  "index.html",
  "support.html",
  "conditions-utilisation.html",
  "politique-confidentialite.html",
  "securite-enfants.html",
  "404.html",
];
const LEGAL_PAGES = [
  "conditions-utilisation.html",
  "politique-confidentialite.html",
  "securite-enfants.html",
];
const STATIC_FILES = ["robots.txt", "sitemap.xml"];
const SIZE_FILES = ["assets/css/styles.css", "assets/js/main.js"];

// Ancres exigées (cahier des charges, section « Contrat à ne pas casser »).
const REQUIRED_ANCHORS = {
  "support.html": ["faq", "faq-search", "contact", "securite", "abonnements", "supprimer-compte", "delete-account", "account-deletion", "contenu"],
  "conditions-utilisation.html": ["acceptation", "eligibilite", "compte", "conduite", "contenus", "paiements", "propriete", "securite", "confidentialite", "resiliation", "responsabilite", "modifications", "contact", "contenu"],
  "politique-confidentialite.html": ["objet", "donnees", "finalites", "localisation", "partage", "publicite", "transferts", "conservation", "securite", "droits", "age", "modifications", "contact", "contenu"],
  "securite-enfants.html": ["engagement", "interdit", "adultes", "moderation", "signalement", "traitement", "dates", "conformite", "contact", "contenu"],
};

// Éléments exclus du texte comparé de <main> : navigation et habillage
// d'interface, jamais du texte juridique ni de la FAQ.
//   .toc           sommaire (reprend les titres des sections)
//   .page-actions  boutons « Commencer la lecture », « Contact »…
//   [data-ui]      ajouts d'interface de la refonte (libellés, compteurs,
//                  encadrés de navigation). Tout texte existant placé par
//                  erreur dans un [data-ui] disparaît de la comparaison et
//                  fait donc échouer le contrat.
const UI_EXCLUDE = [".toc", ".page-actions", "[data-ui]"];

/* ------------------------------------------------------------------------ */
/* Analyseur HTML minimal (tolérant, suffisant pour ces pages statiques).    */
/* ------------------------------------------------------------------------ */

const VOID = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"]);
const RAW = new Set(["script", "style", "textarea", "title"]);
const BLOCK = new Set([
  "address", "article", "aside", "blockquote", "br", "dd", "details", "div", "dl", "dt", "fieldset",
  "figcaption", "figure", "footer", "form", "h1", "h2", "h3", "h4", "h5", "h6", "header", "hr", "li",
  "main", "nav", "ol", "p", "section", "summary", "table", "tbody", "td", "tfoot", "th", "thead", "tr", "ul",
  "button", "label", "input", "select", "option",
]);
const ENTITIES = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", rsquo: "’", lsquo: "‘", hellip: "…", mdash: "—", ndash: "–", laquo: "«", raquo: "»", eacute: "é", egrave: "è", agrave: "à", ccedil: "ç", copy: "©" };

function decode(text) {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, code) => {
    if (code[0] === "#") {
      const n = code[1].toLowerCase() === "x" ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
      return String.fromCodePoint(n);
    }
    return ENTITIES[code.toLowerCase()] ?? m;
  });
}

function parseAttrs(src) {
  const attrs = {};
  const re = /([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
  let m;
  while ((m = re.exec(src))) attrs[m[1].toLowerCase()] = decode(m[2] ?? m[3] ?? m[4] ?? "");
  return attrs;
}

function parseHTML(html) {
  const root = { tag: "#root", attrs: {}, children: [], parent: null };
  let cur = root;
  let i = 0;
  while (i < html.length) {
    if (html.startsWith("<!--", i)) {
      const end = html.indexOf("-->", i + 4);
      const stop = end === -1 ? html.length : end;
      cur.children.push({ comment: html.slice(i + 4, stop), parent: cur });
      i = stop + 3;
    } else if (html.startsWith("<!", i) || html.startsWith("<?", i)) {
      i = html.indexOf(">", i) + 1 || html.length;
    } else if (html.startsWith("</", i)) {
      const end = html.indexOf(">", i);
      const tag = html.slice(i + 2, end).trim().toLowerCase();
      let n = cur;
      while (n && n.tag !== tag) n = n.parent;
      if (n && n.parent) cur = n.parent;
      i = end + 1;
    } else if (html[i] === "<" && /[a-zA-Z]/.test(html[i + 1] || "")) {
      // Fin de balise en tenant compte des guillemets dans les attributs.
      let j = i + 1;
      let quote = null;
      for (; j < html.length; j++) {
        const c = html[j];
        if (quote) { if (c === quote) quote = null; }
        else if (c === '"' || c === "'") quote = c;
        else if (c === ">") break;
      }
      const inner = html.slice(i + 1, j);
      const tag = inner.match(/^[^\s/>]+/)[0].toLowerCase();
      const node = { tag, attrs: parseAttrs(inner.slice(tag.length).replace(/\/$/, "")), children: [], parent: cur };
      cur.children.push(node);
      i = j + 1;
      if (RAW.has(tag)) {
        const close = html.toLowerCase().indexOf(`</${tag}`, i);
        const stop = close === -1 ? html.length : close;
        node.children.push({ text: html.slice(i, stop), parent: node });
        i = html.indexOf(">", stop) + 1 || html.length;
      } else if (!VOID.has(tag) && !inner.endsWith("/")) {
        cur = node;
      }
    } else {
      const next = html.indexOf("<", i + 1);
      const stop = next === -1 ? html.length : next;
      cur.children.push({ text: html.slice(i, stop), parent: cur });
      i = stop;
    }
  }
  return root;
}

// Sélecteurs simples : tag, #id, .classe, [attr], [attr=valeur], séparés par des virgules.
function matches(node, selector) {
  if (!node.tag || node.tag === "#root") return false;
  return selector.split(",").some((part) => {
    const sel = part.trim();
    const tokens = sel.match(/(^[a-z][a-z0-9-]*)|(#[\w-]+)|(\.[\w-]+)|(\[[^\]]+\])/gi) || [];
    return tokens.every((t) => {
      if (t[0] === "#") return node.attrs.id === t.slice(1);
      if (t[0] === ".") return (node.attrs.class || "").split(/\s+/).includes(t.slice(1));
      if (t[0] === "[") {
        const [, name, value] = t.match(/^\[([^=\]]+)(?:=["']?([^"'\]]*)["']?)?\]$/);
        if (!(name in node.attrs)) return false;
        return value === undefined || node.attrs[name] === value;
      }
      return node.tag === t.toLowerCase();
    });
  });
}

function* walk(node) {
  for (const child of node.children || []) {
    yield child;
    if (child.children) yield* walk(child);
  }
}
const qsa = (node, sel) => [...walk(node)].filter((n) => n.tag && matches(n, sel));
const qs = (node, sel) => qsa(node, sel)[0] || null;

const norm = (s) => s.replace(/ /g, " ").replace(/\s+/g, " ").trim();

function textOf(node, exclude = []) {
  const out = [];
  (function rec(n) {
    for (const c of n.children || []) {
      if (c.comment !== undefined) continue;
      if (c.text !== undefined) { out.push(decode(c.text)); continue; }
      if (["script", "style", "template", "svg", "title"].includes(c.tag)) continue;
      if (exclude.some((sel) => matches(c, sel))) continue;
      const block = BLOCK.has(c.tag);
      if (block) out.push(" ");
      rec(c);
      if (block) out.push(" ");
    }
  })(node);
  return norm(out.join(""));
}

function commentsOf(node) {
  return [...walk(node)].filter((n) => n.comment !== undefined).map((n) => norm(n.comment));
}

/* ------------------------------------------------------------------------ */
/* Extraction de l'état contractuel                                          */
/* ------------------------------------------------------------------------ */

const read = (rel) => readFileSync(join(ROOT, rel), "utf8");
const sha256 = (rel) => createHash("sha256").update(readFileSync(join(ROOT, rel))).digest("hex");
const docs = {};
const doc = (page) => (docs[page] ??= parseHTML(read(page)));

function headOf(page) {
  const d = doc(page);
  const metaDesc = qs(d, "meta[name=description]");
  const metaRobots = qs(d, "meta[name=robots]");
  const canonical = qs(d, "link[rel=canonical]");
  const title = qs(d, "title");
  return {
    lang: qs(d, "html")?.attrs.lang ?? null,
    title: title ? norm(decode(title.children.map((c) => c.text || "").join(""))) : null,
    description: metaDesc ? norm(metaDesc.attrs.content) : null,
    canonical: canonical?.attrs.href ?? null,
    robots: metaRobots?.attrs.content ?? null,
  };
}

function faqOf() {
  const d = doc("support.html");
  return qsa(d, "details[data-faq-item]").map((det) => {
    const summary = qs(det, "summary");
    return {
      id: det.attrs.id ?? null,
      category: det.attrs["data-category"] ?? null,
      question: textOf(summary, UI_EXCLUDE),
      text: textOf(det, UI_EXCLUDE),
    };
  });
}

function legalOf(page) {
  const d = doc(page);
  const main = qs(d, "main");
  const article = qs(main, "article") || main;
  const sections = {};
  const links = {};
  for (const s of qsa(article, "section[id]")) {
    sections[s.attrs.id] = textOf(s, UI_EXCLUDE);
    links[s.attrs.id] = qsa(s, "a[href]").filter((a) => !qsa(s, "[data-ui]").some((ui) => [...walk(ui)].includes(a))).map((a) => a.attrs.href);
  }
  return { sections, links, comments: commentsOf(main) };
}

function snapshot() {
  const snap = { generatedFrom: null, head: {}, mainText: {}, legal: {}, faq: faqOf(), static: {}, vercel: null, sizeBytes: 0 };
  for (const page of PAGES) {
    snap.head[page] = headOf(page);
    if (page !== "index.html" && page !== "404.html") snap.mainText[page] = textOf(qs(doc(page), "main"), UI_EXCLUDE);
  }
  for (const page of LEGAL_PAGES) snap.legal[page] = legalOf(page);
  for (const f of STATIC_FILES) snap.static[f] = sha256(f);
  snap.vercel = JSON.parse(read("vercel.json"));
  snap.sizeBytes = SIZE_FILES.reduce((sum, f) => sum + statSync(join(ROOT, f)).size, 0);
  return snap;
}

/* ------------------------------------------------------------------------ */
/* Vérifications                                                              */
/* ------------------------------------------------------------------------ */

const results = [];
function check(name, ok, detail = "") {
  results.push({ name, ok: Boolean(ok), detail });
}

function firstDiff(a, b) {
  let i = 0;
  while (i < a.length && a[i] === b[i]) i++;
  const from = Math.max(0, i - 60);
  return `position ${i}\n      attendu : …${a.slice(from, i + 80)}…\n      obtenu  : …${b.slice(from, i + 80)}…`;
}

function eq(name, expected, actual) {
  const e = JSON.stringify(expected);
  const a = JSON.stringify(actual);
  check(name, e === a, e === a ? "" : typeof expected === "string" ? firstDiff(expected, actual ?? "") : firstDiff(e, a ?? ""));
}

// Résout un lien interne en fichier (+ fragment) comme Vercel avec cleanUrls.
function resolveInternal(href, fromPage) {
  const [beforeHash, hash = ""] = href.split("#");
  const path = beforeHash.split("?")[0];
  let file;
  if (path === "") file = fromPage;
  else if (path === "/") file = "index.html";
  else {
    const rel = path.replace(/^\//, "");
    if (existsSync(join(ROOT, rel)) && statSync(join(ROOT, rel)).isFile()) file = rel;
    else if (existsSync(join(ROOT, `${rel}.html`))) file = `${rel}.html`;
    else file = null;
  }
  return { file, hash };
}

function verify(base) {
  const now = snapshot();

  // 1. Fichiers présents
  for (const f of [...PAGES, ...STATIC_FILES, "vercel.json", ...SIZE_FILES]) check(`fichier présent : ${f}`, existsSync(join(ROOT, f)));

  // 2. <head> inchangé (titre, description, canonical, robots, langue)
  for (const page of PAGES) eq(`<head> inchangé : ${page}`, base.head[page], now.head[page]);

  // 3. robots.txt, sitemap.xml, vercel.json
  for (const f of STATIC_FILES) eq(`${f} inchangé (sha256)`, base.static[f], now.static[f]);
  eq("vercel.json inchangé", base.vercel, now.vercel);
  check("vercel.json : cleanUrls=true et trailingSlash=false", now.vercel.cleanUrls === true && now.vercel.trailingSlash === false);

  // 4. Ancres exigées, et aucun id en double
  for (const [page, ids] of Object.entries(REQUIRED_ANCHORS)) {
    const all = qsa(doc(page), "[id]").map((n) => n.attrs.id);
    const missing = ids.filter((id) => !all.includes(id));
    check(`ancres présentes : ${page} (${ids.length})`, missing.length === 0, missing.length ? `manquantes : ${missing.join(", ")}` : "");
  }
  for (const page of PAGES) {
    const all = qsa(doc(page), "[id]").map((n) => n.attrs.id);
    const dups = [...new Set(all.filter((id, i) => all.indexOf(id) !== i))];
    check(`aucun id en double : ${page}`, dups.length === 0, dups.join(", "));
  }

  // 5. Texte de <main> identique (pages légales et support)
  for (const page of Object.keys(base.mainText)) eq(`texte de <main> identique : ${page}`, base.mainText[page], now.mainText[page]);

  // 6. Pages légales : chaque section, ses liens et ses commentaires « À CONFIRMER »
  for (const page of LEGAL_PAGES) {
    const b = base.legal[page];
    const n = now.legal[page];
    for (const id of Object.keys(b.sections)) eq(`section légale identique : ${page}#${id}`, b.sections[id], n.sections[id]);
    eq(`ordre des sections légales : ${page}`, Object.keys(b.sections), Object.keys(n.sections));
    eq(`liens des sections légales : ${page}`, b.links, n.links);
    eq(`commentaires de <main> conservés : ${page}`, b.comments, n.comments);
  }

  // 7. FAQ : questions, catégories, réponses et ids, dans l'ordre
  eq(`FAQ : liste des ${base.faq.length} questions`, base.faq.map((q) => q.question), now.faq.map((q) => q.question));
  eq("FAQ : catégories et ids", base.faq.map((q) => [q.category, q.id]), now.faq.map((q) => [q.category, q.id]));
  base.faq.forEach((q, i) => eq(`FAQ : réponse mot pour mot « ${q.question} »`, q.text, now.faq[i]?.text));

  // 8. Suppression de compte (exigence Google Play)
  const support = doc("support.html");
  check("#supprimer-compte est un <details> de la FAQ", qs(support, "#supprimer-compte")?.tag === "details");
  const js = read("assets/js/main.js");
  check("main.js ouvre #supprimer-compte depuis #delete-account / #account-deletion / #supprimer-compte",
    ["delete-account", "account-deletion", "supprimer-compte"].every((a) => js.includes(`"${a}"`)) && /\.open\s*=\s*true/.test(js));

  // 9. Recherche : « ?q= » pré-remplit #faq-search ; l'accueil envoie vers /support?q=…#faq
  const faqSearch = qs(support, "#faq-search");
  check("#faq-search est un champ de recherche", faqSearch?.tag === "input" && faqSearch.attrs.type === "search");
  check("main.js lit le paramètre « q » et pré-remplit la recherche", /URLSearchParams\([^)]*location\.search\)\.get\(["']q["']\)/.test(js));
  const homeForm = qs(doc("index.html"), "form[role=search]");
  const nativeSubmit = homeForm && homeForm.attrs.action === "/support#faq" && (homeForm.attrs.method || "get").toLowerCase() === "get" && qs(homeForm, "input[name=q]");
  const jsSubmit = /\/support\$\{suffix\}/.test(js) && /\?q=\$\{encodeURIComponent\(query\)\}#faq/.test(js);
  check("accueil : la recherche mène à /support?q=…#faq", Boolean(homeForm) && (nativeSubmit || jsSubmit), nativeSubmit ? "formulaire natif (sans JavaScript)" : jsSubmit ? "via main.js" : "");

  // 10. Liens et ressources internes résolus (cleanUrls)
  for (const page of PAGES) {
    const broken = [];
    for (const n of qsa(doc(page), "a[href], link[href], script[src], img[src]")) {
      const ref = n.attrs.href ?? n.attrs.src;
      if (!ref || /^(https?:|mailto:|tel:|\/\/|data:)/.test(ref)) continue;
      const { file, hash } = resolveInternal(ref, page);
      if (!file) { broken.push(ref); continue; }
      if (hash && file.endsWith(".html") && !qsa(doc(file), "[id]").some((x) => x.attrs.id === hash)) broken.push(ref);
    }
    check(`liens internes résolus : ${page}`, broken.length === 0, broken.join(", "));
  }

  // 11. Accessibilité de base
  for (const page of PAGES) {
    const d = doc(page);
    check(`lang français (fr ou fr-CA) : ${page}`, /^fr(-|$)/.test(now.head[page].lang || ""));
    check(`un seul <h1> : ${page}`, qsa(d, "h1").length === 1, `${qsa(d, "h1").length} trouvés`);
    const skip = qs(d, "a.skip-link");
    check(`lien d'évitement vers <main id="contenu"> : ${page}`, skip?.attrs.href === "#contenu" && qs(d, "main")?.attrs.id === "contenu");
  }

  // 12. Poids CSS + JS
  check(`poids styles.css + main.js ≤ référence (${now.sizeBytes} ≤ ${base.sizeBytes} octets)`, now.sizeBytes <= base.sizeBytes);
}

/* ------------------------------------------------------------------------ */

if (process.argv.includes("--write-baseline")) {
  const snap = snapshot();
  snap.generatedFrom = process.argv[process.argv.indexOf("--write-baseline") + 1] || "inconnu";
  writeFileSync(BASELINE_PATH, `${JSON.stringify(snap, null, 2)}\n`);
  console.log(`Référence écrite : ${BASELINE_PATH} (${snap.faq.length} questions FAQ, ${LEGAL_PAGES.length} pages légales)`);
  process.exit(0);
}

const baseline = JSON.parse(readFileSync(BASELINE_PATH, "utf8"));
verify(baseline);
const failed = results.filter((r) => !r.ok);
for (const r of results) {
  if (!r.ok || process.argv.includes("--verbose")) console.log(`${r.ok ? "OK  " : "ÉCHEC"} ${r.name}${r.detail ? `\n      ${r.detail}` : ""}`);
}
console.log(`\nContrat : ${results.length - failed.length}/${results.length} vérifications réussies (référence : ${baseline.generatedFrom}).`);
process.exit(failed.length ? 1 : 0);
