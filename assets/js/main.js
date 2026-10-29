// Centre d'aide Kiro — amélioration progressive. Sans JavaScript, le site
// reste lisible et navigable (FAQ en <details>, liens du pied de page).
const body = document.body;
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
const desktop = window.matchMedia("(min-width: 1024px)");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

// URL propres (cleanUrls Vercel) : « /support » et l'ancien « /support.html »
// désignent la même page. On compare les chemins normalisés, sans fragment.
const normalizePath = (path) => {
  const clean = path.split(/[?#]/)[0].replace(/\.html$/, "").replace(/\/index$/, "/");
  return clean.length > 1 ? clean.replace(/\/+$/, "") : "/";
};
const currentPath = normalizePath(window.location.pathname);

$$("[data-nav-link]").forEach((link) => {
  const href = link.getAttribute("href") || "";
  // Les ancres internes (ex. « /support#securite ») ne marquent pas la page.
  if (!href.includes("#") && normalizePath(href) === currentPath) {
    link.setAttribute("aria-current", "page");
  }
});

// Menu mobile plein écran : le focus reste dans le menu, Échap le ferme et
// rend le focus au bouton. Le reste de la page est inerte pendant l'ouverture.
const menuButton = document.querySelector("[data-menu-button]");
const menu = document.querySelector("[data-menu]");

if (menuButton && menu) {
  const outside = $$("main, footer, .skip-link, .logo");
  const isOpen = () => body.classList.contains("menu-open");
  const setMenu = (open, returnFocus) => {
    body.classList.toggle("menu-open", open);
    menuButton.setAttribute("aria-expanded", String(open));
    menuButton.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
    outside.forEach((el) => {
      el.inert = open;
    });
    if (open) menu.querySelector("a")?.focus();
    else if (returnFocus) menuButton.focus();
  };

  menuButton.addEventListener("click", () => setMenu(!isOpen(), true));
  menu.addEventListener("click", (event) => {
    if (isOpen() && event.target.closest("a")) setMenu(false, false);
  });
  document.addEventListener("keydown", (event) => {
    if (!isOpen()) return;
    if (event.key === "Escape") {
      event.preventDefault();
      setMenu(false, true);
    } else if (event.key === "Tab") {
      const items = [menuButton, ...$$("a", menu)];
      const index = items.indexOf(document.activeElement);
      const next = event.shiftKey ? index - 1 : index + 1;
      event.preventDefault();
      items[(next + items.length) % items.length].focus();
    }
  });
  desktop.addEventListener("change", () => {
    if (isOpen()) setMenu(false, false);
  });
}

// FAQ (support) : recherche et filtres en amélioration progressive.
const faqSearch = document.querySelector("[data-faq-search]");
const faqItems = $$("[data-faq-item]");
const filterButtons = $$("[data-filter]");
const resultCount = document.querySelector("[data-result-count]");
const faqEmpty = document.querySelector("[data-faq-empty]");
let activeFilter = "all";

function normalize(value) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function updateFaq() {
  if (!faqItems.length) return;

  const query = normalize(faqSearch?.value.trim() || "");
  let visible = 0;

  faqItems.forEach((item) => {
    const matchesFilter = activeFilter === "all" || item.dataset.category === activeFilter;
    const matchesSearch = !query || normalize(item.textContent || "").includes(query);
    item.hidden = !(matchesFilter && matchesSearch);
    if (!item.hidden) visible += 1;
  });

  if (resultCount) resultCount.textContent = `${visible} ${visible > 1 ? "réponses" : "réponse"}`;
  if (faqEmpty) faqEmpty.hidden = visible !== 0;
}

function setFilter(name) {
  activeFilter = name;
  filterButtons.forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.filter === name));
  });
  updateFaq();
}

filterButtons.forEach((button) => {
  const name = button.dataset.filter || "all";
  const count = button.querySelector("[data-count]");
  if (count) count.textContent = faqItems.filter((item) => name === "all" || item.dataset.category === name).length;
  button.addEventListener("click", () => setFilter(name));
});

if (faqSearch) {
  // Liens existants : /support?q=supprimer#faq ; sujets de l'accueil : ?cat=compte
  const initialQuery = new URLSearchParams(window.location.search).get("q");
  if (initialQuery) faqSearch.value = initialQuery;
  const initialCategory = new URLSearchParams(window.location.search).get("cat");
  if (filterButtons.some((button) => button.dataset.filter === initialCategory)) activeFilter = initialCategory;
  faqSearch.addEventListener("input", updateFaq);
  setFilter(activeFilter);
}

