// Centre d'aide Kiro — amélioration progressive. Sans JavaScript, le site
// reste lisible et navigable (FAQ en <details>, liens du pied de page).
const body = document.body;
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
const desktop = window.matchMedia("(min-width: 1024px)");

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

const faqSearch = document.querySelector("[data-faq-search]");
const faqItems = Array.from(document.querySelectorAll("[data-faq-item]"));
const filterButtons = Array.from(document.querySelectorAll("[data-filter]"));
const resultCount = document.querySelector("[data-result-count]");
let activeFilter = "all";

function normalize(value) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function updateFaq() {
  if (!faqItems.length) return;

  const query = normalize(faqSearch?.value || "");
  let visible = 0;

  faqItems.forEach((item) => {
    const category = item.dataset.category || "";
    const text = normalize(item.textContent || "");
    const matchesFilter = activeFilter === "all" || category === activeFilter;
    const matchesSearch = !query || text.includes(query);
    const shouldShow = matchesFilter && matchesSearch;

    item.hidden = !shouldShow;
    if (shouldShow) visible += 1;
  });

  if (resultCount) {
    const label = visible > 1 ? "réponses trouvées" : "réponse trouvée";
    resultCount.textContent = `${visible} ${label}`;
  }
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter || "all";
    filterButtons.forEach((item) => {
      item.classList.remove("is-active");
      item.setAttribute("aria-pressed", "false");
    });
    button.classList.add("is-active");
    button.setAttribute("aria-pressed", "true");
    updateFaq();
  });
});

if (faqSearch) {
  const initialQuery = new URLSearchParams(window.location.search).get("q");
  if (initialQuery) {
    faqSearch.value = initialQuery;
  }
}


faqSearch?.addEventListener("input", updateFaq);
updateFaq();

/* ── Ouverture directe d'une FAQ via ancre (#delete-account, #account-deletion,
   #supprimer-compte) : Google Play / App Store arrivent pile sur la section,
   deja ouverte et mise en evidence. Fonctionne au chargement ET apres refresh. */
(function () {
  var DELETE_ALIASES = ["delete-account", "account-deletion", "supprimer-compte"];
  function resolveDetails(hash) {
    if (!hash) return null;
    if (DELETE_ALIASES.indexOf(hash) !== -1) {
      return document.getElementById("supprimer-compte");
    }
    var el = document.getElementById(hash);
    if (!el) return null;
    return el.tagName === "DETAILS"
      ? el
      : el.closest
      ? el.closest("details.faq-item")
      : null;
  }
  function openFromHash() {
    var hash = (window.location.hash || "").replace(/^#/, "");
    var details = resolveDetails(hash);
    if (!details) return;
    details.hidden = false; // annule un eventuel filtre categorie/recherche
    details.open = true; // deplie la reponse
    details.classList.add("faq-highlight");
    window.setTimeout(function () {
      details.classList.remove("faq-highlight");
    }, 2600);
    window.setTimeout(function () {
      details.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 90);
  }
  window.addEventListener("hashchange", openFromHash);
  if (document.readyState === "loading") {
    window.addEventListener("DOMContentLoaded", openFromHash);
  } else {
    openFromHash();
  }
})();
