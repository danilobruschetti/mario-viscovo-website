const $ = (selector, context = document) => context.querySelector(selector);
const $$ = (selector, context = document) => Array.from(context.querySelectorAll(selector));

const year = $('[data-year]');
if (year) year.textContent = new Date().getFullYear();

const header = $('[data-header]');
const scrollbar = $('.scrollbar');
function updateScroll() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  if (scrollbar) scrollbar.style.width = max > 0 ? `${(window.scrollY / max) * 100}%` : '0%';
  if (header) header.classList.toggle('is-scrolled', window.scrollY > 14);
}
document.addEventListener('scroll', updateScroll, { passive: true });
updateScroll();

const nav = $('#nav');
const navToggle = $('.nav-toggle');
navToggle?.addEventListener('click', () => {
  const open = nav?.classList.toggle('is-open');
  navToggle.setAttribute('aria-expanded', String(Boolean(open)));
});
$$('.nav a, .mobile-bar a').forEach((link) => {
  link.addEventListener('click', () => {
    nav?.classList.remove('is-open');
    navToggle?.setAttribute('aria-expanded', 'false');
  });
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.14 });
$$('.reveal').forEach((element) => observer.observe(element));

const concepts = {
  qi: ['氣 · Qì', 'Il movimento vitale', 'Il Qi è il principio vitale che permea l’uomo e, nel suo fluire, forma canali e ramificazioni che sostengono le funzioni corporee.'],
  shen: ['神 · Shén', 'Presenza e coscienza', 'Lo Shen riguarda la qualità sottile della presenza, l’orientamento interiore e la dimensione psichica che accompagna ogni trasformazione corporea.'],
  corpo: ['身 · Corpo', 'Il linguaggio diretto', 'Il corpo manifesta ciò che accade in profondità prima che diventi pensiero ordinato o parola: tensioni, stasi, vuoti e movimenti raccontano una storia.'],
  relazione: ['和 · Armonia', 'Il campo dell’incontro', 'Il trattamento non è una tecnica applicata dall’esterno, ma una relazione fatta di ascolto, contatto, ritmo e fiducia.']
};
const conceptPanel = $('[data-concept-panel]');
$$('[data-concept]').forEach((button) => {
  button.addEventListener('click', () => {
    $$('[data-concept]').forEach((item) => item.classList.toggle('is-active', item === button));
    const value = concepts[button.dataset.concept];
    if (conceptPanel && value) {
      conceptPanel.innerHTML = `<span>${value[0]}</span><h3>${value[1]}</h3><p>${value[2]}</p>`;
    }
  });
});


const pathContent = {
  domanda: ['01 · Domanda', 'Si parte dal motivo reale dell’incontro.', 'Dolore, tensione, stanchezza, passaggio personale, bisogno di ascolto o ricerca: il primo passaggio serve a distinguere il sintomo visibile dalla domanda più profonda.', ['racconto della persona e storia corporea', 'abitudini, ritmo, energia, qualità del sonno e stress', 'obiettivo pratico: sollievo, orientamento, continuità']],
  lettura: ['02 · Lettura', 'La Medicina Cinese dà una mappa di interpretazione.', 'La valutazione considera pieni e vuoti, stasi, freddo, calore, umidità, movimento del Qi e relazione tra corpo, emozioni e ambiente.', ['segnali corporei e qualità energetica', 'relazione tra sintomo, storia e costituzione', 'priorità: cosa trattare subito e cosa accompagnare nel tempo']],
  scelta: ['03 · Scelta', 'La tecnica nasce dalla lettura, non il contrario.', 'Tuina, moxa, coppettazione, guasha, fitoterapia, dietetica o counseling vengono scelti in modo coerente con la persona e con il momento.', ['manualità e contatto quando serve mobilizzare', 'calore e sostegno quando serve nutrire o sciogliere', 'parola e simbolo quando la domanda è anche di senso']],
  integrazione: ['04 · Integrazione', 'Il trattamento diventa orientamento pratico.', 'La seduta non si chiude con un effetto isolato: quando utile, lascia indicazioni, consapevolezza e una direzione di lavoro personale.', ['continuità del percorso se necessaria', 'attenzione a corpo, ritmo e abitudini', 'integrazione tra pratica, ascolto e ricerca personale']]
};
const pathPanel = $('[data-path-panel]');
function getPathMarkup(data) {
  return `<span>${data[0]}</span><h3>${data[1]}</h3><p>${data[2]}</p><ul>${data[3].map((item) => `<li>${item}</li>`).join('')}</ul>`;
}
function stabilizePathPanelHeight() {
  if (!pathPanel) return;
  const clone = pathPanel.cloneNode(false);
  clone.className = `${pathPanel.className} is-measuring`;
  clone.style.position = 'absolute';
  clone.style.visibility = 'hidden';
  clone.style.pointerEvents = 'none';
  clone.style.width = `${pathPanel.getBoundingClientRect().width}px`;
  clone.style.minHeight = '0';
  document.body.appendChild(clone);
  const maxHeight = Object.values(pathContent).reduce((height, data) => {
    clone.innerHTML = getPathMarkup(data);
    return Math.max(height, clone.scrollHeight);
  }, 0);
  clone.remove();
  if (maxHeight) pathPanel.style.setProperty('--path-panel-min-height', `${Math.ceil(maxHeight)}px`);
}
if (pathPanel) {
  stabilizePathPanelHeight();
  window.addEventListener('resize', () => window.requestAnimationFrame(stabilizePathPanelHeight), { passive: true });
}
$$('[data-path]').forEach((button) => {
  button.addEventListener('click', () => {
    $$('[data-path]').forEach((item) => item.classList.toggle('is-active', item === button));
    const data = pathContent[button.dataset.path];
    if (pathPanel && data) {
      pathPanel.classList.add('is-switching');
      window.setTimeout(() => {
        pathPanel.innerHTML = getPathMarkup(data);
        stabilizePathPanelHeight();
        window.requestAnimationFrame(() => pathPanel.classList.remove('is-switching'));
      }, 110);
    }
  });
});