/* Ouverture directe d'une question via ancre (#delete-account, #account-deletion,
   #supprimer-compte, #securite…) : Google Play, l'App Store et l'app arrivent
   sur la question déjà ouverte, visible sous l'en-tête collant. */
(function () {
  var DELETE_ALIASES = ["delete-account", "account-deletion", "supprimer-compte"];
  function resolveDetails(hash) {
    if (!hash) return null;
    if (DELETE_ALIASES.indexOf(hash) !== -1) return document.getElementById("supprimer-compte");
    var el = document.getElementById(hash);
    if (!el) return null;
    return el.tagName === "DETAILS" ? el : el.closest("details.qa");
  }
  function openFromHash(event) {
    var details = resolveDetails(decodeURIComponent(window.location.hash.slice(1)));
    if (!details) return;
    details.hidden = false; // annule un éventuel filtre catégorie/recherche
    details.open = true;
    details.classList.add("is-target");
    window.setTimeout(function () {
      details.classList.remove("is-target");
    }, 2600);
    window.requestAnimationFrame(function () {
      // Arrivée depuis l'app ou un store : saut direct ; lien interne : défilement doux.
      details.scrollIntoView({ block: "start", behavior: event && !reduceMotion.matches ? "smooth" : "instant" });
    });
  }
  window.addEventListener("hashchange", openFromHash);
  openFromHash();
})();

/* Pages légales : sommaire en colonne collante (≥ 1024 px) ou sélecteur de
   section collant (« 3/13 · Compte »), mis à jour au défilement ; navigation
   précédent/suivant sous chaque section sur mobile. */
const toc = document.querySelector("[data-toc]");

if (toc) {
  const toggle = toc.querySelector("[data-toc-toggle]");
  const current = toc.querySelector("[data-toc-current]");
  const links = $$(".toc-list a", toc);
  const sections = links.map((link) => document.getElementById(link.hash.slice(1)));
  const setToc = (open) => {
    toc.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
  };
  let index = -1;
  // Ligne de lecture : sous l'en-tête collant (et le sélecteur sur mobile).
  const readingLine = () => {
    const header = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--hdr")) || 64;
    return Math.round(header + (desktop.matches ? 68 : toc.offsetHeight + 24));
  };

  let line = 0;
  const update = () => {
    let next = 0;
    sections.forEach((section, i) => {
      if (section.getBoundingClientRect().top <= line) next = i;
    });
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) next = sections.length - 1;
    if (next === index) return;
    index = next;
    links.forEach((link, i) => {
      if (i === index) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
    current.innerHTML = "";
    const position = document.createElement("span");
    position.className = "toc-pos";
    position.textContent = `${index + 1}/${links.length}`;
    current.append(position, ` · ${links[index].textContent}`);
  };

  toggle.addEventListener("click", () => setToc(!toc.classList.contains("is-open")));
  toc.addEventListener("click", (event) => {
    if (event.target.closest("a")) setToc(false);
  });
  toc.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && toc.classList.contains("is-open")) {
      setToc(false);
      toggle.focus();
    }
  });
  document.addEventListener("click", (event) => {
    if (!toc.contains(event.target)) setToc(false);
  });

  // Le sélecteur suit la section lue : un IntersectionObserver surveille une
  // ligne fine sous l'en-tête (la section qui la couvre change) et la fin de page.
  let observer;
  const observe = () => {
    observer?.disconnect();
    line = readingLine();
    observer = new IntersectionObserver(update, {
      rootMargin: `-${line}px 0px -${Math.max(0, window.innerHeight - line - 2)}px 0px`,
    });
    sections.forEach((section) => observer.observe(section));
    update();
  };
  const end = document.querySelector(".legal-end");
  if (end) new IntersectionObserver(update).observe(end);
  window.addEventListener("resize", observe);
  observe();

  // Le défilement vers l'ancre de l'URL (#publicite…) se refait une fois la
  // mise en page stabilisée (police chargée), pour arriver pile sur la section.
  const target = window.location.hash && document.getElementById(decodeURIComponent(window.location.hash.slice(1)));
  if (target) window.addEventListener("load", () => target.scrollIntoView({ behavior: "instant" }), { once: true });
}
