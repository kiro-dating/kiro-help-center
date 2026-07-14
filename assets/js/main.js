const body = document.body;
const menuButton = document.querySelector("[data-menu-button]");
const navLinks = document.querySelector("[data-nav-links]");
const currentPath = window.location.pathname.split("/").pop() || "index.html";

document.querySelectorAll("[data-nav-link]").forEach((link) => {
  const linkPath = link.getAttribute("href");
  if (linkPath === currentPath) {
    link.setAttribute("aria-current", "page");
  }
});

if (menuButton && navLinks) {
  menuButton.addEventListener("click", () => {
    const isOpen = body.classList.toggle("menu-open");
    menuButton.setAttribute("aria-expanded", String(isOpen));
  });

  navLinks.addEventListener("click", (event) => {
    if (event.target.matches("a")) {
      body.classList.remove("menu-open");
      menuButton.setAttribute("aria-expanded", "false");
    }
  });
}

const faqSearch = document.querySelector("[data-faq-search]");
const faqItems = Array.from(document.querySelectorAll("[data-faq-item]"));
const filterButtons = Array.from(document.querySelectorAll("[data-filter]"));
const resultCount = document.querySelector("[data-result-count]");
const helpSearchForm = document.querySelector("[data-help-search-form]");
const helpSearchInput = document.querySelector("[data-help-search-input]");
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

helpSearchForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const query = helpSearchInput?.value.trim();
  const suffix = query ? `?q=${encodeURIComponent(query)}#faq` : "#faq";
  window.location.href = `support.html${suffix}`;
});

faqSearch?.addEventListener("input", updateFaq);
updateFaq();

// Fermeture du menu mobile : touche Échap ou clic à l'extérieur
function closeMenu() {
  if (!body.classList.contains("menu-open")) return;
  body.classList.remove("menu-open");
  menuButton?.setAttribute("aria-expanded", "false");
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeMenu();
});

document.addEventListener("click", (event) => {
  if (body.classList.contains("menu-open") && !event.target.closest(".site-header")) {
    closeMenu();
  }
});

// Bouton « retour en haut » (utile sur les longues pages légales)
const backToTop = document.createElement("button");
backToTop.type = "button";
backToTop.className = "back-to-top";
backToTop.setAttribute("aria-label", "Retour en haut de page");
backToTop.textContent = "↑";
document.body.appendChild(backToTop);

backToTop.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

let backToTopTick = false;
window.addEventListener(
  "scroll",
  () => {
    if (backToTopTick) return;
    backToTopTick = true;
    requestAnimationFrame(() => {
      backToTop.classList.toggle("is-visible", window.scrollY > 640);
      backToTopTick = false;
    });
  },
  { passive: true }
);

// Carrousel des plans (mobile) : flèches + défilement par carte
const planTrack = document.querySelector("[data-plan-track]");
const planPrev = document.querySelector("[data-plan-prev]");
const planNext = document.querySelector("[data-plan-next]");

if (planTrack && planPrev && planNext) {
  const cardStep = () => {
    const card = planTrack.querySelector(".plan-card");
    if (!card) return planTrack.clientWidth;
    const styles = window.getComputedStyle(planTrack);
    const gap = parseFloat(styles.columnGap || styles.gap) || 0;
    return card.getBoundingClientRect().width + gap;
  };

  planPrev.addEventListener("click", () => {
    planTrack.scrollBy({ left: -cardStep(), behavior: "smooth" });
  });

  planNext.addEventListener("click", () => {
    planTrack.scrollBy({ left: cardStep(), behavior: "smooth" });
  });

  const updatePlanNav = () => {
    const maxScroll = planTrack.scrollWidth - planTrack.clientWidth - 1;
    planPrev.disabled = planTrack.scrollLeft <= 0;
    planNext.disabled = planTrack.scrollLeft >= maxScroll;
  };

  planTrack.addEventListener("scroll", updatePlanNav, { passive: true });
  window.addEventListener("resize", updatePlanNav);
  updatePlanNav();
}

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