const techShell = $('[data-tech-shell]');
if (techShell) {
  const buttons = $$('[data-tech]', techShell);
  const panels = $$('[data-panel]', techShell);
  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      buttons.forEach((item) => item.classList.toggle('is-active', item === button));
      panels.forEach((panel) => panel.classList.toggle('is-active', panel.dataset.panel === button.dataset.tech));
    });
  });
}

const detailButtons = $$('[data-expand]');
function closeOpenDetails() {
  detailButtons.forEach((button) => {
    const detail = document.getElementById(button.dataset.expand);
    detail?.classList.remove('is-open');
    button.classList.remove('is-open');
    button.setAttribute('aria-expanded', 'false');
    button.textContent = 'Approfondisci';
  });
  document.body.classList.remove('detail-modal-open');
}
detailButtons.forEach((button) => {
  button.setAttribute('aria-expanded', 'false');
  button.addEventListener('click', () => {
    const detail = document.getElementById(button.dataset.expand);
    if (!detail) return;
    const willOpen = !detail.classList.contains('is-open');
    closeOpenDetails();
    if (willOpen) {
      detail.classList.add('is-open');
      button.classList.add('is-open');
      button.setAttribute('aria-expanded', 'true');
      button.textContent = 'Chiudi approfondimento';
      document.body.classList.add('detail-modal-open');
    }
  });
});
document.addEventListener('click', (event) => {
  const openDetail = $('.inline-detail.is-open');
  if (!openDetail) return;
  const clickedToggle = event.target.closest?.('[data-expand]');
  const clickedInside = event.target.closest?.('.inline-detail.is-open');
  const clickedModalFrame = event.target.classList?.contains('inline-detail') && event.target.classList?.contains('is-open');
  if (clickedModalFrame || (!clickedToggle && !clickedInside)) closeOpenDetails();
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeOpenDetails();
});


