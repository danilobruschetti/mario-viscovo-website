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
const detailOrigins = new WeakMap();

function rememberDetailOrigin(detail) {
  if (!detail || detailOrigins.has(detail)) return;
  detailOrigins.set(detail, {
    parent: detail.parentNode,
    next: detail.nextSibling,
  });
}

function restoreDetailOrigin(detail) {
  const origin = detailOrigins.get(detail);
  if (!detail || !origin?.parent || detail.parentNode === origin.parent) return;
  origin.parent.insertBefore(detail, origin.next);
}

function ensureDetailCloseButton(detail) {
  if (!detail || detail.querySelector('.detail-close')) return;
  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'detail-close';
  close.setAttribute('aria-label', 'Chiudi approfondimento');
  close.textContent = 'Chiudi';
  close.addEventListener('click', closeOpenDetails);
  detail.prepend(close);
}

function closeOpenDetails() {
  detailButtons.forEach((button) => {
    const detail = document.getElementById(button.dataset.expand);
    detail?.classList.remove('is-open');
    if (detail) restoreDetailOrigin(detail);
    button.classList.remove('is-open');
    button.setAttribute('aria-expanded', 'false');
    button.textContent = 'Approfondisci';
  });
  document.body.classList.remove('detail-modal-open');
}
detailButtons.forEach((button) => {
  button.setAttribute('aria-expanded', 'false');
  const detail = document.getElementById(button.dataset.expand);
  rememberDetailOrigin(detail);
  ensureDetailCloseButton(detail);
  button.addEventListener('click', () => {
    const detail = document.getElementById(button.dataset.expand);
    if (!detail) return;
    const willOpen = !detail.classList.contains('is-open');
    closeOpenDetails();
    if (willOpen) {
      rememberDetailOrigin(detail);
      ensureDetailCloseButton(detail);
      document.body.appendChild(detail);
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
const blogArchive = `${blogHome}/archive`;
const blogFeed = `${blogHome}/feed`;
const blogArchiveApi = `${blogHome}/api/v1/archive?sort=new&limit=3`;
const blogCacheKey = 'mario-viscovo-blog-cache-v2';
let blogRetryTimer = null;
let blogAttempt = 0;

function safeBlogText(value = '') {
  return String(value).replace(/[&<>\"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '\"': '&quot;' }[char]));
}

function renderBlogPosts(posts, { cached = false } = {}) {
  if (!blogContainer) return;
  const validPosts = posts
    .filter((post) => post && post.title && post.link)
    .slice(0, 3);

  if (!validPosts.length) {
    renderBlogLoading();
    return;
  }

  blogContainer.setAttribute('data-blog-loaded', 'true');
  blogContainer.innerHTML = validPosts.map((post) => {
    const link = post.link && post.link !== blogHome ? post.link : blogArchive;
    return `<article>
      ${post.date ? `<small>${safeBlogText(post.date)}</small>` : cached ? '<small>Ultimi articoli salvati</small>' : ''}
      <strong>${safeBlogText(post.title)}</strong>
      ${post.description ? `<p>${safeBlogText(post.description)}</p>` : ''}
      <a href="${safeBlogText(link)}" target="_blank" rel="noopener">Leggi l’articolo</a>
    </article>`;
  }).join('');
}

function renderBlogLoading() {
  if (!blogContainer || blogContainer.getAttribute('data-blog-loaded') === 'true') return;
  const attemptText = blogAttempt > 0 ? ` Tentativo ${blogAttempt + 1} in corso.` : '';
  blogContainer.innerHTML = `<article class="blog-state blog-state-loading">
    <strong>Sto caricando gli ultimi articoli.</strong>
    <p>Il feed esterno può essere lento al primo accesso.${attemptText} La pagina continua a riprovare in automatico, senza mostrare contenuti segnaposto.</p>
    <a href="${blogArchive}" target="_blank" rel="noopener">Apri il blog</a>
  </article>`;
}

function readCachedBlogPosts() {
  try {
    const raw = window.localStorage?.getItem(blogCacheKey);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.posts)) return [];
    return parsed.posts.filter((post) => post && post.title && post.link).slice(0, 3);
  } catch (error) {
    return [];
  }
}

function cacheBlogPosts(posts) {
  try {
    const validPosts = posts.filter((post) => post && post.title && post.link).slice(0, 3);
    if (validPosts.length) {
      window.localStorage?.setItem(blogCacheKey, JSON.stringify({ savedAt: Date.now(), posts: validPosts }));
    }
  } catch (error) {
    // Cache non essenziale: se non disponibile si procede normalmente.
  }
}

function stripHtml(value = '') {
  const div = document.createElement('div');
  div.innerHTML = value;
  return (div.textContent || div.innerText || '').replace(/\s+/g, ' ').trim();
}

function formatDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' });
}

async function fetchWithTimeout(url, options = {}, timeout = 14000) {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      cache: 'no-store',
      headers: { Accept: 'application/json, application/xml, text/xml, text/plain, */*', ...(options.headers || {}) }
    });
    if (!response.ok) throw new Error(`Risposta non disponibile: ${response.status}`);
    return response;
  } finally {
    window.clearTimeout(timer);
  }
}

function normalizeBlogLink(value = '') {
  try {
    const normalized = new URL(value, blogHome).toString();
    return normalized.includes('substack.com') ? normalized : blogArchive;
  } catch (error) {
    return blogArchive;
  }
}

function mapBlogPost(post = {}) {
  return {
    title: stripHtml(post.title || post.name || ''),
    description: stripHtml(post.subtitle || post.description || post.content || post.preview || '').slice(0, 165),
    date: formatDate(post.post_date || post.pubDate || post.published_at || post.created_at || post.published),
    link: normalizeBlogLink(post.link || post.canonical_url || post.url || post.guid || post.slug || blogArchive)
  };
}

function normalizePosts(posts = []) {
  return posts.map(mapBlogPost)
    .filter((post) => post.title && post.link && post.link !== blogHome)
    .slice(0, 3);
}

function rss2JsonUrl(feedUrl) {
  const cacheBuster = Math.floor(Date.now() / 600000);
  return `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}&count=3&_=${cacheBuster}`;
}

async function fetchViaRss2Json(feedUrl = blogFeed) {
  const response = await fetchWithTimeout(rss2JsonUrl(feedUrl), {}, 16000);
  const data = await response.json();
  if (data.status && data.status !== 'ok') throw new Error('RSS non disponibile');
  return normalizePosts(data.items || []);
}

async function fetchTextViaAllOrigins(url) {
  const endpoint = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}&_=${Date.now()}`;
  const response = await fetchWithTimeout(endpoint, {}, 16000);
  const data = await response.json();
  if (!data || !data.contents) throw new Error('Proxy non disponibile');
  return data.contents;
}

async function fetchArchiveViaAllOrigins() {
  const contents = await fetchTextViaAllOrigins(blogArchiveApi);
  const data = JSON.parse(contents);
  const posts = Array.isArray(data) ? data : (data.posts || data.items || []);
  return normalizePosts(posts);
}

function firstText(node, selectors) {
  for (const selector of selectors) {
    const found = node.querySelector(selector);
    const text = found?.textContent?.trim();
    if (text) return text;
  }
  return '';
}

function linkFromFeedItem(item) {
  const direct = item.querySelector('link')?.textContent?.trim();
  const href = item.querySelector('link[href]')?.getAttribute('href');
  return normalizeBlogLink(href || direct || blogArchive);
}

function parseFeedXml(xmlText) {
  const xml = new DOMParser().parseFromString(xmlText, 'application/xml');
  if (xml.querySelector('parsererror')) throw new Error('Feed non leggibile');
  return Array.from(xml.querySelectorAll('item, entry')).slice(0, 3).map((item) => ({
    title: firstText(item, ['title']) || 'Articolo',
    link: linkFromFeedItem(item),
    description: firstText(item, ['description', 'summary', 'content\\:encoded', 'encoded', 'content']),
    pubDate: firstText(item, ['pubDate', 'published', 'updated'])
  })).map(mapBlogPost).filter((item) => item.title && item.link && item.link !== blogHome).slice(0, 3);
}

async function fetchFeedViaAllOrigins(feedUrl = blogFeed) {
  const contents = await fetchTextViaAllOrigins(feedUrl);
  return parseFeedXml(contents);
}

async function loadBlogFeed() {
  if (!blogContainer) return false;
  const openRssFeed = 'https://openrss.org/marioviscovomtc.substack.com';

  // Non chiamo direttamente Substack dal browser: il dominio blocca CORS.
  // Uso sorgenti CORS-friendly e continuo a riprovare finché una risponde.
  const sources = [
    () => fetchViaRss2Json(blogFeed),
    () => fetchViaRss2Json(openRssFeed),
    () => fetchFeedViaAllOrigins(blogFeed),
    () => fetchFeedViaAllOrigins(openRssFeed),
    () => fetchArchiveViaAllOrigins()
  ];

  for (const source of sources) {
    try {
      const items = await source();
      if (items.length) {
        cacheBlogPosts(items);
        renderBlogPosts(items);
        blogAttempt = 0;
        return true;
      }
    } catch (error) {
      // Prova la sorgente successiva senza bloccare l'interfaccia.
    }
  }

  return false;
}

async function retryBlogUntilLoaded() {
  if (!blogContainer || blogContainer.getAttribute('data-blog-loaded') === 'true') return;
  window.clearTimeout(blogRetryTimer);
  renderBlogLoading();
  const loaded = await loadBlogFeed();
  if (loaded) return;
  blogAttempt += 1;
  const nextDelay = Math.min(45000, 4500 + blogAttempt * 3500);
  blogRetryTimer = window.setTimeout(retryBlogUntilLoaded, nextDelay);
}

if (blogContainer) {
  const cachedPosts = readCachedBlogPosts();
  if (cachedPosts.length) renderBlogPosts(cachedPosts, { cached: true });
  else renderBlogLoading();

  const startBlogLoad = () => retryBlogUntilLoaded();
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(startBlogLoad, { timeout: 1600 });
  } else {
    window.setTimeout(startBlogLoad, 650);
  }
}

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