// FAQ evoluta statica: ricerca, filtri, risultati compatti e accordion senza servizi esterni
const faqSection = $('[data-faq-section]');
if (faqSection) {
  const searchInput = $('[data-faq-search]', faqSection);
  const resetButton = $('[data-faq-reset]', faqSection);
  const moreButton = $('[data-faq-more]', faqSection);
  const filterButtons = $$('[data-faq-filter]', faqSection);
  const faqItems = $$('[data-faq-item]', faqSection);
  const emptyState = $('[data-faq-empty]', faqSection);
  const counter = $('[data-faq-counter]', faqSection);
  const initialVisibleLimit = 6;
  let activeFilter = 'all';
  let showAllFaqResults = false;

  const normalizeFaqText = (value = '') => String(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

  function closeFaqItem(item) {
    item.classList.remove('is-open');
    item.querySelector('.faq-question')?.setAttribute('aria-expanded', 'false');
  }

  function getMatchedFaqItems(query) {
    return faqItems.filter((item) => {
      const categories = (item.dataset.category || '').split(/\s+/);
      const content = normalizeFaqText(`${item.textContent || ''} ${item.dataset.keywords || ''}`);
      const matchesFilter = activeFilter === 'all' || categories.includes(activeFilter);
      const matchesQuery = !query || query.split(/\s+/).every((word) => content.includes(word));
      return matchesFilter && matchesQuery;
    });
  }

  function updateFaqResults() {
    const query = normalizeFaqText(searchInput?.value || '');
    const matchedItems = getMatchedFaqItems(query);
    const visibleLimit = showAllFaqResults ? matchedItems.length : initialVisibleLimit;

    faqItems.forEach((item) => {
      const matchIndex = matchedItems.indexOf(item);
      const matches = matchIndex !== -1;
      const insideLimit = matches && matchIndex < visibleLimit;
      const show = matches && insideLimit;

      item.hidden = !show;
      item.classList.toggle('is-filtered-out', !matches);
      item.classList.toggle('is-collapsed-result', matches && !insideLimit);
      if (!show) closeFaqItem(item);
    });

    if (counter) {
      const total = matchedItems.length;
      if (total === 0) {
        counter.textContent = 'Nessuna risposta disponibile';
      } else if (!showAllFaqResults && total > initialVisibleLimit) {
        counter.textContent = `${initialVisibleLimit} risposte mostrate su ${total}`;
      } else {
        counter.textContent = total === 1 ? '1 risposta disponibile' : `${total} risposte disponibili`;
      }
    }

    if (moreButton) {
      const hasOverflow = matchedItems.length > initialVisibleLimit;
      moreButton.hidden = !hasOverflow;
      moreButton.textContent = showAllFaqResults ? 'Mostra meno risposte' : `Mostra altre ${matchedItems.length - initialVisibleLimit} risposte`;
    }

    if (emptyState) emptyState.hidden = matchedItems.length !== 0;
  }

  faqItems.forEach((item) => {
    const button = item.querySelector('.faq-question');
    button?.addEventListener('click', () => {
      const willOpen = !item.classList.contains('is-open');
      faqItems.forEach((other) => {
        if (other !== item) closeFaqItem(other);
      });
      item.classList.toggle('is-open', willOpen);
      button.setAttribute('aria-expanded', String(willOpen));
    });
  });

  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      activeFilter = button.dataset.faqFilter || 'all';
      showAllFaqResults = false;
      filterButtons.forEach((item) => item.classList.toggle('is-active', item === button));
      updateFaqResults();
    });
  });

  searchInput?.addEventListener('input', () => {
    showAllFaqResults = false;
    updateFaqResults();
  });

  moreButton?.addEventListener('click', () => {
    showAllFaqResults = !showAllFaqResults;
    updateFaqResults();
    if (!showAllFaqResults) faqSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  resetButton?.addEventListener('click', () => {
    activeFilter = 'all';
    showAllFaqResults = false;
    if (searchInput) searchInput.value = '';
    filterButtons.forEach((item) => item.classList.toggle('is-active', item.dataset.faqFilter === 'all'));
    faqItems.forEach(closeFaqItem);
    updateFaqResults();
    searchInput?.focus({ preventScroll: true });
  });

  updateFaqResults();
}

const blogContainer = $('[data-blog-posts]');
const blogHome = 'https://marioviscovomtc.substack.com';
const blogArchiveApi = `${blogHome}/api/v1/archive?sort=new&limit=3`;
const fallbackPosts = [
  ['Mario Viscovo', 'Riflessioni, analisi sindromiche, pratica clinica e ponti tra Medicina Cinese e psicologia.', `${blogHome}/archive`],
  ['Medicina Cinese e pratica', 'Appunti su corpo, energia, cultura cinese e lavoro con la persona.', `${blogHome}/archive`],
  ['Corpo, simbolo e relazione', 'Una traccia di lettura per seguire gli aggiornamenti pubblicati da Mario Viscovo.', `${blogHome}/archive`]
];

function renderBlogPosts(posts) {
  if (!blogContainer) return;
  blogContainer.innerHTML = posts.slice(0, 3).map((post) => {
    const link = post.link && post.link !== blogHome ? post.link : `${blogHome}/archive`;
    return `
      <article>
        <small>${post.date || 'Articolo'}</small>
        <strong>${post.title}</strong>
        <p>${post.description || 'Leggi l’articolo nello spazio editoriale di Mario Viscovo.'}</p>
        <a href="${link}" target="_blank" rel="noopener">Leggi articolo</a>
      </article>
    `;
  }).join('');
}

function stripHtml(text = '') {
  const parser = new DOMParser();
  const decoded = parser.parseFromString(text, 'text/html').documentElement.textContent || '';
  return decoded
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function firstText(item, selectors) {
  for (const selector of selectors) {
    const value = item.querySelector(selector)?.textContent?.trim();
    if (value) return value;
  }
  return '';
}

function formatDate(value) {
  if (!value) return 'Articolo';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Articolo';
  return new Intl.DateTimeFormat('it-IT', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
}

function normalizeUrl(url) {
  if (!url) return '';
  const clean = String(url).trim().replace(/^<!\[CDATA\[/, '').replace(/\]\]>$/, '').replace(/&amp;/g, '&');
  try {
    return new URL(clean, blogHome).toString();
  } catch (error) {
    return '';
  }
}

function isArticleUrl(url = '') {
  return /^https?:\/\/[^\s]+\/p\/[^/?#]+/i.test(url)
    || /^https?:\/\/substack\.com\/home\/post\/p-\d+/i.test(url)
    || /^https?:\/\/[^\s]+\/post\/p-\d+/i.test(url);
}

function extractUrlsFromString(text = '') {
  return Array.from(String(text).matchAll(/https?:\/\/[^"'<>\s)]+/g))
    .map((match) => normalizeUrl(match[0]))
    .filter(Boolean);
}

function collectCandidates(item) {
  const raw = new XMLSerializer().serializeToString(item);
  const urls = new Set();

  item.querySelectorAll('link').forEach((link) => {
    [link.getAttribute('href'), link.getAttribute('url'), link.textContent].forEach((value) => {
      const url = normalizeUrl(value);
      if (url) urls.add(url);
    });
  });

  ['guid', 'id', 'canonical_url', 'web_url', 'post_url', 'url'].forEach((selector) => {
    const url = normalizeUrl(firstText(item, [selector]));
    if (url) urls.add(url);
  });

  extractUrlsFromString(raw).forEach((url) => urls.add(url));
  return Array.from(urls).filter(Boolean);
}

function normalizePostLink(item) {
  const candidates = collectCandidates(item);
  const article = candidates.find(isArticleUrl);
  if (article) return article;

  const substackArticle = candidates.find((url) => url.startsWith(`${blogHome}/p/`));
  if (substackArticle) return substackArticle;

  const serialized = new XMLSerializer().serializeToString(item);
  const numericId = serialized.match(/(?:post|p)[_-]?(?:id)?[^0-9]{0,20}(\d{5,})/i)?.[1];
  if (numericId) return `https://substack.com/home/post/p-${numericId}`;

  const nonGeneric = candidates.find((url) => {
    const clean = url.replace(/\/$/, '');
    return clean !== blogHome && clean !== `${blogHome}/archive` && !clean.includes('/subscribe');
  });
  return nonGeneric || `${blogHome}/archive`;
}

async function fetchText(url) {
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) throw new Error('Risorsa non disponibile');
  return response.text();
}

async function fetchJsonWithFallback(url) {
  const urls = [
    url,
    `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
    `https://api.codetabs.com/v1/proxy/?quest=${encodeURIComponent(url)}`
  ];

  let lastError;
  for (const currentUrl of urls) {
    try {
      const text = await fetchText(currentUrl);
      return JSON.parse(text);
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError || new Error('JSON non disponibile');
}

function normalizeArchivePost(post) {
  const link = normalizeUrl(
    post.canonical_url
    || post.web_url
    || post.post_url
    || post.url
    || post.path
    || (post.slug ? `/p/${post.slug}` : '')
  );

  return {
    title: stripHtml(post.title) || 'Articolo',
    link: isArticleUrl(link) || link.startsWith(`${blogHome}/p/`) ? link : `${blogHome}/archive`,
    description: stripHtml(post.subtitle || post.description || post.preview || post.search_engine_description || '').slice(0, 165),
    date: formatDate(post.post_date || post.published_at || post.created_at || post.updated_at)
  };
}

async function fetchArchivePosts() {
  const data = await fetchJsonWithFallback(blogArchiveApi);
  const posts = Array.isArray(data) ? data : (data.posts || data.items || []);
  const normalized = posts
    .map(normalizeArchivePost)
    .filter((post) => post.title && post.link && post.link !== `${blogHome}/archive`)
    .slice(0, 3);
  if (!normalized.length) throw new Error('Archivio non leggibile');
  return normalized;
}

async function fetchFeed(feedUrl) {
  const feedUrls = [
    feedUrl,
    `https://api.allorigins.win/raw?url=${encodeURIComponent(feedUrl)}`,
    `https://api.codetabs.com/v1/proxy/?quest=${encodeURIComponent(feedUrl)}`
  ];

  let lastError;
  for (const currentUrl of feedUrls) {
    try {
      const xmlText = await fetchText(currentUrl);
      const xml = new DOMParser().parseFromString(xmlText, 'application/xml');
      const parseError = xml.querySelector('parsererror');
      if (parseError) throw new Error('Feed non leggibile');
      const items = Array.from(xml.querySelectorAll('item, entry')).slice(0, 3).map((item) => ({
        title: firstText(item, ['title']) || 'Articolo',
        link: normalizePostLink(item),
        description: stripHtml(firstText(item, ['description', 'summary', 'content\\:encoded', 'encoded', 'content'])).slice(0, 165),
        date: formatDate(firstText(item, ['pubDate', 'published', 'updated']))
      })).filter((item) => item.link && item.link !== blogHome);
      if (!items.length) throw new Error('Feed vuoto');
      return items;
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError || new Error('Feed non disponibile');
}

async function loadBlogFeed() {
  if (!blogContainer) return;
  try {
    const archiveItems = await fetchArchivePosts();
    renderBlogPosts(archiveItems);
    return;
  } catch (error) {
    // fallback RSS
  }

  const feeds = [
    `${blogHome}/feed`,
    `https://openrss.org/marioviscovomtc.substack.com`
  ];

  for (const feed of feeds) {
    try {
      const items = await fetchFeed(feed);
      renderBlogPosts(items);
      return;
    } catch (error) {
      // passa al feed successivo
    }
  }

  renderBlogPosts(fallbackPosts.map(([title, description, link]) => ({ title, description, link, date: 'Articolo' })));
}
loadBlogFeed();

// Delta: sfondo con movimento leggero su scroll + invio form Formspree senza cambio pagina
const rootStyle = document.documentElement.style;
let tickingAmbient = false;
function updateAmbientBackground() {
  const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  const ratio = Math.min(1, Math.max(0, window.scrollY / max));
  rootStyle.setProperty('--scroll-ratio', ratio.toFixed(4));
  tickingAmbient = false;
}
document.addEventListener('scroll', () => {
  if (!tickingAmbient) {
    window.requestAnimationFrame(updateAmbientBackground);
    tickingAmbient = true;
  }
}, { passive: true });
document.addEventListener('pointermove', (event) => {
  const x = Math.round((event.clientX / Math.max(1, window.innerWidth)) * 100);
  const y = Math.round((event.clientY / Math.max(1, window.innerHeight)) * 100);
  rootStyle.setProperty('--ambient-x', `${x}%`);
  rootStyle.setProperty('--ambient-y', `${y}%`);
}, { passive: true });
updateAmbientBackground();

const contactForm = $('[data-contact-form]');
const formStatus = $('[data-form-status]');
if (contactForm && formStatus) {
  contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const submitButton = contactForm.querySelector('button[type="submit"]');
    const originalText = submitButton?.textContent || 'Invia richiesta';
    formStatus.textContent = 'Invio in corso…';
    formStatus.classList.remove('is-error');
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Invio…';
    }

    try {
      const response = await fetch(contactForm.action, {
        method: 'POST',
        body: new FormData(contactForm),
        headers: { Accept: 'application/json' }
      });
      if (!response.ok) throw new Error('Invio non completato');
      contactForm.reset();
      formStatus.textContent = 'Messaggio inviato. Verrai ricontattato appena possibile.';
    } catch (error) {
      formStatus.textContent = 'Non sono riuscito a inviare il messaggio. Puoi usare email, telefono o WhatsApp.';
      formStatus.classList.add('is-error');
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = originalText;
      }
    }
  });
}

// Delta finale: calendario inline per prenotazioni
const calendarPanel = $('[data-calendar-panel]');
const calendarFrame = $('[data-calendar-frame]');
const calendarLabel = $('[data-calendar-label]');
const calendarOpen = $('[data-calendar-open]');
$$('[data-calendar-select]').forEach((button) => {
  button.addEventListener('click', () => {
    const url = button.dataset.calendarUrl;
    const title = button.dataset.calendarTitle || 'Prenotazione';
    if (!url) return;
    $$('[data-calendar-select]').forEach((item) => item.classList.toggle('is-active', item === button));
    if (calendarLabel) calendarLabel.textContent = `Calendario · ${title}`;
    if (calendarOpen) calendarOpen.href = url;
    if (calendarFrame && calendarFrame.src !== url) {
      calendarFrame.src = url;
      calendarFrame.title = `Calendario prenotazioni ${title}`;
    }
    calendarPanel?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });
});
