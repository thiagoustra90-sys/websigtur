// Interactividad del sitio. La API y Supabase gestionan los datos persistentes.

// Inicializacion despues de cargar el DOM.
// gonza: esto se ejecuta cuando el HTML terminó de cargar del todo.
// si ponés código acá afuera (fuera del DOMContentLoaded) y el HTML
// todavía no cargó, querySelector va a devolver null y nada va a funcionar.
document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;

  // guardamos el tema en localStorage para que se acuerde entre páginas
  const savedTheme = localStorage.getItem('sigtur-theme') || 'light';
  body.classList.toggle('theme-dark', savedTheme === 'dark');

  // el menú del logo no existe en la pantalla de login, así que lo saltamos
  if (!body.classList.contains('auth-remake')) buildLogoMenu(savedTheme);

  setupAuthPage();
  const oauthStatus = document.getElementById('auth-status');
  const setAuthStatus = (message, type = 'ok') => {
    if (!oauthStatus) return;
    oauthStatus.textContent = message;
    oauthStatus.dataset.type = type;
    oauthStatus.hidden = !message;
  };
  let cachedAuthToken = false;
  try { cachedAuthToken = Boolean(JSON.parse(localStorage.getItem(SIGTUR_SESSION_KEY) || 'null')?.token); } catch { /* caché inválida */ }
  if (oauthStatus && cachedAuthToken && !window.location.hash.includes('access_token')) {
    setAuthStatus('Verificando la sesión guardada...', 'loading');
  }
  processOAuthCallback(setAuthStatus)
    .then(() => sigturValidateStoredSession())
    .finally(() => {
      refreshLogoMenuAccount();
      setupAdminPage();
      setupProfilePage();
      const session = sigturGetSession();
      if (document.querySelector('.auth-remake') && session?.usuario && (!oauthStatus?.textContent || oauthStatus.dataset.type === 'loading')) {
        setAuthStatus(`Ya iniciaste sesión como ${session.usuario.nombre}.`, 'ok');
      } else if (document.querySelector('.auth-remake') && cachedAuthToken && !session?.usuario && oauthStatus?.dataset.type === 'loading') {
        setAuthStatus('No pudimos verificar la sesión guardada. Iniciá sesión nuevamente.', 'error');
      }
    });
  setupSupportPage();
  loadPublicSiteSettings();
  setupFooterAccordions();

  // --- HOME (index.html) ---
  if (body.classList.contains('page-home')) {
    setupTourismPlanning();
    setupFoodInfo();

    // gonza: acá escuchamos el scroll de la ventana. Cuando el usuario
    // baja más de 60px, le agregamos la clase 'scrolled' al navbar para
    // que cambie de estilo (el CSS se encarga del resto).
    const navbar = document.getElementById('navbar');
    if (navbar) window.addEventListener('scroll', () => navbar.classList.toggle('scrolled', window.scrollY > 60));

    // setupHomeWeather es async (ver abajo), la llamamos sin await
    // porque no necesitamos esperar el clima para que el resto de la página funcione
    setupHomeWeather();

    // --- CAROUSEL DE EVENTOS (el que está en el medio de la home) ---
    const track = document.querySelector('.carousel-track');
    const slides = document.querySelectorAll('.carousel-slide');
    const dotsEl = document.querySelector('.carousel-dots');
    const prevBtn = document.querySelector('.carousel-btn.prev');
    const nextBtn = document.querySelector('.carousel-btn.next');

    if (track && slides.length && dotsEl) {
      let current = 0;
      const total = slides.length;
      let autoTimer;
      const carousel = track.closest('.carousel');
      const stopAuto = () => { clearInterval(autoTimer); autoTimer = null; };

      // creamos un puntito por cada slide y lo agregamos al DOM
      slides.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'dot' + (i === 0 ? ' active' : '');
        dot.setAttribute('aria-label', `Mostrar evento ${i + 1}`);
        dot.setAttribute('aria-controls', 'home-event-carousel');
        dot.addEventListener('click', () => goTo(i));
        dotsEl.appendChild(dot);
      });
      slides.forEach((slide, i) => {
        slide.setAttribute('role', 'group');
        slide.setAttribute('aria-roledescription', 'diapositiva');
        slide.setAttribute('aria-label', `${i + 1} de ${total}`);
      });

      function updateDots() {
        dotsEl.querySelectorAll('.dot').forEach((dot, i) => {
          dot.classList.toggle('active', i === current);
          dot.setAttribute('aria-current', String(i === current));
          slides[i].setAttribute('aria-hidden', String(i !== current));
        });
      }

      // gonza: el truco del carrusel es mover el track con translateX.
      // si current=1 y cada slide ocupa 100%, movemos -100% → muestra el slide 2
      function goTo(index) { current = (index + total) % total; track.style.transform = `translateX(-${current * 100}%)`; updateDots(); }

      // reseteamos el timer automático cada vez que el usuario clickea una flecha
      function resetAuto() { stopAuto(); if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) autoTimer = setInterval(() => goTo(current + 1), 4500); }

      prevBtn?.addEventListener('click', () => { goTo(current - 1); resetAuto(); });
      nextBtn?.addEventListener('click', () => { goTo(current + 1); resetAuto(); });
      carousel?.addEventListener('keydown', event => {
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
          stopAuto();
          goTo(current + (event.key === 'ArrowRight' ? 1 : -1));
          event.preventDefault();
        }
      });
      carousel?.addEventListener('focusin', stopAuto);
      carousel?.addEventListener('mouseenter', stopAuto);
      carousel?.setAttribute('role', 'region');
      carousel?.setAttribute('aria-roledescription', 'carrusel');
      carousel?.setAttribute('aria-label', 'Eventos destacados');
      track.id = 'home-event-carousel';
      carousel?.addEventListener('focusout', event => { if (!carousel.contains(event.relatedTarget)) resetAuto(); });
      resetAuto();
    }

    // --- ANIMACIÓN DE ENTRADA DE LAS CARDS ---
    // gonza: IntersectionObserver es una API del browser que avisa
    // cuando un elemento entra en el viewport. Mucho mejor que calcular
    // posición con scroll, no frena la página.
    const revealEls = document.querySelectorAll('.feature-item, .prop-card, .food-card, .eventos-left, .carousel');
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            io.unobserve(entry.target); // una vez que apareció, dejamos de observarlo
          }
        });
      }, { threshold: 0.12 }); // se activa cuando el 12% del elemento es visible

      revealEls.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(28px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        io.observe(el);
      });
    }
  }

  // --- EVENTOS (eventos.html) ---
  if (body.classList.contains('page-eventos')) {
    const featTrack = document.querySelector('.feat-track');
    const featSlides = Array.from(document.querySelectorAll('.feat-track > .feat-slide:not([aria-hidden="true"]):not(.is-clone)'));
    const dotsWrap = document.querySelector('.carousel-section .carousel-dots');
    const total = featSlides.length;
    let current = 0;
    let position = 0;

    // gonza: FIX loop continuo (11/07/2026) — antes el carrusel llegaba al
    // final y se quedaba con un solo card pegadito, se veía feo. La solucion
    // es clonar las primeras slides y pegarlas al final del track: asi
    // siempre hay cards de sobra para llenar la vista, y cuando el auto-scroll
    // pasa por los clones saltamos al principio real SIN transicion (es invisible
    // para el ojo porque el clon es pixel-a-pixel igual al slide real).
    function visibleCount() {
      if (!featTrack || !featSlides.length) return 1;
      const trackWidth = featTrack.parentElement?.getBoundingClientRect().width || featTrack.getBoundingClientRect().width;
      const slideWidth = featSlides[0].getBoundingClientRect().width || 1;
      return Math.max(1, Math.min(total, Math.round(trackWidth / slideWidth)));
    }

    function setupClones() {
      featTrack?.querySelectorAll('.feat-slide.is-clone').forEach(el => el.remove());
      if (!featTrack || !total) return;
      const count = visibleCount();
      for (let i = 0; i < count; i++) {
        const clone = featSlides[i].cloneNode(true);
        clone.classList.add('is-clone');
        clone.setAttribute('aria-hidden', 'true');
        clone.querySelectorAll('a, button, input').forEach(el => el.setAttribute('tabindex', '-1'));
        featTrack.appendChild(clone);
      }
    }

    // gonza: acá calculamos el porcentaje real de cada slide en vez de
    // asumir 33.33%, porque en mobile los slides pueden ser más anchos
    function slidePercent() {
      const firstSlide = featTrack?.querySelector('.feat-slide');
      const trackWidth = featTrack?.getBoundingClientRect().width;
      return (firstSlide && trackWidth)
        ? (firstSlide.getBoundingClientRect().width / trackWidth) * 100
        : (100 / 3);
    }

    function render(withTransition) {
      if (!featTrack) return;
      if (!withTransition) featTrack.style.transition = 'none';
      featTrack.style.transform = `translateX(-${position * slidePercent()}%)`;
      if (!withTransition) {
        void featTrack.offsetHeight; // fuerza el reflow antes de sacar el "none"
        featTrack.style.transition = '';
      }
    }

    function buildDots() {
      if (!dotsWrap || !total) return;
      dotsWrap.innerHTML = '';
      for (let i = 0; i < total; i++) {
        const btn = document.createElement('button');
        btn.className = 'c-dot' + (i === 0 ? ' active' : '');
        btn.setAttribute('aria-label', `Slide ${i + 1}`);
        const inner = document.createElement('span');
        inner.className = 'c-dot-inner';
        inner.style.width = i === 0 ? '18px' : '12px';
        inner.style.height = i === 0 ? '18px' : '12px';
        btn.appendChild(inner);
        btn.addEventListener('click', () => goTo(i));
        dotsWrap.appendChild(btn);
      }
    }

    function updateDots() {
      document.querySelectorAll('.c-dot').forEach((dot, i) => {
        const inner = dot.querySelector('.c-dot-inner');
        const active = i === current;
        dot.classList.toggle('active', active);
        if (inner) { inner.style.width = active ? '18px' : '12px'; inner.style.height = active ? '18px' : '12px'; }
      });
    }

    // avanza un slide (lo usa el autoplay). Si nos pasamos del ultimo slide
    // real seguimos de largo por los clones, y una vez termina la transicion
    // reseteamos la posicion al slide real sin transicion (salto invisible)
    function next() {
      if (!featTrack || !total) return;
      position += 1;
      current = position % total;
      render(true);
      updateDots();
      if (position >= total) {
        const onEnd = () => {
          featTrack.removeEventListener('transitionend', onEnd);
          position = current;
          render(false);
        };
        featTrack.addEventListener('transitionend', onEnd);
      }
    }

    // clic directo en un punto: salto simple, sin pasar por los clones
    function goTo(index) {
      if (!featTrack || !total) return;
      current = (index + total) % total;
      position = current;
      render(true);
      updateDots();
    }

    setupClones();
    buildDots();
    render(false);

    let autoTimer = total ? setInterval(next, 4000) : null;

    // pausamos el auto cuando el mouse está encima, es más cómodo para el usuario
    const featCarousel = featTrack?.closest('.feat-carousel');
    const stopFeatureAuto = () => { clearInterval(autoTimer); autoTimer = null; };
    const startFeatureAuto = () => { if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches && !autoTimer) autoTimer = setInterval(next, 4000); };
    featCarousel?.setAttribute('role', 'region');
    featCarousel?.setAttribute('aria-roledescription', 'carrusel');
    featCarousel?.setAttribute('aria-label', 'Eventos destacados');
    featCarousel?.addEventListener('mouseenter', stopFeatureAuto);
    featCarousel?.addEventListener('focusin', stopFeatureAuto);
    featCarousel?.addEventListener('keydown', event => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      stopFeatureAuto();
      goTo(current + (event.key === 'ArrowRight' ? 1 : -1));
      event.preventDefault();
    });
    featCarousel?.addEventListener('mouseleave', () => { if (!featCarousel.contains(document.activeElement)) startFeatureAuto(); });
    featCarousel?.addEventListener('focusout', event => { if (!featCarousel.contains(event.relatedTarget)) startFeatureAuto(); });
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) stopFeatureAuto();

    // recalculamos los clones si cambia el tamaño de pantalla (mobile <-> desktop)
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        setupClones();
        position = current;
        render(false);
      }, 200);
    });

    // filtro de categorías: muestra/oculta tickets según data-cat
    document.querySelectorAll('.category-tabs').forEach(group => {
      const tabs = group.querySelectorAll('.cat-tab');
      const section = group.closest('section');
      const tabListId = group.id || `category-tabs-${Math.random().toString(36).slice(2)}`;
      group.id = tabListId;
      group.setAttribute('role', 'tablist');
      group.setAttribute('aria-label', 'Filtrar eventos por categoría');
      const list = group.parentElement?.querySelector('.event-tickets');
      if (list) { list.id ||= `${tabListId}-events`; list.setAttribute('role', 'tabpanel'); list.setAttribute('aria-labelledby', tabs[0]?.id || `${tabListId}-tab-0`); }
      tabs.forEach((tab, index) => {
        tab.type = 'button'; tab.setAttribute('role', 'tab');
        if (!tab.id) tab.id = `${tabListId}-tab-${index}`;
        tab.setAttribute('aria-controls', list?.id || tabListId);
        tab.setAttribute('aria-selected', String(tab.classList.contains('active')));
        tab.tabIndex = tab.classList.contains('active') ? 0 : -1;
      });
      tabs.forEach(tab => {
        tab.addEventListener('click', () => {
          tabs.forEach(item => { item.classList.remove('active'); item.setAttribute('aria-selected', 'false'); item.tabIndex = -1; });
          tab.classList.add('active');
          tab.setAttribute('aria-selected', 'true'); tab.tabIndex = 0;
          if (list) list.setAttribute('aria-labelledby', tab.id);
          const filter = tab.dataset.cat;
          section?.querySelectorAll('.ticket-row').forEach(row => {
            const rowCat = row.dataset.cat || '';
            const visible = filter === 'todos' || rowCat === filter;
            row.style.display = visible ? '' : 'none';
            const panel = row.nextElementSibling;
            if (!visible && panel?.classList.contains('event-interaction-panel')) panel.hidden = true;
          });
        });
      });
      group.addEventListener('keydown', event => {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
        const currentIndex = [...tabs].indexOf(document.activeElement);
        const nextIndex = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (currentIndex + (event.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length;
        event.preventDefault(); tabs[nextIndex]?.focus(); tabs[nextIndex]?.click();
      });
    });

    // búsqueda en tiempo real: filtra mientras escribís, sin botón de submit
    const searchInput = document.querySelector('.search-pill input');
    searchInput?.addEventListener('input', () => {
      const q = searchInput.value.toLowerCase().trim();
      document.querySelectorAll('.próximos-section .ticket-row').forEach(row => {
        const visible = !q || row.textContent.toLowerCase().includes(q);
        row.style.display = visible ? '' : 'none';
        const panel = row.nextElementSibling;
        if (!visible && panel?.classList.contains('event-interaction-panel')) panel.hidden = true;
      });
    });

    setupEventInteractions();
    setupEventAdminShortcut();

  }

  // --- TURISMO (turismo.html) ---
  if (body.classList.contains('page-turismo')) {
    setupTourismPlanning();
    setupTourismCuriosity();
  }

  // --- LUGARES (lugares.html) ---
  if (body.classList.contains('page-lugares')) {
    setupFavoriteButtons();
  }
  if (body.classList.contains('page-turismo')) setupFavoriteButtons();
  if (body.classList.contains('page-home')) setupFavoriteButtons();
  document.getElementById('content-grid')?.addEventListener('click', async event => {
    const button = event.target.closest('[data-remove-saved]'); if (!button) return;
    button.disabled = true;
    try { await sigturApiFetch('/api/guardados', { method: 'POST', body: JSON.stringify({ entidad_tipo: button.dataset.savedType, entidad_id: button.dataset.removeSaved, activo: false }) }); button.closest('.profile-card')?.remove(); const total = document.getElementById('total-count'), places = document.getElementById('following'); if (total) total.textContent = String(Math.max(0, Number(total.textContent) - 1)); if (places && button.dataset.savedType === 'place') places.textContent = String(Math.max(0, Number(places.textContent) - 1)); }
    catch (error) { button.disabled = false; window.alert(error.message || 'No se pudo quitar de guardados.'); }
  });

  setupNavbarSearch();
});

function normalizeSearchText(value) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

function getSearchDestination(value) {
  const normalized = normalizeSearchText(value);
  return /evento|concierto|feria|agenda|musica|deporte/.test(normalized) ? 'eventos.html' :
    /hotel|alojamiento|restaurante|comida|gastronomia|sabor|terma|historia/.test(normalized) ? 'turismo.html' :
    /mapa|ubicacion|llegar|ruta/.test(normalized) ? 'mapa.html' : 'lugares.html';
}

function navigateToSearch(value, destination = getSearchDestination(value)) {
  const url = new URL(destination, window.location.href);
  url.searchParams.set('q', value);
  window.location.assign(url);
}

function setupNavbarSearch() {
  const searchInput = document.querySelector('.nav-search input');
  const query = new URLSearchParams(window.location.search).get('q')?.trim();

  const searchBox = searchInput.closest('.nav-search');
  if (!searchBox) return;

  const listId = 'navbar-search-suggestions';
  const suggestionList = document.createElement('div');
  suggestionList.className = 'nav-search-suggestions';
  suggestionList.id = listId;
  suggestionList.setAttribute('role', 'listbox');
  suggestionList.setAttribute('aria-label', 'Sugerencias de búsqueda');
  suggestionList.hidden = true;
  searchBox.appendChild(suggestionList);

  searchInput.setAttribute('role', 'combobox');
  searchInput.setAttribute('aria-autocomplete', 'list');
  searchInput.setAttribute('aria-expanded', 'false');
  searchInput.setAttribute('aria-controls', listId);

  const suggestions = [
    { label: 'Eventos', query: 'Eventos' },
    { label: 'Ferias y actividades', query: 'Ferias' },
    { label: 'Hoteles y alojamientos', query: 'Hoteles' },
    { label: 'Restaurantes y sabores', query: 'Restaurantes' },
    { label: 'Termas del Daymán', query: 'Termas del Daymán' },
    { label: 'Lugares turísticos', query: 'Lugares' },
    { label: 'Plaza Artigas', query: 'Plaza Artigas' },
    { label: 'Costanera Norte', query: 'Costanera Norte' },
    { label: 'Parque Solari', query: 'Parque Solari' },
    { label: 'Mapa de Salto', query: 'Mapa' }
  ];
  document.querySelectorAll('.ticket-row, .lugar-card, .prop-card, .restaurant-card').forEach(item => {
    const heading = item.querySelector('h2, h3, .restaurant-name, .prop-name');
    const label = heading?.textContent.trim();
    if (label && !suggestions.some(suggestion => normalizeSearchText(suggestion.label) === normalizeSearchText(label))) {
      const destination = item.matches('.ticket-row') ? 'eventos.html' :
        item.matches('.prop-card, .restaurant-card') ? 'turismo.html' : 'lugares.html';
      suggestions.push({ label, query: label, destination });
    }
  });

  let activeIndex = -1;
  let visibleSuggestions = [];

  function closeSuggestions() {
    suggestionList.hidden = true;
    searchInput.setAttribute('aria-expanded', 'false');
    searchInput.removeAttribute('aria-activedescendant');
    activeIndex = -1;
  }

  function renderSuggestions() {
    const normalized = normalizeSearchText(searchInput.value);
    suggestionList.replaceChildren();
    activeIndex = -1;

    if (!normalized) {
      closeSuggestions();
      return;
    }

    visibleSuggestions = suggestions
      .filter(suggestion => normalizeSearchText(suggestion.label).includes(normalized))
      .slice(0, 7);

    if (!visibleSuggestions.length) {
      closeSuggestions();
      return;
    }

    visibleSuggestions.forEach((suggestion, index) => {
      const option = document.createElement('button');
      option.type = 'button';
      option.className = 'nav-search-suggestion';
      option.id = `${listId}-${index}`;
      option.setAttribute('role', 'option');
      option.setAttribute('aria-selected', 'false');
      option.textContent = suggestion.label;
      option.addEventListener('pointerdown', event => event.preventDefault());
      option.addEventListener('click', () => navigateToSearch(suggestion.query, suggestion.destination));
      suggestionList.appendChild(option);
    });

    suggestionList.hidden = false;
    searchInput.setAttribute('aria-expanded', 'true');
  }

  function setActiveSuggestion(index) {
    if (!visibleSuggestions.length) return;
    activeIndex = (index + visibleSuggestions.length) % visibleSuggestions.length;
    suggestionList.querySelectorAll('.nav-search-suggestion').forEach((option, optionIndex) => {
      const active = optionIndex === activeIndex;
      option.classList.toggle('is-active', active);
      option.setAttribute('aria-selected', String(active));
    });
    searchInput.setAttribute('aria-activedescendant', `${listId}-${activeIndex}`);
  }

  searchInput.addEventListener('input', renderSuggestions);
  searchInput.addEventListener('keydown', event => {
    if (event.key === 'ArrowDown' && !suggestionList.hidden) {
      event.preventDefault();
      setActiveSuggestion(activeIndex + 1);
    } else if (event.key === 'ArrowUp' && !suggestionList.hidden) {
      event.preventDefault();
      setActiveSuggestion(activeIndex < 0 ? visibleSuggestions.length - 1 : activeIndex - 1);
    } else if (event.key === 'Escape') {
      closeSuggestions();
    } else if (event.key === 'Enter') {
      const suggestion = activeIndex >= 0 ? visibleSuggestions[activeIndex] : null;
      const value = suggestion?.query || searchInput.value.trim();
      if (!value) return;
      event.preventDefault();
      navigateToSearch(value, suggestion?.destination);
    }
  });
  searchInput.addEventListener('focus', renderSuggestions);
  document.addEventListener('pointerdown', event => {
    if (!searchBox.contains(event.target)) closeSuggestions();
  });

  if (!query) return;

  const normalizedQuery = normalizeSearchText(query);
  const terms = normalizedQuery
    .replace(/\b(eventos?|conciertos?|ferias?|agenda|musica|deportes?|turismo|turisticos?|alojamientos?|hoteles?|restaurantes?|comida|gastronomia|sabores?|termas?|termal|historia|lugares?|plazas?|parques?|costanera|mapa|ubicacion|llegar|ruta)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (searchInput) searchInput.value = query;

  let items = [];
  if (document.body.classList.contains('page-eventos')) {
    const eventSearch = document.querySelector('.search-pill input');
    if (eventSearch) {
      eventSearch.value = terms;
      eventSearch.dispatchEvent(new Event('input', { bubbles: true }));
    }
    items = Array.from(document.querySelectorAll('.próximos-section .ticket-row'));
  } else if (document.body.classList.contains('page-lugares')) {
    items = Array.from(document.querySelectorAll('.lugar-card'));
  } else if (document.body.classList.contains('page-turismo')) {
    items = Array.from(document.querySelectorAll('.prop-card, .restaurant-card'));
  }

  if (terms && items.length) {
    const normalizedTerms = normalizeSearchText(terms);
    items.forEach(item => {
      item.style.display = normalizeSearchText(item.textContent).includes(normalizedTerms) ? '' : 'none';
    });
  }

  const section = /hotel|alojamiento/.test(normalizedQuery) ? '#alojamientos' :
    /restaurante|comida|gastronomia|sabor/.test(normalizedQuery) ? '#restaurantes' :
    /historia/.test(normalizedQuery) ? '#historia' : '';
  if (section) document.querySelector(section)?.scrollIntoView({ behavior: 'smooth' });
}

// gonza: el footer en mobile se convierte en acordeón para no ocupar tanto espacio.
// cada columna tiene un título clickeable que muestra/oculta la lista de links.
function setupFooterAccordions() {
  const footer = document.querySelector('.footer');
  if (!footer) return;

  const mobileQuery = window.matchMedia('(max-width: 700px)');
  const cols = Array.from(footer.querySelectorAll('.footer-col'));

  cols.forEach((col, index) => {
    const title = col.querySelector('.footer-col-title');
    const list = col.querySelector('ul');
    if (!title || !list || title.dataset.accordionReady) return;

    title.dataset.accordionReady = 'true';
    title.setAttribute('role', 'button');
    title.setAttribute('tabindex', '0');
    title.setAttribute('aria-expanded', index === 0 ? 'true' : 'false');
    col.classList.toggle('is-open', index === 0); // la primera columna arranca abierta

    const toggle = () => {
      if (!mobileQuery.matches) return; // en desktop no hace nada, todo visible
      const isOpen = col.classList.toggle('is-open');
      title.setAttribute('aria-expanded', String(isOpen));
    };

    title.addEventListener('click', toggle);
    title.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      toggle();
    });
  });

  const syncFooterMode = () => {
    cols.forEach((col, index) => {
      const title = col.querySelector('.footer-col-title');
      if (mobileQuery.matches) {
        const isOpen = index === 0 ? true : col.classList.contains('is-open');
        col.classList.toggle('is-open', isOpen);
        title?.setAttribute('aria-expanded', String(isOpen));
      } else {
        col.classList.add('is-open');
        title?.setAttribute('aria-expanded', 'true');
      }
    });
  };

  syncFooterMode();
  mobileQuery.addEventListener?.('change', syncFooterMode);
}

// gonza: esto inyecta los estilos de la animación de reveal directamente en el <head>.
// no hace falta un archivo CSS extra para esto, son dos reglas nomás.
const revealStyle = document.createElement('style');
revealStyle.textContent = '.revealed { opacity: 1 !important; transform: translateY(0) !important; } @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:none; } }';
document.head.appendChild(revealStyle);

// el botón de "Cerrar sesión" del menú del logo reusa la pinta de los <a>
// de .logo-menu, pero es un <button> (no navega a ningún lado), asi que
// necesita este reset minimo para no verse como un boton de navegador.
const logoutStyle = document.createElement('style');
logoutStyle.textContent = '.logo-menu-account { all: unset; display: block; width: 100%; box-sizing: border-box; cursor: pointer; font: inherit; color: inherit; }';
document.head.appendChild(logoutStyle);

// menú que aparece al clickear el logo (con links de navegación y toggle de tema)
function buildLogoMenu(initialTheme) {
  const logo = document.querySelector('.nav-logo');
  const navbar = document.querySelector('.navbar');
  if (!logo || !navbar) return;

  logo.setAttribute('aria-haspopup', 'menu');
  logo.setAttribute('aria-expanded', 'false');

  // gonza: creamos el div del menú desde JS en vez de tenerlo en el HTML
  // porque así funciona en todas las páginas sin repetir el markup
  const menu = document.createElement('div');
  menu.className = 'logo-menu';
  menu.setAttribute('role', 'menu');
  menu.innerHTML = `
    <a href="index.html" role="menuitem">Inicio</a>
    <span data-menu-account></span>
    <a href="admin.html" role="menuitem">Configuración admin</a>
    <a href="soporte.html" role="menuitem">Soporte</a>
    <button class="theme-switch" type="button" role="menuitem" aria-pressed="${initialTheme === 'dark'}">
      <span class="theme-orbit" aria-hidden="true">
        <span class="theme-sun"></span>
        <span class="theme-moon"></span>
      </span>
      <span class="theme-switch-text">${initialTheme === 'dark' ? 'Modo claro' : 'Modo oscuro'}</span>
    </button>
  `;
  logo.insertAdjacentElement('afterend', menu);
  renderLogoMenuAccount(menu);

  const themeBtn = menu.querySelector('.theme-switch');
  const themeText = menu.querySelector('.theme-switch-text');

  logo.addEventListener('click', (event) => {
    event.preventDefault();
    const open = menu.classList.toggle('open');
    logo.setAttribute('aria-expanded', String(open));
  });

  themeBtn?.addEventListener('click', () => {
    const dark = !document.body.classList.contains('theme-dark');
    document.body.classList.toggle('theme-dark', dark);
    // guardamos en localStorage para que se acuerde al recargar o cambiar de página
    localStorage.setItem('sigtur-theme', dark ? 'dark' : 'light');
    themeBtn.setAttribute('aria-pressed', String(dark));
    if (themeText) themeText.textContent = dark ? 'Modo claro' : 'Modo oscuro';
  });

  // cerrar el menú si clickeás en cualquier otro lado
  document.addEventListener('click', (event) => {
    if (logo.contains(event.target) || menu.contains(event.target)) return;
    menu.classList.remove('open');
    logo.setAttribute('aria-expanded', 'false');
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    menu.classList.remove('open');
    logo.setAttribute('aria-expanded', 'false');
  });
}

function renderLogoMenuAccount(menu = document.querySelector('.logo-menu')) {
  const slot = menu?.querySelector('[data-menu-account]');
  if (!slot) return;
  const session = sigturGetSession();
  if (!session?.usuario) {
    slot.innerHTML = '<a href="login.html" role="menuitem">Login / Registro</a>';
    return;
  }
  slot.innerHTML = `<a href="perfil.html" role="menuitem">Mi perfil (${escapeText(session.usuario.nombre || 'Usuario')})</a><button class="logo-menu-account" type="button" role="menuitem" data-logout>Cerrar sesión</button>`;
  slot.querySelector('[data-logout]')?.addEventListener('click', async () => {
    await sigturLogout();
    window.location.reload();
  });
}

function refreshLogoMenuAccount() {
  renderLogoMenuAccount();
}

// gonza: esta función es async porque hace un fetch a una API externa (open-meteo).
// fetch devuelve una Promise, y con async/await podemos esperar la respuesta
// sin bloquear el resto de la página. Si algo falla, el catch muestra "--".
// La API de open-meteo es gratis y no necesita key, re copada para prototipos.
async function setupHomeWeather() {
  const widget = document.querySelector('.weather-widget');
  if (!widget) return;

  const tempEl = widget.querySelector('[data-weather-temp]');
  const descEl = widget.querySelector('[data-weather-desc]');
  const feelsEl = widget.querySelector('[data-weather-feels]');
  const windEl = widget.querySelector('[data-weather-wind]');
  const iconEl = widget.querySelector('[data-weather-icon]');

  // tabla de códigos WMO → descripción + emoji. la API devuelve un número, nosotros lo traducimos
  const codes = {
    0: ['Soleado', '☀'],
    1: ['Mayormente despejado', '☀'],
    2: ['Parcialmente nuboso', '◐'],
    3: ['Nuboso', '☁'],
    45: ['Niebla', '≋'],
    48: ['Niebla helada', '≋'],
    51: ['Llovizna ligera', '☂'],
    53: ['Llovizna', '☂'],
    55: ['Llovizna intensa', '☂'],
    61: ['Lluvia ligera', '☂'],
    63: ['Lluvia', '☂'],
    65: ['Lluvia intensa', '☂'],
    80: ['Chaparrones', '☂'],
    81: ['Chaparrones', '☂'],
    82: ['Chaparrones fuertes', '☂'],
    95: ['Tormenta', '⚡'],
    96: ['Tormenta con granizo', '⚡'],
    99: ['Tormenta fuerte', '⚡']
  };

  try {
    // gonza: URLSearchParams es la forma prolija de armar query strings,
    // evita tener que concatenar strings a mano con & y =
    const params = new URLSearchParams({
      latitude: '-31.3833',
      longitude: '-57.9667',
      current: 'temperature_2m,apparent_temperature,weather_code,wind_speed_10m',
      timezone: 'America/Montevideo'
    });

    const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`);
    if (!response.ok) throw new Error('Weather request failed');
    const data = await response.json();
    const current = data.current || {};
    const [description, icon] = codes[current.weather_code] || ['Clima actual', '◐'];

    if (tempEl) tempEl.innerHTML = `${Math.round(current.temperature_2m)}&deg;`;
    if (descEl) descEl.textContent = description;
    if (feelsEl) feelsEl.innerHTML = `${Math.round(current.apparent_temperature)}&deg;`;
    if (windEl) windEl.textContent = `${Math.round(current.wind_speed_10m)} km/h`;
    if (iconEl) iconEl.textContent = icon;
    widget.classList.add('is-ready');
  } catch {
    // si la API no responde o hay error de red, mostramos placeholders
    if (tempEl) tempEl.innerHTML = 'Salto';
    if (descEl) descEl.textContent = 'Clima no disponible';
    if (feelsEl) feelsEl.textContent = '--';
    if (windEl) windEl.textContent = '--';
    if (iconEl) iconEl.textContent = '◐';
  }
}

// Auth conectado al backend real (Express + Supabase, ver backend/app.js
// y backend/rutas/auth_rutas.js). La sesión (token + datos del usuario) se
// cachea en localStorage bajo 'sigtur-session' solo para no tener que
// loguearse de nuevo en cada página, pero la fuente de verdad es siempre
// el backend: el token se manda en el header Authorization de cada fetch.
const xamppRoot = window.location.pathname.split('/frontend/html/')[0];
const SIGTUR_IS_LOCAL_HOST = ['localhost', '127.0.0.1'].includes(window.location.hostname);
const SIGTUR_XAMPP_BASE = SIGTUR_IS_LOCAL_HOST && xamppRoot !== window.location.pathname ? `${window.location.origin}${xamppRoot}/frontend/html` : '';
const SIGTUR_BACKEND_URL = window.SIGTUR_BACKEND_URL || '';
const SIGTUR_API_BASE = SIGTUR_XAMPP_BASE || SIGTUR_BACKEND_URL;
const SIGTUR_SESSION_KEY = 'sigtur-session';
let SIGTUR_VALIDATED_TOKEN = null;
let SIGTUR_REFRESH_PROMISE = null;
let SIGTUR_EXPIRY_TIMER = null;

function sanitizeAuthMessage(message, fallback) {
  const text = String(message || '').trim().slice(0, 240);
  if (!text) return fallback;
  if (/token|refresh_token|access_token|authorization|Bearer|secret|api[_ -]?key/i.test(text)) {
    return fallback;
  }
  return text;
}

function sigturGetSession() {
  try {
    const session = JSON.parse(localStorage.getItem(SIGTUR_SESSION_KEY)) || null;
    if (!session?.token) return null;
    const expiresAt = Number(session.expiresAt || 0);
    const unexpired = !expiresAt || expiresAt > Math.floor(Date.now() / 1000);
    return session.token === SIGTUR_VALIDATED_TOKEN && unexpired ? session : { ...session, usuario: null, profileValidated: false };
  } catch {
    return null;
  }
}

function sigturSaveSession(session, profileValidated = false) {
  if (!session?.token) return sigturClearSession();
  const currentToken = SIGTUR_VALIDATED_TOKEN;
  SIGTUR_VALIDATED_TOKEN = profileValidated && session.usuario ? session.token : (currentToken === session.token ? currentToken : null);
  session = { ...session, profileValidated: Boolean(SIGTUR_VALIDATED_TOKEN === session.token && session.usuario) };
  localStorage.setItem(SIGTUR_SESSION_KEY, JSON.stringify(session));
  clearTimeout(SIGTUR_EXPIRY_TIMER);
  const expiresAt = Number(session.expiresAt || 0);
  if (session.profileValidated && expiresAt) {
    SIGTUR_EXPIRY_TIMER = setTimeout(async () => {
      if (!sigturGetSession()?.refreshToken) {
        sigturClearSession();
        return;
      }
      const renewed = await sigturRefreshSession();
      if (!renewed) refreshLogoMenuAccount();
    }, Math.max(0, expiresAt * 1000 - Date.now()));
  }
}

function sigturClearSession() {
  SIGTUR_VALIDATED_TOKEN = null;
  localStorage.removeItem(SIGTUR_SESSION_KEY);
  refreshLogoMenuAccount();
}

async function processOAuthCallback(setStatus) {
  const queryParams = new URLSearchParams(window.location.search);
  const hashParams = new URLSearchParams(window.location.hash.slice(1));
  const params = hashParams.has('access_token') || hashParams.has('refresh_token') ? hashParams : queryParams;
  const oauthError = queryParams.get('oauth_error') || hashParams.get('oauth_error') || hashParams.get('error_description') || hashParams.get('error');
  const accessToken = params.get('access_token');
  if (oauthError && !accessToken) {
    window.history.replaceState({}, document.title, window.location.pathname);
    if (!document.getElementById('auth-status') && window.location.pathname === '/') {
      const loginUrl = new URL('/login.html', window.location.origin);
      loginUrl.searchParams.set('oauth_error', oauthError);
      window.location.replace(loginUrl.toString());
      return;
    }
    setStatus(sanitizeAuthMessage(oauthError, 'No se pudo completar el acceso con Google.'), 'error');
    return;
  }
  if (!accessToken) return;

  const session = {
    token: accessToken,
    refreshToken: params.get('refresh_token') || null,
    expiresAt: Number(params.get('expires_at') || params.get('expires_in')) || null,
  };
  if (session.expiresAt && session.expiresAt < 1000000000) session.expiresAt += Math.floor(Date.now() / 1000);
  sigturSaveSession(session);
  const isRecovery = params.get('type') === 'recovery';
  window.history.replaceState({}, document.title, window.location.pathname);
  setStatus(isRecovery ? 'Validando el enlace de recuperación...' : 'Validando la sesión de Google...', 'loading');
  try {
    const result = await sigturApiFetch('/api/auth/me');
    if (!result?.usuario?.id || !result.usuario.nombre || !result.usuario.correo) throw new Error('Profile validation failed.');
    sigturSaveSession({ ...sigturGetSession(), usuario: result.usuario }, true);
    if (isRecovery) {
      showPasswordResetForm();
      setStatus('El enlace fue validado. Elige una contrasena nueva.', 'ok');
      return;
    }
    setStatus(`Bienvenido, ${result.usuario.nombre}.`, 'ok');
    window.location.replace('index.html');
  } catch (error) {
    if (error.status === 401 || error.message === 'Profile validation failed.') sigturClearSession();
    setStatus(isRecovery ? 'El enlace venció o ya fue utilizado. Solicitá uno nuevo.' : 'No pudimos validar la sesión de Google. Intentá nuevamente.', 'error');
  }
}

async function sigturLogout() {
  try { await sigturApiFetch('/api/auth/logout', { method: 'POST' }); } catch { /* La sesión local también debe limpiarse. */ }
  sigturClearSession();
}

async function logout() {
  await sigturLogout();
  window.location.replace('login.html');
}

async function sigturRefreshSession() {
  if (SIGTUR_REFRESH_PROMISE) return SIGTUR_REFRESH_PROMISE;
  SIGTUR_REFRESH_PROMISE = (async () => {
    const currentSession = sigturGetSession();
    if (!currentSession?.refreshToken) return null;
    try {
      const refreshTarget = SIGTUR_XAMPP_BASE
        ? `${SIGTUR_XAMPP_BASE}/api/auth.php?action=refresh`
        : `${SIGTUR_BACKEND_URL}/api/auth/refresh`;
      const response = await fetch(refreshTarget, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: currentSession.refreshToken }),
      });
      const renewedSession = await response.json().catch(() => null);
      if (!response.ok || !renewedSession?.token || !renewedSession?.usuario?.id) {
        let latestSession = null;
        try { latestSession = JSON.parse(localStorage.getItem(SIGTUR_SESSION_KEY) || 'null'); } catch { /* almacenamiento local inválido */ }
        if (latestSession?.token && latestSession.refreshToken && latestSession.refreshToken !== currentSession.refreshToken) return sigturGetSession();
        if (response.status === 400 || response.status === 401) sigturClearSession();
        return null;
      }
      sigturSaveSession({ ...currentSession, ...renewedSession }, true);
      return sigturGetSession();
    } catch {
      return null;
    } finally {
      SIGTUR_REFRESH_PROMISE = null;
    }
  })();
  return SIGTUR_REFRESH_PROMISE;
}

async function sigturApiFetch(path, options = {}, retriedAfterRefresh = false) {
  let session = sigturGetSession();
  const isRefresh = path === '/api/auth/refresh';
  const isAuthEntry = ['/api/auth/login', '/api/auth/register', '/api/auth/recuperar', '/api/auth/password'].includes(path);
  if (!retriedAfterRefresh && !isRefresh && !isAuthEntry && session?.token) {
    const expiresAt = Number(session.expiresAt || 0);
    if (expiresAt && expiresAt <= Math.floor(Date.now() / 1000) + 30) {
      const renewed = await sigturRefreshSession();
      session = renewed || sigturGetSession();
    }
  }

  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (session?.token) headers.Authorization = `Bearer ${session.token}`;
  const isXamppAuth = SIGTUR_API_BASE.endsWith('/frontend/html') && path.startsWith('/api/auth/');
  const isProfileUpdate = path === '/api/auth/me' && String(options.method || 'GET').toUpperCase() === 'PATCH';
  const isPasswordUpdate = path === '/api/auth/password';
  const isXamppInteraction = SIGTUR_API_BASE.endsWith('/frontend/html') && /^(\/api\/(guardados|likes|comentarios|mensajes|reservas|admin))/.test(path);
  const isXamppBackendRoute = SIGTUR_API_BASE.endsWith('/frontend/html') && /^\/api\/(eventos|companias|mapa)/.test(path);
  const target = isXamppAuth && !isProfileUpdate
    ? `${SIGTUR_API_BASE}/api/auth.php?action=${encodeURIComponent(path.slice('/api/auth/'.length))}`
    : isXamppInteraction || isXamppBackendRoute || isProfileUpdate || isPasswordUpdate || isRefresh
      ? `${SIGTUR_BACKEND_URL}${path}`
      : `${SIGTUR_API_BASE}${path}`;
  let response;
  try {
    response = await fetch(target, { ...options, headers });
  } catch (cause) {
    console.error(`Error de red al llamar a ${target}`, cause);
    throw new Error('No se pudo conectar al servidor. Verifica la URL publica del backend.');
  }
  let payload = null;
  try { payload = await response.json(); } catch { /* Empty response. */ }

  if (response.status === 401 && !retriedAfterRefresh && !isRefresh && session?.refreshToken) {
    const renewedSession = await sigturRefreshSession();
    if (renewedSession) return sigturApiFetch(path, options, true);
  }
  if (!response.ok) {
    if (response.status === 401 && session?.token) sigturClearSession();
    throw Object.assign(new Error(payload?.error || 'Ocurrió un error inesperado. Intentá de nuevo.'), { status: response.status });
  }
  return payload;
}

window.sigturApiFetch = sigturApiFetch;
window.sigturGetSession = sigturGetSession;

async function sigturValidateStoredSession() {
  const session = sigturGetSession();
  const expiresAt = Number(session?.expiresAt || 0);
  if (!session?.token || (session.token === SIGTUR_VALIDATED_TOKEN && (!expiresAt || expiresAt > Math.floor(Date.now() / 1000) + 30))) return;
  try {
    const result = await sigturApiFetch('/api/auth/me');
    if (!result?.usuario?.id || !result.usuario.nombre || !result.usuario.correo) throw new Error('Profile validation failed.');
    sigturSaveSession({ ...sigturGetSession(), usuario: result.usuario }, true);
  } catch (error) {
    if (error.status === 401 || error.message === 'Profile validation failed.') sigturClearSession();
  }
}

window.addEventListener('storage', event => {
  if (event.key !== SIGTUR_SESSION_KEY) return;
  SIGTUR_VALIDATED_TOKEN = null;
  if (!event.newValue) {
    refreshLogoMenuAccount();
    const authStatus = document.getElementById('auth-status');
    if (authStatus) { authStatus.hidden = true; authStatus.textContent = ''; }
    if (document.querySelector('.profile-page') || document.getElementById('admin-settings-form')) window.location.reload();
    return;
  }
  sigturValidateStoredSession().finally(() => {
    refreshLogoMenuAccount();
    const session = sigturGetSession();
    const authStatus = document.getElementById('auth-status');
    if (authStatus && session?.usuario) {
      authStatus.textContent = `Ya iniciaste sesión como ${session.usuario.nombre}.`;
      authStatus.dataset.type = 'ok';
      authStatus.hidden = false;
    }
  });
});

function loginGoogle(button) {
  if (button) button.disabled = true;

  const url = SIGTUR_XAMPP_BASE
    ? `${SIGTUR_XAMPP_BASE}/api/auth.php?action=google`
    : `${SIGTUR_BACKEND_URL}/api/auth/google`;

  window.location.href = url;
}

function setupAuthPage() {
  const authPage = document.querySelector('.auth-remake');
  if (!authPage) return;

  const tabs = document.querySelectorAll('[data-auth-tab]');
  const panels = document.querySelectorAll('[data-auth-panel]');
  const status = document.getElementById('auth-status');
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const recoveryForm = document.getElementById('recovery-form');
  const passwordResetForm = document.getElementById('password-reset-form');

  const setStatus = (message, type = 'ok') => {
    if (!status) return;
    status.textContent = message;
    status.dataset.type = type;
    status.hidden = !message;
  };

  const setBusy = (form, busy, loadingMessage = '') => {
    const submitBtn = form?.querySelector('.auth-submit');
    if (submitBtn) {
      submitBtn.disabled = busy;
      submitBtn.dataset.busy = busy ? 'true' : 'false';
      submitBtn.textContent = busy && loadingMessage ? loadingMessage : submitBtn.dataset.defaultLabel || submitBtn.textContent;
    }
    if (busy && loadingMessage) {
      setStatus(loadingMessage, 'loading');
    }
  };

  const activateTab = (name) => {
    recoveryForm?.toggleAttribute('hidden', true);
    passwordResetForm?.toggleAttribute('hidden', true);
    passwordResetForm?.classList.remove('active');
    loginForm?.toggleAttribute('hidden', name !== 'login');
    registerForm?.toggleAttribute('hidden', name !== 'register');
    tabs.forEach(tab => tab.removeAttribute('hidden'));
    tabs.forEach(tab => {
      const active = tab.dataset.authTab === name;
      tab.classList.toggle('active', active);
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
    });
    panels.forEach(panel => panel.classList.toggle('active', panel.dataset.authPanel === name));
    setStatus('');
  };

  document.querySelectorAll('.auth-submit').forEach(btn => {
    btn.dataset.defaultLabel = btn.textContent.trim();
  });

  document.querySelectorAll('[data-password-toggle]').forEach(button => {
    button.addEventListener('click', () => {
      const input = document.getElementById(button.dataset.passwordToggle);
      if (!input) return;
      const nextType = input.type === 'password' ? 'text' : 'password';
      input.type = nextType;
      button.textContent = nextType === 'password' ? 'Mostrar' : 'Ocultar';
      button.setAttribute('aria-label', nextType === 'password' ? 'Mostrar contraseña' : 'Ocultar contraseña');
      input.focus();
    });
  });

  // si ya hay sesión guardada, lo avisamos en vez de mostrar los forms como si nada
  const existingSession = sigturGetSession();
  if (existingSession?.usuario) {
    setStatus(`Ya iniciaste sesión como ${existingSession.usuario.nombre}. Podés cerrar sesión desde el menú del logo.`, 'ok');
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => activateTab(tab.dataset.authTab));
  });
      tabs.forEach((tab, index) => tab.addEventListener('keydown', event => {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
        const target = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length;
        event.preventDefault(); tabs[target].focus(); activateTab(tabs[target].dataset.authTab);
      }));

  registerForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const data = new FormData(registerForm);
    const nombre = String(data.get('name') || '').trim();
    const correo = String(data.get('email') || '').trim().toLowerCase();
    const password = String(data.get('password') || '');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!nombre) {
      setStatus('Ingresá tu nombre para continuar.', 'error');
      registerForm.querySelector('[name="name"]').focus();
      return;
    }

    if (!emailRegex.test(correo)) {
      setStatus('Ingresá un correo válido. Ejemplo: nombre@dominio.com', 'error');
      registerForm.querySelector('[name="email"]').focus();
      return;
    }

    if (password.length < 8) {
      setStatus('La contraseña debe tener al menos 8 caracteres.', 'error');
      registerForm.querySelector('[name="password"]').focus();
      return;
    }

    setBusy(registerForm, true, 'Creando tu cuenta...');
    try {
      const resultado = await sigturApiFetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ nombre, correo, password })
      });
      if (resultado.pending) {
        setStatus(resultado.message || 'Cuenta creada. Revisá tu correo para confirmar la cuenta.', 'ok');
        registerForm.reset();
        activateTab('login');
        return;
      }
      sigturSaveSession(resultado, true);
      setStatus(`Cuenta creada. Sesión iniciada como ${resultado.usuario.nombre}.`, 'ok');
      registerForm.reset();
      window.location.href = 'index.html';
    } catch (error) {
      setStatus(sanitizeAuthMessage(error.message, 'No se pudo crear la cuenta. Intentá nuevamente.'), 'error');
    } finally {
      setBusy(registerForm, false);
    }
  });

  loginForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const data = new FormData(loginForm);
    const correo = String(data.get('user') || '').trim().toLowerCase();
    const password = String(data.get('password') || '');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!correo) {
      setStatus('Ingresá tu correo para continuar.', 'error');
      loginForm.querySelector('[name="user"]').focus();
      return;
    }

    if (!emailRegex.test(correo) && !correo.includes('@')) {
      setStatus('El correo o usuario no es válido. Revisá el formato.', 'error');
      loginForm.querySelector('[name="user"]').focus();
      return;
    }

    if (!password) {
      setStatus('Ingresá tu contraseña.', 'error');
      loginForm.querySelector('[name="password"]').focus();
      return;
    }

    setBusy(loginForm, true, 'Iniciando sesión...');
    try {
      const resultado = await sigturApiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ correo, password })
      });
      sigturSaveSession(resultado, true);
      setStatus(`Bienvenido de nuevo, ${resultado.usuario.nombre}.`, 'ok');
      loginForm.reset();
      window.location.href = 'index.html';
    } catch (error) {
      setStatus(sanitizeAuthMessage(error.message, 'No se pudo iniciar sesión. Revisá tus datos e intentá nuevamente.'), 'error');
    } finally {
      setBusy(loginForm, false);
    }
  });

  // Google se completa en el backend para no exponer credenciales sensibles.
  document.querySelectorAll('[data-auth-provider]').forEach(button => {
    button.addEventListener('click', () => {
      const provider = button.dataset.authProvider;
      if (provider === 'Google') {
        setStatus('Redirigiendo a Google para continuar...', 'loading');
        loginGoogle(button);
        return;
      }
      setStatus(`La opción de ${provider} aún no está disponible en este entorno. Podés seguir con Google o tu correo.`, 'info');
    });
  });

  document.querySelectorAll('[data-auth-message]').forEach(button => {
    button.addEventListener('click', () => {
      if (button.dataset.authMessage !== 'recuperar') return setStatus(button.dataset.authMessage, 'info');
      loginForm?.toggleAttribute('hidden', true);
      registerForm?.toggleAttribute('hidden', true);
      recoveryForm?.toggleAttribute('hidden', false);
      loginForm?.classList.remove('active');
      registerForm?.classList.remove('active');
      recoveryForm?.classList.add('active');
      setStatus('Escribe tu correo y te enviaremos un enlace de recuperación.', 'info');
    });
  });

  recoveryForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const correo = String(new FormData(recoveryForm).get('email') || '').trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(correo)) {
      setStatus('Ingresá un correo válido para recuperar tu contraseña.', 'error');
      recoveryForm.querySelector('[name="email"]').focus();
      return;
    }

    setBusy(recoveryForm, true, 'Enviando enlace...');
    try {
      const resultado = await sigturApiFetch('/api/auth/recuperar', {
        method: 'POST',
        body: JSON.stringify({ correo })
      });
      setStatus(resultado.message, 'ok');
      recoveryForm.reset();
    } catch (error) {
      setStatus(sanitizeAuthMessage(error.message, 'No se pudo enviar el enlace. Intentá nuevamente.'), 'error');
    } finally {
      setBusy(recoveryForm, false);
    }
  });

  passwordResetForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const data = new FormData(passwordResetForm);
    const password = String(data.get('password') || '');
    const confirmation = String(data.get('password_confirmation') || '');
    if (password.length < 8) return setStatus('La contraseña debe tener al menos 8 caracteres.', 'error');
    if (password !== confirmation) return setStatus('Las contraseñas no coinciden.', 'error');
    if (!sigturGetSession()?.token) return setStatus('Solicitá un enlace nuevo para cambiar la contraseña.', 'error');
    setBusy(passwordResetForm, true, 'Actualizando contraseña...');
    try {
      await sigturApiFetch('/api/auth/password', { method: 'PATCH', body: JSON.stringify({ password }) });
      await sigturLogout();
      passwordResetForm.reset();
      passwordResetForm.hidden = true;
      passwordResetForm.classList.remove('active');
      tabs.forEach(tab => tab.removeAttribute('hidden'));
      activateTab('login');
      setStatus('Contraseña actualizada. Ya puedes iniciar sesión.', 'ok');
    } catch (error) {
      setStatus(sanitizeAuthMessage(error.message, 'No se pudo cambiar la contraseña. Solicitá un enlace nuevo.'), 'error');
    } finally {
      setBusy(passwordResetForm, false);
    }
  });

  document.getElementById('recovery-cancel')?.addEventListener('click', () => {
    recoveryForm?.toggleAttribute('hidden', true);
    loginForm?.toggleAttribute('hidden', false);
    recoveryForm?.classList.remove('active');
    loginForm?.classList.add('active');
    setStatus('');
  });
}

function showPasswordResetForm() {
  const reset = document.getElementById('password-reset-form');
  if (!reset) return;
  document.querySelectorAll('[data-auth-panel]').forEach(panel => {
    panel.hidden = true;
    panel.classList.remove('active');
  });
  document.querySelectorAll('[data-auth-tab]').forEach(tab => tab.hidden = true);
  reset.hidden = false;
  reset.classList.add('active');
}

async function setupProfilePage() {
  const profilePage = document.querySelector('.profile-page');
  if (!profilePage) return;
  profilePage.setAttribute('aria-busy', 'true');

  const session = sigturGetSession();
  if (!session?.token) {
    window.location.replace('login.html');
    return;
  }

  try {
    const result = await sigturApiFetch('/api/auth/me');
    const usuario = result.usuario;
    if (!usuario?.id || !usuario.nombre || !usuario.correo) throw new Error('No se pudo validar el perfil de la cuenta.');
    sigturSaveSession({ ...session, usuario }, true);
    profilePage.setAttribute('aria-busy', 'false');

    const name = usuario.nombre || usuario.correo?.split('@')[0] || 'Usuario';
    const initials = name.trim().split(/\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase();
    renderProfileIdentity(usuario, initials || '?');
    document.getElementById('role-tags').innerHTML = `<span class="tag">${usuario.rol === 'admin' ? 'Administrador' : 'Explorador'}</span>`;
    document.getElementById('followers').textContent = 'Activa';
    setupProfileEditor(usuario);
    await renderProfileReservations(usuario.id);

    try {
      const saved = await sigturApiFetch('/api/guardados');
      const savedPlaces = await hydrateSavedPlaces(saved.data || [], usuario.id);
      document.getElementById('total-count').textContent = savedPlaces.length;
      document.getElementById('following').textContent = savedPlaces.filter(item => item.entidad_tipo === 'place').length;
      renderProfileGrid(savedPlaces);
    } catch (error) {
      const grid = document.getElementById('content-grid');
      if (grid) grid.innerHTML = `<p class="ui-list-status is-error" role="alert">${escapeText(error.message || 'No se pudieron cargar tus lugares guardados. Intentá nuevamente.')}</p>`;
    }
    setupMessaging();
  } catch (error) {
    profilePage.setAttribute('aria-busy', 'false');
    if (!sigturGetSession()?.token) {
      window.location.replace('login.html');
    } else {
      const title = document.getElementById('profile-title');
      if (title) title.textContent = error.message || 'No se pudo cargar el perfil. Intentá nuevamente.';
    }
    return;
  }

  document.querySelector('[data-profile-logout]')?.addEventListener('click', logout);
}

function renderProfileIdentity(usuario, initials) {
  const name = usuario.nombre || usuario.correo?.split('@')[0] || 'Usuario';
  const avatar = document.getElementById('avatar');
  if (avatar) avatar.innerHTML = usuario.avatar_url ? `<img src="${escapeText(usuario.avatar_url)}" alt="">` : escapeText(initials);
  document.getElementById('profile-title').textContent = name;
  document.getElementById('bio').textContent = usuario.biografia || usuario.ubicacion || usuario.correo || 'Explorador de Salto';
}

function setupProfileEditor(initialUser) {
  const editor = document.querySelector('[data-profile-editor]');
  const trigger = document.querySelector('[data-profile-edit]');
  const form = document.getElementById('profile-edit-form');
  const input = document.getElementById('profile-avatar-input');
  const preview = document.getElementById('profile-avatar-preview');
  const status = document.querySelector('[data-profile-editor-status]');
  if (!editor || !trigger || !form || !input || !preview) return;
  let avatarUrl = initialUser.avatar_url || '';
  const drawPreview = () => { preview.innerHTML = avatarUrl ? `<img src="${escapeText(avatarUrl)}" alt="">` : escapeText((initialUser.nombre || '?').slice(0, 1).toUpperCase()); };
  form.nombre.value = initialUser.nombre || '';
  form.ubicacion.value = initialUser.ubicacion || '';
  form.biografia.value = initialUser.biografia || '';
  form.sitio_web.value = initialUser.sitio_web || '';
  drawPreview();
  trigger.addEventListener('click', () => { editor.hidden = false; editor.scrollIntoView({ behavior: 'smooth', block: 'start' }); });
  editor.querySelector('[data-profile-edit-cancel]').addEventListener('click', () => { editor.hidden = true; status.textContent = ''; });
  input.addEventListener('change', () => {
    const file = input.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 1_000_000) { status.textContent = 'Elegí una imagen JPG, PNG o WebP de hasta 1 MB.'; input.value = ''; return; }
    const reader = new FileReader();
    reader.onload = () => { avatarUrl = String(reader.result); drawPreview(); status.textContent = ''; };
    reader.onerror = () => { status.textContent = 'No se pudo leer la imagen.'; };
    reader.readAsDataURL(file);
  });
  form.addEventListener('submit', async event => {
    event.preventDefault();
    const submit = form.querySelector('[type="submit"]');
    const values = Object.fromEntries(new FormData(form));
    try {
      submit.disabled = true; status.textContent = 'Guardando cambios...';
      const result = await sigturApiFetch('/api/auth/me', { method: 'PATCH', body: JSON.stringify({ ...values, avatar_url: avatarUrl }) });
      const session = sigturGetSession();
      sigturSaveSession({ ...session, usuario: result.usuario }, true);
      initialUser = result.usuario; avatarUrl = result.usuario.avatar_url || '';
      const initials = (result.usuario.nombre || '?').split(/\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase();
      renderProfileIdentity(result.usuario, initials);
      status.textContent = 'Perfil actualizado.';
    } catch (error) { status.textContent = error.message || 'No se pudo guardar el perfil.'; }
    finally { submit.disabled = false; }
  });
}

async function setupMessaging() {
  const contactSelect = document.getElementById('dm-contact');
  const contactList = document.getElementById('dm-contact-list');
  const contactSearch = document.getElementById('dm-contact-search');
  const thread = document.getElementById('dm-thread-list');
  const form = document.getElementById('dm-form');
  const message = document.getElementById('dm-message');
  const status = document.getElementById('dm-status');
  const recordButton = document.getElementById('dm-record');
  const recordingStatus = document.getElementById('dm-recording-status');
  const audioPreview = document.getElementById('dm-audio-preview');
  const audioPlayback = document.getElementById('dm-audio-playback');
  const audioDiscardButton = document.getElementById('dm-audio-discard');
  const audioSendButton = document.getElementById('dm-audio-send');
  const attachmentButton = document.getElementById('dm-attach');
  const attachmentInput = document.getElementById('dm-attachment-input');
  const attachmentStatus = document.getElementById('dm-attachment-status');
  const attachmentPreview = document.getElementById('dm-attachment-preview');
  const activeContactLabel = document.getElementById('dm-active-contact');
  const cleanupFilesButton = document.getElementById('dm-cleanup-files');
  const textSendButton = form?.querySelector('.dm-send-text');
  if (!contactSelect || !thread || !form) return;

  cleanupFilesButton?.addEventListener('click', async () => {
    if (!window.confirm('Se eliminarán de tu almacenamiento los archivos y audios sin uso que tengan más de 30 días. ¿Continuar?')) return;
    cleanupFilesButton.disabled = true;
    try { const removed = await sigturApiFetch('/api/mensajes/archivos-antiguos', { method: 'DELETE' }); status.textContent = `Limpieza terminada: ${removed.audio} audios y ${removed.attachments} adjuntos eliminados.`; }
    catch (error) { status.textContent = error.message || 'No se pudo limpiar el almacenamiento.'; }
    finally { cleanupFilesButton.disabled = false; }
  });

  let contacts = [];
  let conversations = [];
  let activeId = '';
  let refreshing = false;
  let messagingBroadcast = null;
  let mediaRecorder = null;
  let recordingStream = null;
  let recordingChunks = [];
  let recordingStartedAt = 0;
  let recordingTimer = null;
  let recordedAudio = null;
  let recordedAudioDuration = 0;
  let audioObjectUrl = '';
  let sendingAudio = false;
  let sendingMessage = false;
  let pendingAttachments = [];
  let attachmentPreviewUrls = [];
  const maxAudioSeconds = 120;
  const maxAudioBytes = 10 * 1024 * 1024;
  const maxAttachments = 3;
  const maxAttachmentBytes = 10 * 1024 * 1024;
  const acceptedAttachmentTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']);

  const formatAudioTime = seconds => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
  const recorderMimeType = () => [
    'audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/ogg', 'audio/mp4',
  ].find(type => window.MediaRecorder?.isTypeSupported?.(type)) || '';
  const resetAudioPreview = () => {
    if (audioObjectUrl) URL.revokeObjectURL(audioObjectUrl);
    audioObjectUrl = '';
    recordedAudio = null;
    recordedAudioDuration = 0;
    audioPlayback?.pause();
    if (audioPlayback) audioPlayback.removeAttribute('src');
    if (audioPreview) audioPreview.hidden = true;
    if (audioSendButton) audioSendButton.disabled = true;
    if (recordButton) {
      recordButton.disabled = false;
      recordButton.classList.remove('is-recording');
      recordButton.setAttribute('aria-pressed', 'false');
      recordButton.innerHTML = '<span aria-hidden="true">🎙</span> Grabar audio';
    }
    if (recordingStatus) recordingStatus.textContent = 'El audio dura hasta 2 minutos.';
  };

  const fileSizeLabel = bytes => bytes < 1024
    ? `${bytes} B`
    : bytes < 1024 * 1024
      ? `${Math.round(bytes / 1024)} KB`
      : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  const renderMessageAttachments = attachments => {
    if (!Array.isArray(attachments) || !attachments.length) return '';
    return `<div class="dm-message-attachments">${attachments.map(file => {
      const url = escapeText(file.url || '#');
      const name = escapeText(file.name || (file.mime === 'application/pdf' ? 'Documento PDF' : 'Imagen adjunta'));
      return file.mime?.startsWith('image/')
        ? `<a class="dm-file-image" href="${url}" target="_blank" rel="noopener noreferrer"><img src="${url}" alt="${name}" loading="lazy"><span>${name}</span></a>`
        : `<a class="dm-file-document" href="${url}" target="_blank" rel="noopener noreferrer"><span class="dm-file-icon" aria-hidden="true">PDF</span><span><strong>${name}</strong><small>${fileSizeLabel(Number(file.size) || 0)} · Abrir documento</small></span></a>`;
    }).join('')}</div>`;
  };
  const renderPendingAttachments = () => {
    (attachmentPreviewUrls || []).forEach(URL.revokeObjectURL);
    attachmentPreviewUrls = [];
    if (!attachmentPreview) return;
    attachmentPreview.replaceChildren();
    pendingAttachments.forEach((file, index) => {
      const item = document.createElement('div');
      item.className = 'dm-pending-file';
      if (file.type.startsWith('image/')) {
        const image = document.createElement('img');
        image.src = URL.createObjectURL(file);
        image.alt = `Vista previa: ${file.name}`;
        attachmentPreviewUrls.push(image.src);
        item.appendChild(image);
      } else {
        const icon = document.createElement('span');
        icon.className = 'dm-file-icon';
        icon.textContent = 'PDF';
        item.appendChild(icon);
      }
      const name = document.createElement('span');
      name.className = 'dm-pending-file-name';
      name.textContent = `${file.name} · ${fileSizeLabel(file.size)}`;
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'dm-remove-file';
      remove.setAttribute('aria-label', `Quitar ${file.name}`);
      remove.textContent = '×';
      remove.addEventListener('click', () => {
        pendingAttachments.splice(index, 1);
        renderPendingAttachments();
      });
      item.append(name, remove);
      attachmentPreview.appendChild(item);
    });
    if (attachmentStatus) {
      attachmentStatus.textContent = pendingAttachments.length
        ? `${pendingAttachments.length} de ${maxAttachments} archivos listos para enviar.`
        : 'JPG, PNG, WebP, GIF o PDF · hasta 3 archivos de 10 MB';
    }
  };
  const clearPendingAttachments = () => {
    pendingAttachments = [];
    if (attachmentInput) attachmentInput.value = '';
    renderPendingAttachments();
  };
  const addPendingAttachments = files => {
    const chosen = [...files];
    const remaining = maxAttachments - pendingAttachments.length;
    const valid = chosen.filter(file => acceptedAttachmentTypes.has(file.type) && file.size > 0 && file.size <= maxAttachmentBytes);
    const accepted = valid.slice(0, Math.max(remaining, 0));
    pendingAttachments.push(...accepted);
    renderPendingAttachments();
    if (chosen.some(file => !acceptedAttachmentTypes.has(file.type) || file.size === 0 || file.size > maxAttachmentBytes)) {
      status.textContent = 'Adjuntá JPG, PNG, WebP, GIF o PDF de hasta 10 MB cada uno.';
    } else if (accepted.length < chosen.length) {
      status.textContent = `Podés adjuntar hasta ${maxAttachments} archivos por mensaje.`;
    }
  };

  const currentUserId = () => sigturGetSession()?.usuario?.id;
  const setComposerEnabled = enabled => {
    if (message) message.disabled = !enabled || sendingMessage || sendingAudio;
    if (recordButton && mediaRecorder?.state !== 'recording' && !sendingAudio && !sendingMessage) recordButton.disabled = !enabled;
    if (textSendButton) textSendButton.disabled = !enabled || sendingMessage || sendingAudio;
    if (attachmentButton) attachmentButton.disabled = !enabled || sendingMessage || sendingAudio;
    if (attachmentInput) attachmentInput.disabled = !enabled || sendingMessage || sendingAudio;
  };
  const notifyMessagingSync = (userId = null) => {
    const payload = { type: 'messaging-sync', userId, ts: Date.now() };
    if ('BroadcastChannel' in window) {
      const channel = new BroadcastChannel('sigtur-mensajes');
      channel.postMessage(payload);
      channel.close();
    }
    try {
      localStorage.setItem('sigtur-mensajes-sync', JSON.stringify(payload));
    } catch {
      // sin almacenamiento persistente no hay problema
    }
  };

  const handleMessagingSync = async (event) => {
    const payload = event?.data || (event?.key === 'sigtur-mensajes-sync' ? JSON.parse(event.newValue || 'null') : null);
    if (!payload || !payload.ts) return;
    await loadConversations();
    if (activeId) await loadThread(activeId, { refreshConversations: false });
  };
  const nameOf = user => `${user.nombre || 'Usuario'}${user.apellido ? ` ${user.apellido}` : ''}`;
  const initialsOf = user => {
    const name = nameOf(user).trim();
    return name ? name.split(/\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase() : '?';
  };

  const renderContacts = () => {
    contactSelect.innerHTML = '<option value="">Elegí un usuario</option>' + contacts.map(user => `<option value="${escapeText(user.id)}">${escapeText(nameOf(user))} · ${escapeText(user.correo)}</option>`).join('');
  };

  const renderConversations = () => {
    if (!contactList) return;
    const term = (contactSearch?.value || '').trim().toLowerCase();
    const matchesTerm = (user, preview = '') => {
      const hayTexto = [nameOf(user), user.correo || '', preview].filter(Boolean).join(' ').toLowerCase();
      return !term || hayTexto.includes(term);
    };
    const visible = conversations.filter((item) => {
      const user = item.usuario || {};
      return matchesTerm(user, item.last_message?.contenido || '');
    });
    const conversationIds = new Set(conversations.map(item => item.usuario_id));
    if (term) {
      contacts.filter(user => !conversationIds.has(user.id) && matchesTerm(user))
        .forEach(user => visible.push({ usuario_id: user.id, usuario: user, isNew: true }));
    }
    const activeContact = contacts.find(user => user.id === activeId);
    if (activeContact && !conversationIds.has(activeId) && !visible.some(item => item.usuario_id === activeId)) {
      visible.unshift({ usuario_id: activeId, usuario: activeContact, isNew: true });
    }

    if (!visible.length) {
      contactList.innerHTML = term
        ? '<p class="dm-empty">No encontramos usuarios ni conversaciones con ese nombre.</p>'
        : '<p class="dm-empty">Todavía no hay conversaciones. Buscá un usuario para iniciar una.</p>';
      return;
    }

    contactList.innerHTML = visible.map((item) => {
      const user = item.usuario || {};
      const fecha = item.updated_at ? new Date(item.updated_at).toLocaleString('es-UY', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '';
      const ultimo = item.last_message?.tipo === 'audio'
        ? '🎙 Mensaje de voz'
        : item.last_message?.tipo === 'archivo'
          ? '📎 Archivo adjunto'
        : item.last_message?.contenido ? escapeText(item.last_message.contenido) : item.isNew ? 'Iniciar chat · se entrega al reconectar' : 'No hay mensajes todavía.';
      const unread = Number(item.unread_count || 0);
      const active = item.usuario_id === activeId ? 'is-active' : '';
      return `
        <button type="button" class="dm-conversation ${active}" data-dm-user="${escapeText(item.usuario_id)}">
          <span class="dm-avatar">${escapeText(initialsOf(user))}</span>
          <span class="dm-conversation-body">
            <strong>${escapeText(nameOf(user))}</strong>
            <small>${ultimo}</small>
          </span>
          <span class="dm-meta">
            <time>${escapeText(fecha)}</time>
            ${unread ? `<span class="dm-badge">${unread}</span>` : ''}
          </span>
        </button>
      `;
    }).join('');
  };

  const loadConversations = async () => {
    try {
      const result = await sigturApiFetch('/api/mensajes/conversaciones');
      conversations = Array.isArray(result) ? result : result.data || [];
      renderConversations();
    } catch (error) {
      status.textContent = error.message || 'No se pudieron cargar las conversaciones.';
    }
  };

  const loadThread = async (userId, { scrollToBottom = false, refreshConversations = true } = {}) => {
    if (!userId) return;
    if (activeId && activeId !== userId && mediaRecorder?.state === 'recording') { status.textContent = 'Detené la grabación antes de cambiar de conversación.'; return; }
    if (activeId && activeId !== userId && (recordedAudio || pendingAttachments.length) && !window.confirm('Tenés una grabación o archivos sin enviar. Si cambiás de conversación, se descartarán. ¿Continuar?')) return;
    const conversationChanged = activeId !== userId;
    const wasNearBottom = thread.scrollHeight - thread.scrollTop - thread.clientHeight < 80;
    if (activeId !== userId) {
      resetAudioPreview();
      clearPendingAttachments();
    }
    activeId = userId;
    const activeContact = contacts.find(user => user.id === userId)
      || conversations.find(entry => entry.usuario_id === userId)?.usuario;
    if (activeContactLabel) activeContactLabel.textContent = activeContact ? nameOf(activeContact) : 'Conversación';
    setComposerEnabled(true);
    renderConversations();
    try {
      const result = await sigturApiFetch(`/api/mensajes?usuario_id=${encodeURIComponent(userId)}`);
      const items = Array.isArray(result) ? result : result.data || [];
      if (activeId !== userId) return;
      thread.innerHTML = (items || []).map((item) => {
        const isOutgoing = item.remitente_id === currentUserId();
        const stateText = isOutgoing ? (item.leido ? '✓✓ Leído' : '✓ Enviado') : '';
        const content = item.tipo === 'audio' && item.audio_url
          ? `<div class="dm-audio-message"><span><span aria-hidden="true">🎙</span> Mensaje de voz · ${formatAudioTime(Number(item.duration_seconds) || 0)}</span><audio controls preload="none" src="${escapeText(item.audio_url)}" aria-label="Reproducir mensaje de voz"></audio></div>`
          : `${item.tipo !== 'archivo' && item.contenido ? `<p class="dm-message-text">${escapeText(item.contenido)}</p>` : ''}${renderMessageAttachments(item.attachments)}`;
        return `
          <article class="dm-bubble ${isOutgoing ? 'outgoing' : 'incoming'} ${item.tipo === 'audio' ? 'dm-bubble-audio' : ''}" data-message-id="${escapeText(item.id)}">
            ${content}
            <time>${new Date(item.created_at).toLocaleString('es-UY')} ${stateText ? `· ${escapeText(stateText)}` : ''}</time>
            ${isOutgoing ? '<button type="button" data-delete-message>Eliminar mensaje</button>' : ''}
          </article>
        `;
      }).join('') || '<p class="dm-empty">No hay mensajes todavía.</p>';
      if (scrollToBottom || conversationChanged || wasNearBottom) thread.scrollTop = thread.scrollHeight;
      status.textContent = '';
      if (items.some(item => item.destinatario_id === currentUserId() && !item.leido)) {
        await sigturApiFetch('/api/mensajes/leer', { method: 'PATCH', body: JSON.stringify({ usuario_id: userId }) });
        notifyMessagingSync(userId);
      }
      if (refreshConversations) await loadConversations();
    } catch (error) {
      status.textContent = error.message || 'No se pudo abrir la conversación.';
    }
  };

  thread.addEventListener('click', async event => {
    const button = event.target.closest('[data-delete-message]');
    if (!button) return;
    const bubble = button.closest('[data-message-id]');
    if (!bubble || !window.confirm('¿Eliminar este mensaje y sus archivos adjuntos?')) return;
    button.disabled = true;
    try { await sigturApiFetch(`/api/mensajes/${encodeURIComponent(bubble.dataset.messageId)}`, { method: 'DELETE' }); await loadThread(activeId); }
    catch (error) { button.disabled = false; status.textContent = error.message || 'No se pudo eliminar el mensaje.'; }
  });


const refreshActiveThread = async () => {
  const isPlayingAudio = [...thread.querySelectorAll('audio')].some(player => !player.paused);
  if (!activeId || document.hidden || refreshing || sendingAudio || mediaRecorder?.state === 'recording' || isPlayingAudio) return;

  refreshing = true;
  try {
    await loadThread(activeId, { refreshConversations: false });
  } finally {
    refreshing = false;
  }
};

const refreshMessaging = async () => {
  if (document.hidden) return;

  // La lista de conversaciones cambia con menor frecuencia que el hilo activo.
  const now = Date.now();
  if (now - lastConversationRefresh >= 60000) {
    lastConversationRefresh = now;
    await loadConversations();
  }

  // Si hay una conversación abierta, actualiza sus mensajes.
  await refreshActiveThread();
};

let lastConversationRefresh = Date.now();


  try {
    status.textContent = 'Cargando usuarios...';
    const result = await sigturApiFetch('/api/mensajes/usuarios');
    contacts = Array.isArray(result) ? result : result.data || [];
    renderContacts();
    await loadConversations();
    status.textContent = contacts.length ? 'Elegí una conversación para empezar.' : 'No hay otros usuarios registrados para contactar.';
  } catch (error) {
    status.textContent = error.message || 'No se pudieron cargar los usuarios.';
  }

  contactSelect.addEventListener('change', () => {
    const hasValue = contactSelect.value;
    if (hasValue) {
      loadThread(hasValue);
    }
  });

  contactList?.addEventListener('click', event => {
    const button = event.target.closest('[data-dm-user]');
    if (!button) return;
    const userId = button.dataset.dmUser;
    contactSelect.value = userId;
    loadThread(userId);
  });

  contactSearch?.addEventListener('input', renderConversations);

  attachmentButton?.addEventListener('click', () => attachmentInput?.click());
  attachmentInput?.addEventListener('change', () => {
    const chosen = [...(attachmentInput.files || [])];
    attachmentInput.value = '';
    addPendingAttachments(chosen);
  });
  message?.addEventListener('keydown', event => {
    if (event.key !== 'Enter' || event.shiftKey || event.isComposing) return;
    event.preventDefault();
    if (textSendButton && !textSendButton.disabled) form.requestSubmit();
  });
  message?.addEventListener('paste', event => {
    const files = [...(event.clipboardData?.items || [])]
      .filter(item => item.kind === 'file')
      .map(item => item.getAsFile())
      .filter(Boolean);
    if (!files.length) return;
    event.preventDefault();
    addPendingAttachments(files);
  });
  form.addEventListener('dragover', event => {
    if ([...(event.dataTransfer?.items || [])].some(item => item.kind === 'file')) {
      event.preventDefault();
      form.classList.add('is-drop-target');
    }
  });
  form.addEventListener('dragleave', event => {
    if (!form.contains(event.relatedTarget)) form.classList.remove('is-drop-target');
  });
  form.addEventListener('drop', event => {
    form.classList.remove('is-drop-target');
    const files = [...(event.dataTransfer?.files || [])];
    if (!files.length) return;
    event.preventDefault();
    addPendingAttachments(files);
  });

  if ('BroadcastChannel' in window) {
    messagingBroadcast = new BroadcastChannel('sigtur-mensajes');
    messagingBroadcast.addEventListener('message', handleMessagingSync);
  }
  window.addEventListener('storage', (event) => {
    if (event.key === 'sigtur-mensajes-sync') {
      handleMessagingSync(event);
    }
  });


window.addEventListener('focus', refreshMessaging);

const refreshTimer = window.setInterval(refreshMessaging, 15000);

document.addEventListener('visibilitychange', refreshMessaging);

  recordButton?.addEventListener('click', async () => {
    if (mediaRecorder?.state === 'recording') {
      mediaRecorder.stop();
      return;
    }
    if (!activeId) {
      status.textContent = 'Elegí una conversación antes de grabar un audio.';
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      status.textContent = 'Este navegador no permite grabar audio. Podés enviar mensajes de texto.';
      return;
    }

    resetAudioPreview();
    if (recordButton) {
      recordButton.disabled = true;
      recordButton.textContent = 'Solicitando micrófono…';
    }
    try {
      recordingStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = recorderMimeType();
      mediaRecorder = new MediaRecorder(recordingStream, mimeType ? { mimeType } : undefined);
      recordingChunks = [];
      recordingStartedAt = Date.now();
      mediaRecorder.addEventListener('dataavailable', event => {
        if (event.data?.size) recordingChunks.push(event.data);
      });
      mediaRecorder.addEventListener('stop', () => {
        window.clearInterval(recordingTimer);
        recordingTimer = null;
        recordingStream?.getTracks().forEach(track => track.stop());
        recordingStream = null;
        const duration = Math.max(1, Math.min(maxAudioSeconds, Math.ceil((Date.now() - recordingStartedAt) / 1000)));
        const blob = new Blob(recordingChunks, { type: mediaRecorder?.mimeType || mimeType || 'audio/webm' });
        mediaRecorder = null;
        recordingChunks = [];
        recordButton?.classList.remove('is-recording');
        recordButton?.setAttribute('aria-pressed', 'false');
        if (recordButton) {
          recordButton.disabled = false;
          recordButton.innerHTML = '<span aria-hidden="true">🎙</span> Grabar audio';
        }
        if (!blob.size || blob.size > maxAudioBytes) {
          status.textContent = blob.size ? 'La grabación supera el límite de 10 MB. Intentá hacerla más corta.' : 'No se capturó audio. Volvé a intentarlo.';
          resetAudioPreview();
          return;
        }
        recordedAudio = blob;
        recordedAudioDuration = duration;
        audioObjectUrl = URL.createObjectURL(blob);
        if (audioPlayback) audioPlayback.src = audioObjectUrl;
        if (audioPreview) audioPreview.hidden = false;
        if (audioSendButton) audioSendButton.disabled = false;
        if (recordingStatus) recordingStatus.textContent = `Grabación lista · ${formatAudioTime(duration)}. Podés escucharla antes de enviarla.`;
      }, { once: true });

      mediaRecorder.start(250);
      recordButton.disabled = false;
      recordButton.classList.add('is-recording');
      recordButton.setAttribute('aria-pressed', 'true');
      recordButton.innerHTML = '<span aria-hidden="true">■</span> Detener grabación';
      if (recordingStatus) recordingStatus.textContent = 'Grabando · 0:00';
      recordingTimer = window.setInterval(() => {
        const elapsed = Math.floor((Date.now() - recordingStartedAt) / 1000);
        if (recordingStatus) recordingStatus.textContent = `Grabando · ${formatAudioTime(elapsed)}`;
        if (elapsed >= maxAudioSeconds && mediaRecorder?.state === 'recording') mediaRecorder.stop();
      }, 1000);
    } catch (error) {
      recordingStream?.getTracks().forEach(track => track.stop());
      recordingStream = null;
      mediaRecorder = null;
      status.textContent = error.name === 'NotAllowedError'
        ? 'Permití el acceso al micrófono para grabar audio.'
        : error.message || 'No se pudo iniciar la grabación.';
      resetAudioPreview();
    }
  });

  audioDiscardButton?.addEventListener('click', () => {
    resetAudioPreview();
    status.textContent = 'Grabación descartada.';
  });

  audioSendButton?.addEventListener('click', async () => {
    if (!activeId || !recordedAudio || sendingAudio) return;
    const recipientId = activeId;
    const audio = recordedAudio;
    const duration = recordedAudioDuration;
    try {
      if (!sigturGetSession()?.token) throw new Error('Iniciá sesión para enviar un mensaje de voz.');
      sendingAudio = true;
      audioSendButton.disabled = true;
      status.textContent = 'Subiendo audio…';
      const mimeType = audio.type.split(';')[0] || 'audio/webm';
      const uploaded = await sigturApiFetch('/api/mensajes/audio', {
        method: 'POST',
        headers: { 'Content-Type': mimeType },
        body: audio,
      });
      await sigturApiFetch('/api/mensajes', {
        method: 'POST',
        body: JSON.stringify({
          destinatario_id: recipientId,
          tipo: 'audio',
          audio_path: uploaded.path,
          duration_seconds: duration,
        }),
      });
      resetAudioPreview();
      status.textContent = 'Mensaje guardado. El destinatario lo verá cuando vuelva a conectarse.';
      notifyMessagingSync(recipientId);
      await loadThread(recipientId, { scrollToBottom: true });
    } catch (error) {
      status.textContent = error.message || 'No se pudo enviar el audio.';
      if (audioSendButton) audioSendButton.disabled = false;
    } finally {
      sendingAudio = false;
    }
  });

window.addEventListener('beforeunload', event => {
  if (recordedAudio || pendingAttachments.length || mediaRecorder?.state === 'recording') { event.preventDefault(); event.returnValue = ''; return; }
  window.clearInterval(refreshTimer);
  window.clearInterval(recordingTimer);
  recordingStream?.getTracks().forEach(track => track.stop());
  if (audioObjectUrl) URL.revokeObjectURL(audioObjectUrl);
  document.removeEventListener('visibilitychange', refreshMessaging);
  window.removeEventListener('focus', refreshMessaging);
  messagingBroadcast?.close();
}, { once: true });

  const uploadPendingAttachments = async () => {
    const uploadedFiles = [];
    for (let index = 0; index < pendingAttachments.length; index += 1) {
      const file = pendingAttachments[index];
      if (!acceptedAttachmentTypes.has(file.type) || !file.size || file.size > maxAttachmentBytes) {
        throw new Error('Adjuntá JPG, PNG, WebP, GIF o PDF de hasta 10 MB cada uno.');
      }
      if (attachmentStatus) attachmentStatus.textContent = `Subiendo archivo ${index + 1} de ${pendingAttachments.length}…`;
      const uploaded = await sigturApiFetch('/api/mensajes/adjuntos', {
        method: 'POST',
        headers: { 'Content-Type': file.type },
        body: file,
      });
      uploadedFiles.push({
        path: uploaded.path,
        name: file.name,
        mime: uploaded.mime || file.type,
        size: uploaded.size || file.size,
      });
    }
    return uploadedFiles;
  };

  form.addEventListener('submit', async event => {
    event.preventDefault();
    try {
      if (!activeId) throw new Error('Elegí un usuario para iniciar la conversación.');
      const contenido = message.value.trim();
      if (!contenido && !pendingAttachments.length) throw new Error('Escribí un mensaje o adjuntá un archivo.');
      if (!sigturGetSession()?.token) throw new Error('Iniciá sesión para enviar mensajes.');
      const recipientId = activeId;
      sendingMessage = true;
      setComposerEnabled(true);
      status.textContent = pendingAttachments.length ? 'Subiendo adjuntos…' : 'Enviando mensaje…';
      const attachments = await uploadPendingAttachments();
      await sigturApiFetch('/api/mensajes', {
        method: 'POST',
        body: JSON.stringify({
          destinatario_id: recipientId,
          contenido,
          tipo: contenido ? 'texto' : 'archivo',
          attachments,
        })
      });
      message.value = '';
      clearPendingAttachments();
      status.textContent = 'Mensaje guardado. El destinatario lo verá cuando vuelva a conectarse.';
      notifyMessagingSync(recipientId);
      await loadThread(recipientId, { scrollToBottom: true });
    } catch (error) {
      status.textContent = error.message || 'No se pudo enviar el mensaje.';
    } finally {
      sendingMessage = false;
      if (pendingAttachments.length) renderPendingAttachments();
      setComposerEnabled(Boolean(activeId));
    }
  });
}

function escapeText(value) {
  const element = document.createElement('span');
  element.textContent = String(value ?? '');
  return element.innerHTML;
}

function setupFavoriteButtons() {
  document.querySelectorAll('.prop-heart, .lugar-action-link.guardar').forEach(button => {
    const card = button.closest('.prop-card') || button.closest('.lugar-actions')?.parentElement?.parentElement || button.parentElement;
    const title = card.querySelector('.prop-name, h3, h4')?.textContent.trim() || button.getAttribute('aria-label')?.replace(/^Guardar\s*/i, '').trim() || card.querySelector('img')?.alt?.trim() || 'Lugar turístico';
    const entityId = button.dataset.entityId || title.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    button.dataset.entityId = entityId;
    button.setAttribute('aria-pressed', 'false');
    const sync = async () => {
      try { const state = await sigturApiFetch(`/api/likes/estado?entidad_tipo=place&entidad_id=${encodeURIComponent(entityId)}`); button.setAttribute('aria-pressed', String(Boolean(state.saved))); button.classList.toggle('liked', Boolean(state.saved)); }
      catch { button.setAttribute('aria-pressed', 'false'); }
    };
    sync();
    button.addEventListener('click', async event => {
      event.preventDefault();
      if (!sigturGetSession()?.token) { window.location.assign('login.html'); return; }
      const active = button.getAttribute('aria-pressed') !== 'true'; button.disabled = true;
      try {
        await sigturApiFetch('/api/guardados', { method: 'POST', body: JSON.stringify({ entidad_tipo: 'place', entidad_id: entityId, activo: active, metadata: { nombre: title } }) });
        button.setAttribute('aria-pressed', String(active)); button.classList.toggle('liked', active);
        button.setAttribute('aria-label', active ? `Quitar ${title} de guardados` : `Guardar ${title}`);
      } catch (error) { window.alert(error.message || 'No se pudo actualizar guardados.'); }
      finally { button.disabled = false; }
    });
  });
}

function setupTourismPlanning() {
  const cards = document.querySelectorAll('.alojamientos-section .prop-card');
  if (!cards.length) return;
  const dialog = document.createElement('dialog');
  dialog.className = 'tourism-plan-dialog';
  document.body.appendChild(dialog);
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close('cancel'); });
  const open = card => {
    const name = card.querySelector('.prop-name')?.textContent.trim() || 'Experiencia turística';
    const price = card.querySelector('.prop-price')?.textContent.trim() || 'Consultar tarifa';
    const placeRef = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    dialog.innerHTML = `<form class="tourism-plan-widget"><header><div><p>Planificá tu visita</p><h2>${escapeText(name)}</h2></div><button type="button" data-plan-close aria-label="Cerrar">×</button></header><div class="tourism-plan-grid"><label>Fecha preferida<input name="date" type="date" min="${new Date().toISOString().slice(0, 10)}" required></label><label>Personas<select name="people"><option value="1">1 persona</option><option value="2">2 personas</option><option value="3">3 personas</option><option value="4">4 personas</option></select></label></div><fieldset><legend>Horario flexible</legend><div class="reservation-slots"><label><input type="radio" name="schedule" value="Mañana · 09:00–12:00" checked><span>Mañana<small>09:00–12:00</small></span></label><label><input type="radio" name="schedule" value="Tarde · 14:00–18:00"><span>Tarde<small>14:00–18:00</small></span></label><label><input type="radio" name="schedule" value="Flexible · a coordinar"><span>Flexible<small>A coordinar</small></span></label></div></fieldset><div class="tourism-plan-summary"><span>Desde</span><strong>${escapeText(price)}</strong></div><footer><button type="button" data-plan-close>Cancelar</button><button type="submit">Solicitar disponibilidad</button></footer><p class="tourism-plan-status" aria-live="polite"></p></form>`;
    dialog.querySelectorAll('[data-plan-close]').forEach(button => button.addEventListener('click', () => dialog.close('cancel')));
    dialog.querySelector('form').addEventListener('submit', async event => {
      event.preventDefault();
      const form = event.currentTarget, status = form.querySelector('.tourism-plan-status'), values = new FormData(form);
      if (!sigturGetSession()?.token) { window.location.assign('login.html'); return; }
      const submit = form.querySelector('[type="submit"]'); submit.disabled = true; status.textContent = 'Guardando planificación…';
      try { await sigturApiFetch('/api/reservas/planes', { method: 'POST', body: JSON.stringify({ place_ref: placeRef, place_name: name, visit_date: values.get('date'), people: Number(values.get('people')), schedule: values.get('schedule') }) }); status.textContent = 'Plan guardado en tu perfil.'; window.setTimeout(() => dialog.close('saved'), 700); }
      catch (error) { status.textContent = error.message || 'No se pudo guardar el plan.'; submit.disabled = false; }
    });
    dialog.showModal();
  };
  cards.forEach(card => {
    const info = card.querySelector('.prop-info');
    if (!info) return;
    const button = document.createElement('button');
    button.className = 'tourism-plan-trigger'; button.type = 'button'; button.textContent = 'Planificar visita';
    button.addEventListener('click', () => open(card));
    info.appendChild(button);
  });
}

function setupTourismCuriosity() {
  const target = document.getElementById('tourism-curiosity-text');
  if (!target) return;
  const facts = [
    'Las termas del Daymán son uno de los grandes atractivos de Salto: sus aguas cálidas invitan a descansar todo el año.',
    'Salto se asoma al río Uruguay y su costanera es uno de los lugares preferidos para caminar al atardecer.',
    'La naranja es parte de la identidad productiva local; en la ciudad se celebra con sabores, ferias y recetas regionales.',
    'El nombre de Salto remite a los antiguos saltos de agua del río Uruguay, que marcaron la historia de la zona.',
    'La ciudad combina patrimonio, termas, gastronomía y naturaleza en distancias cortas para recorrer sin apuro.'
  ];
  let previous = Number(localStorage.getItem('sigtur-last-curiosity'));
  if (!Number.isInteger(previous) || previous < 0 || previous >= facts.length) previous = -1;
  const available = facts.map((_, index) => index).filter(index => index !== previous);
  const next = available[Math.floor(Math.random() * available.length)];
  localStorage.setItem('sigtur-last-curiosity', String(next));
  target.textContent = facts[next];
}

function setupFoodInfo() {
  const cards = document.querySelectorAll('.page-home .food-card');
  if (!cards.length) return;
  const descriptions = {
    'Asado criollo': 'El asado criollo se cocina lentamente a las brasas. Es una tradición de encuentro: cortes de carne, fuego paciente y sobremesa compartida.',
    Empanadas: 'Las empanadas son masas rellenas y horneadas o fritas. En Salto suelen encontrarse con carne, queso, jamón, pollo o verduras, ideales para compartir.',
    'Cultura del mate': 'El mate es una infusión de yerba mate que se toma con bombilla. Más que una bebida, es una costumbre cotidiana para conversar y recorrer la ciudad.'
  };
  const dialog = document.createElement('dialog');
  dialog.className = 'food-info-dialog'; document.body.appendChild(dialog);
  cards.forEach(card => {
    card.tabIndex = 0; card.setAttribute('role', 'button');
    const title = card.querySelector('.food-card-btn')?.textContent.trim() || 'Gastronomía local';
    const open = () => { dialog.innerHTML = `<article><button type="button" aria-label="Cerrar">×</button><p>Sabores de Salto</p><h2>${escapeText(title)}</h2><div>${escapeText(descriptions[title] || 'Una propuesta gastronómica para descubrir durante tu visita a Salto.')}</div></article>`; dialog.showModal(); dialog.querySelector('button').addEventListener('click', () => dialog.close()); };
    card.addEventListener('click', open);
    card.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); open(); } });
  });
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
}

async function hydrateSavedPlaces(savedPlaces = [], userId) {
  let cachedPins = {};
  try { cachedPins = JSON.parse(localStorage.getItem(`sigtur-place-pins:${userId}`) || '{}'); } catch { /* caché local inválida */ }
  let catalog = [];
  try {
    const response = await fetch(`${SIGTUR_BACKEND_URL}/mapa`);
    const payload = response.ok ? await response.json() : null;
    catalog = Array.isArray(payload) ? payload : payload?.data || payload?.puntos || [];
  } catch { /* se usa la caché local si el catálogo no está disponible */ }
  const catalogPins = Object.fromEntries(catalog.map(item => {
    const id = String(item.id ?? '');
    return [id, {
      id,
      nombre: item.nombre || item.name || item.titulo || item.title || '',
      direccion: item.direccion || item.address || item.ubicacion || '',
      categorias: item.categorias || item.categories || item.category || [],
      imagen: item.imagen || item.imagen_url || item.image || item.image_url || '',
      enlace: item.enlace || item.url || item.link || '',
    }];
  }).filter(([id]) => id));
  const remoteIds = new Set(savedPlaces.filter(item => item.entidad_tipo === 'place').map(item => String(item.entidad_id)));
  const remote = savedPlaces.map(item => item.entidad_tipo === 'place' && (cachedPins[String(item.entidad_id)] || catalogPins[String(item.entidad_id)])
    ? { ...item, pin: cachedPins[String(item.entidad_id)] || catalogPins[String(item.entidad_id)] }
    : item);
  return remote.map(item => ({ ...item, pin: item.metadata || item.pin || cachedPins[String(item.entidad_id)] || catalogPins[String(item.entidad_id)] || {} }))
    .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
}

function renderProfileGrid(savedPlaces = []) {
  const grid = document.getElementById('content-grid');
  if (!grid) return;
  if (!savedPlaces.length) {
    grid.innerHTML = '<p class="profile-empty">Todavía no guardaste ningún punto. Explorá el mapa para armar tu lista.</p>';
    return;
  }
  grid.innerHTML = savedPlaces.map(item => {
    const pin = item.pin || {};
    const kind = item.entidad_tipo === 'event' ? 'Evento' : item.entidad_tipo === 'company' ? 'Gastronomía o servicio' : 'Lugar guardado';
    const title = pin.nombre || `${kind} · ${item.entidad_id}`;
    const href = item.entidad_tipo === 'event' ? 'eventos.html' : `mapa.html?focus=${encodeURIComponent(item.entidad_id)}`;
    const action = item.entidad_tipo === 'event' ? 'Ver eventos' : 'Ver en el mapa';
    const tags = Array.isArray(pin.categorias) && pin.categorias.length ? `<p class="profile-card-tags">${pin.categorias.map(tag => `<span>${escapeText(tag)}</span>`).join('')}</p>` : '';
    const image = pin.imagen ? `<img src="${escapeText(pin.imagen)}" alt="" loading="lazy">` : '';
    return `<article class="profile-card">${image}<div><small class="profile-card-kind">${kind}</small><h3>${escapeText(title)}</h3>${pin.direccion ? `<p>${escapeText(pin.direccion)}</p>` : ''}${tags}<p>Guardado el ${new Date(item.created_at).toLocaleDateString('es-UY')}</p><a href="${href}">${action}</a> <button type="button" data-remove-saved="${escapeText(item.entidad_id)}" data-saved-type="${escapeText(item.entidad_tipo)}">Quitar de guardados</button></div></article>`;
  }).join('');
}

async function renderProfileReservations(userId) {
  const list = document.getElementById('reservations-list');
  if (!list) return;
  list.setAttribute('aria-busy', 'true');
  list.innerHTML = '<p class="ui-list-status is-loading" role="status">Cargando reservas...</p>';
  let result;
  try { result = await sigturApiFetch('/api/reservas'); }
  catch (error) { list.innerHTML = `<p class="ui-list-status is-error" role="alert">${escapeText(error.message || 'No se pudieron cargar tus reservas.')}</p>`; list.setAttribute('aria-busy', 'false'); return; }
  const entries = [
    ...(result.events || []).map(item => ({ ...item, type: 'event', displayName: item.event_title, displayDate: item.created_at, quantity: item.quantity, id: item.id })),
    ...(result.plans || []).map(item => ({ ...item, type: 'place', displayName: item.place_name, displayDate: item.visit_date, created_at: item.created_at, people: item.people, date: item.visit_date, id: item.id })),
  ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  list.innerHTML = entries.length
    ? entries.map(reservation => reservation.type === 'event'
      ? `<article class="reservation-card"><div><small>EVENTO</small><strong>${escapeText(reservation.displayName || 'Evento')}</strong><p>${reservation.quantity} ${Number(reservation.quantity) === 1 ? 'lugar reservado' : 'lugares reservados'} · ${escapeText(reservation.schedule)} · ${new Date(reservation.created_at).toLocaleDateString('es-UY')}</p></div><a href="eventos.html#${encodeURIComponent(reservation.event_ref)}">Ver evento</a><button type="button" data-cancel-reservation="${reservation.id}" data-reservation-type="eventos">Cancelar</button></article>`
      : `<article class="reservation-card"><div><small>VISITA / LUGAR</small><strong>${escapeText(reservation.displayName || 'Experiencia turística')}</strong><p>${escapeText(reservation.date)} · ${reservation.people} ${Number(reservation.people) === 1 ? 'persona' : 'personas'} · ${escapeText(reservation.schedule)}</p></div><a href="turismo.html">Ver turismo</a><button type="button" data-cancel-reservation="${reservation.id}" data-reservation-type="planes">Cancelar</button></article>`).join('')
    : '<p class="profile-empty">Todavía no tenés reservas ni visitas planificadas.</p>';
  list.setAttribute('aria-busy', 'false');
  list.onclick = async event => {
    const cancel = event.target.closest('[data-cancel-reservation]');
    if (!cancel || !window.confirm('¿Cancelar esta reserva o planificación?')) return;
    cancel.disabled = true;
    try { await sigturApiFetch(`/api/reservas/${cancel.dataset.reservationType}/${encodeURIComponent(cancel.dataset.cancelReservation)}`, { method: 'DELETE' }); await renderProfileReservations(userId); }
    catch (error) { cancel.disabled = false; window.alert(error.message || 'No se pudo cancelar.'); }
  };
}

function setupEventAdminShortcut() {
  if (sigturGetSession()?.usuario?.rol !== 'admin') return;
  const host = document.querySelector('.destacados-header');
  if (!host || host.querySelector('[data-admin-create-event]')) return;
  const link = document.createElement('a');
  link.href = 'admin.html#admin-event-form';
  link.className = 'admin-create-event';
  link.dataset.adminCreateEvent = 'true';
  link.textContent = '+ Crear evento';
  host.appendChild(link);
}

async function setupEventInteractions() {
  const ticketList = document.querySelector('.page-eventos .event-tickets');
  if (!ticketList) return;
  const eventIcon = (name) => {
    const paths = {
      location: '<path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
      culture: '<path d="M4 5h16v12H4zM8 21h8M12 17v4M8 9h.01M12 9h.01M16 9h.01M8 13h.01M12 13h.01M16 13h.01"/>',
      music: '<path d="M9 18V5l12-2v13M9 18a3 3 0 1 1-3-3c1.7 0 3 1.3 3 3Zm12-2a3 3 0 1 1-3-3c1.7 0 3 1.3 3 3Z"/>',
      sports: '<circle cx="12" cy="12" r="9"/><path d="m8 3 2 5-4 3 2 6h7l3-5-4-4 1-5M6 17l-3 1m13-1 5 2"/>',
      fair: '<path d="M4 20V8l8-5 8 5v12M8 20v-6h8v6M8 9h.01M12 9h.01M16 9h.01"/>',
      food: '<path d="M7 3v7m-3-7v4a3 3 0 0 0 6 0V3m-3 7v11m9-18v18m0-18c3 2 4 5 4 8h-4"/>',
      faith: '<path d="M12 3v18M5 8h14M7 18h10"/>',
      kids: '<path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z"/>',
      time: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
      price: '<path d="M20 13 13 20l-9-9V4h7l9 9Z"/><circle cx="8" cy="8" r="1"/>',
      comment: '<path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5 8.4 8.4 0 0 1-4-.9L3 21l1.9-5.5a8.4 8.4 0 0 1-.9-4 8.5 8.5 0 0 1 8.5-8.5 8.5 8.5 0 0 1 8.5 8.5Z"/><path d="M8 11h8M8 15h5"/>',
    };
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.culture}</svg>`;
  };
  const categoryIcon = value => {
    const key = String(value || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const icon = key.includes('mus') ? 'music' : key.includes('deport') ? 'sports' : key.includes('feria') ? 'fair' : key.includes('gastr') ? 'food' : key.includes('relig') ? 'faith' : key.includes('infant') ? 'kids' : 'culture';
    return eventIcon(icon);
  };
  try {
    const result = await sigturApiFetch('/api/eventos');
    const events = Array.isArray(result) ? result : result.data || [];
    const monthNames = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
    events.forEach(event => {
      const date = new Date(`${event.date_start}T00:00:00`);
      const category = String(event.categories?.[0] || 'Cultura').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z]+/g, '');
      const row = document.createElement('article');
      row.className = 'ticket-row ticket-row-remote';
      row.dataset.cat = category;
      row.dataset.eventId = `event-${event.id}`;
      const eventColor = /^#[0-9a-f]{6}$/i.test(String(event.color || '')) ? event.color : '#16b3a3';
      row.style.setProperty('--event-color', eventColor);
      const eventTime = event.event_time ? String(event.event_time).slice(0, 5) : 'Horario a confirmar';
      const eventPrice = Number(event.price) > 0 ? `$${escapeText(event.price)}` : 'Gratis';
      row.innerHTML = `<div class="ticket-date"><span class="day">${Number.isNaN(date.getTime()) ? '--' : String(date.getDate()).padStart(2, '0')}</span><span class="month">${Number.isNaN(date.getTime()) ? '---' : monthNames[date.getMonth()]}</span></div><div class="ticket-divider"></div><div class="ticket-info"><span class="ticket-title">${escapeText(event.title)}</span><span class="ticket-subtitle">${escapeText(event.description || 'Una propuesta para disfrutar Salto.')}</span><div class="ticket-location">${eventIcon('location')}${escapeText(event.location || 'Ubicación a confirmar')}</div></div><span class="ticket-badge badge-green">${categoryIcon(event.categories?.[0])}<span>${escapeText(event.categories?.[0] || 'Cultura')}</span></span><span class="ticket-schedule">${eventIcon('time')}<span>${escapeText(eventTime)}</span></span><span class="ticket-time ticket-price">${eventIcon('price')}<span>${eventPrice}</span></span><button class="ticket-heart" aria-label="Dar like" aria-pressed="false"><svg viewBox="0 0 79 79" fill="none" xmlns="http://www.w3.org/2000/svg"><path class="heart-fill" d="M39.5 65 C20 50 8 40 8 26 A14 14 0 0 1 39.5 22 A14 14 0 0 1 71 26 C71 40 59 50 39.5 65Z" fill="none" stroke="rgba(0,0,0,0.25)" stroke-width="3"/></svg></button>`;
      ticketList.prepend(row);
    });
  } catch (error) {
    const status = document.createElement('p');
    status.className = 'form-help event-api-status';
    status.textContent = error.message || 'No se pudieron cargar los eventos publicados.';
    ticketList.insertAdjacentElement('beforebegin', status);
  }
  document.querySelectorAll('.page-eventos .ticket-row:not(.ticket-row-remote)').forEach(row => {
    const oldTime = row.querySelector('.ticket-time');
    if (oldTime && !row.querySelector('.ticket-schedule')) {
      oldTime.classList.add('ticket-schedule');
      oldTime.innerHTML = `${eventIcon('time')}<span>${escapeText(oldTime.textContent.trim())}</span>`;
      const price = document.createElement('span');
      price.className = 'ticket-time ticket-price';
      price.innerHTML = `${eventIcon('price')}<span>Consultar</span>`;
      oldTime.insertAdjacentElement('afterend', price);
    }
    const badge = row.querySelector('.ticket-badge');
    if (badge && !badge.querySelector('svg')) badge.insertAdjacentHTML('afterbegin', categoryIcon(badge.textContent));
    const location = row.querySelector('.ticket-location');
    if (location && !location.querySelector('svg')) location.insertAdjacentHTML('afterbegin', eventIcon('location'));
  });
  const rows = document.querySelectorAll('.page-eventos .ticket-row');
  if (!rows.length) return;

  const escapeHtml = (value) => {
    const element = document.createElement('span');
    element.textContent = String(value ?? '');
    return element.innerHTML;
  };
  const slugify = (value) => String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const getEventData = (row) => {
    const title = row.querySelector('.ticket-title')?.textContent.trim() || 'Evento';
    const date = `${row.querySelector('.day')?.textContent.trim() || ''}-${row.querySelector('.month')?.textContent.trim() || ''}`;
    const location = row.querySelector('.ticket-location')?.textContent.trim() || '';
    const category = row.querySelector('.ticket-badge')?.textContent.trim() || 'Evento';
    const time = row.querySelector('.ticket-schedule')?.textContent.trim() || 'Horario a confirmar';
    const price = row.querySelector('.ticket-price')?.textContent.trim() || 'Consultar';
    const description = row.querySelector('.ticket-subtitle')?.textContent.trim() || 'Una propuesta para disfrutar Salto.';
    return { title, id: row.dataset.eventId || `event-${slugify(`${title}-${date}-${location}`)}`, date, location, category, time, price, description };
  };
  const detailDialog = document.createElement('dialog');
  detailDialog.className = 'event-detail-dialog';
  document.body.appendChild(detailDialog);
  const openEventDetail = event => {
    detailDialog.innerHTML = `<article class="event-detail-card"><div class="event-detail-hero event-detail-${slugify(event.category)}"><button class="event-detail-close" type="button" aria-label="Cerrar detalle">×</button><div class="event-detail-labels"><span>${escapeHtml(event.category)}</span><span>${escapeHtml(event.date)}</span></div><div><p class="event-detail-kicker">Agenda SIGTUR · Salto</p><h2>${escapeHtml(event.title)}</h2><p>${escapeHtml(event.description)}</p></div></div><div class="event-detail-content"><div class="event-detail-facts"><div><small>${eventIcon('time')}Horario</small><strong>${escapeHtml(event.time)}</strong></div><div><small>${eventIcon('price')}Precio</small><strong>${escapeHtml(event.price)}</strong></div><div><small>${eventIcon('location')}Dónde</small><strong>${escapeHtml(event.location)}</strong></div></div><p>Guardá el evento, reservá tu lugar y compartí tu experiencia con la comunidad.</p><div class="event-detail-actions"><button type="button" data-detail-reserve>Reservar lugar</button><a href="mapa.html?focus=${encodeURIComponent(event.id)}">Ver en mapa</a></div></div></article>`;
    detailDialog.showModal();
    detailDialog.querySelector('.event-detail-close').addEventListener('click', () => detailDialog.close());
    detailDialog.querySelector('[data-detail-reserve]').addEventListener('click', () => { detailDialog.close(); const ticket = [...rows].find(row => getEventData(row).id === event.id); ticket?.querySelector('[data-event-reservation]')?.click(); });
  };
  detailDialog.addEventListener('click', clickEvent => { if (clickEvent.target === detailDialog) detailDialog.close(); });
  const authorName = (comment) => {
    const author = comment.autor || {};
    return [author.nombre, author.apellido].filter(Boolean).join(' ') || 'Explorador';
  };
  const authorAvatar = (comment) => {
    const author = comment.autor || {};
    const initials = authorName(comment).split(/\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase() || '?';
    return `<span class="comment-avatar">${author.avatar_url ? `<img src="${escapeHtml(author.avatar_url)}" alt="" onerror="this.remove()">` : ''}<span>${escapeHtml(initials)}</span></span>`;
  };
  const syncEventLikeButton = async (button, eventId) => {
    try {
      const state = await sigturApiFetch(`/api/likes/estado?entidad_tipo=event&entidad_id=${encodeURIComponent(eventId)}`);
      button.setAttribute('aria-pressed', String(Boolean(state.liked)));
      button.classList.toggle('liked', Boolean(state.liked));
      button.setAttribute('aria-label', state.liked ? 'Quitar like' : 'Dar like');
      const icon = button.querySelector('[aria-hidden="true"]');
      if (icon) icon.textContent = state.liked ? '♥' : '♡';
    } catch {
      button.setAttribute('aria-pressed', 'false');
    }
  };
  const renderComments = (panel, comments) => {
    const list = panel.querySelector('[data-event-comment-list]');
    if (!list) return;
    const order = panel.querySelector('[data-comment-order][aria-pressed="true"]')?.dataset.commentOrder || 'newest';
    const byParent = new Map();
    comments.forEach(comment => { const key = comment.parent_id || 'root'; byParent.set(key, [...(byParent.get(key) || []), comment]); });
    const sort = entries => [...entries].sort((a, b) => {
      if (Boolean(a.fijado) !== Boolean(b.fijado)) return a.fijado ? -1 : 1;
      return order === 'oldest' ? new Date(a.created_at) - new Date(b.created_at) : new Date(b.created_at) - new Date(a.created_at);
    });
    const renderComment = comment => {
      const replies = sort(byParent.get(comment.id) || []);
      const media = window.sigturCommentMediaMarkup?.(comment.media_urls) || '';
      const content = comment.contenido ? `<p>${escapeHtml(comment.contenido)}</p>` : '';
      const own = sigturGetSession()?.usuario?.id === comment.usuario_id;
      const likeState = comment.likeState || { liked: false, likes: 0 };
      return `<article class="event-comment ${comment.fijado ? 'is-pinned' : ''}" data-comment-id="${escapeHtml(comment.id)}" data-comment-user="${escapeHtml(comment.usuario_id)}"><div class="comment-author">${authorAvatar(comment)}<span><strong>${escapeHtml(authorName(comment))}</strong><small>${comment.autor?.rol === 'admin' ? 'Administrador' : 'Explorador'}${comment.fijado ? ' · 📌 Fijado' : ''}</small></span><time>${new Date(comment.created_at).toLocaleDateString('es-UY')}</time></div>${content}${media}<div class="event-comment-actions"><button type="button" data-comment-like aria-pressed="${likeState.liked}">${likeState.liked ? '♥' : '♡'} Me gusta (${likeState.likes})</button><button type="button" data-comment-reply>↩ Responder</button><button type="button" data-comment-message>✉ Mensaje</button>${own ? '<button type="button" data-edit-comment>Editar</button><button type="button" data-delete-own-comment>Eliminar</button>' : ''}${sigturGetSession()?.usuario?.rol === 'admin' && !own ? '<button type="button" data-admin-delete-comment>Eliminar</button>' : ''}</div><div class="event-reply-form" hidden><textarea rows="2" maxlength="2000" placeholder="Responder a ${escapeHtml(authorName(comment))}..."></textarea><button type="button" data-submit-reply>Publicar respuesta</button></div>${replies.length ? `<div class="event-comment-replies"><span>${replies.length} ${replies.length === 1 ? 'respuesta' : 'respuestas'}</span>${replies.map(renderComment).join('')}</div>` : ''}</article>`;
    };
    const roots = sort(byParent.get('root') || []);
    list.innerHTML = roots.length
      ? roots.map(renderComment).join('')
      : '<p class="event-panel-status">Todavía no hay comentarios.</p>';
  };
  const loadComments = async (panel, eventId) => {
    const status = panel.querySelector('[data-event-panel-status]');
    try {
      status.setAttribute('role', 'status');
      status.setAttribute('aria-busy', 'true');
      status.classList.add('ui-list-status', 'is-loading');
      status.classList.remove('is-error');
      status.textContent = 'Cargando comentarios...';
      const result = await sigturApiFetch(`/api/comentarios?entidad_tipo=event&entidad_id=${encodeURIComponent(eventId)}`);
      panel._eventComments = await Promise.all((result.data || []).map(async comment => {
        try { return { ...comment, likeState: await sigturApiFetch(`/api/comentarios/${comment.id}/likes`) }; }
        catch { return { ...comment, likeState: { liked: false, likes: 0 } }; }
      }));
      renderComments(panel, panel._eventComments);
      status.textContent = '';
      status.setAttribute('aria-busy', 'false');
      status.classList.remove('is-loading');
    } catch (error) {
      status.setAttribute('role', 'alert');
      status.setAttribute('aria-busy', 'false');
      status.classList.remove('is-loading');
      status.classList.add('ui-list-status', 'is-error');
      status.textContent = error.message || 'No se pudieron cargar los comentarios. Revisa database/README.md y aplica las migraciones pendientes con Supabase CLI.';
    }
  };
  const showLogin = () => { window.location.replace('login.html'); };
  const interactionKey = event => `entidad_tipo=event&entidad_id=${encodeURIComponent(event.id)}`;
  const syncSavedButton = async (button, event) => {
    try {
      const state = await sigturApiFetch(`/api/likes/estado?${interactionKey(event)}`);
      button.setAttribute('aria-pressed', String(Boolean(state.saved)));
      button.textContent = state.saved ? '🔖 Guardado' : '🔖 Guardar';
    } catch { button.textContent = '🔖 Guardar'; }
  };

  rows.forEach(row => {
    const event = getEventData(row);
    const likeButton = row.querySelector('.ticket-heart');
    if (likeButton) {
      syncEventLikeButton(likeButton, event.id);
      likeButton.addEventListener('click', async clickEvent => {
        clickEvent.preventDefault();
        clickEvent.stopPropagation();
        if (!sigturGetSession()?.token) { showLogin(); return; }
        const active = likeButton.getAttribute('aria-pressed') !== 'true';
        likeButton.disabled = true;
        try {
          await sigturApiFetch('/api/likes', {
            method: 'POST',
            body: JSON.stringify({ entidad_tipo: 'event', entidad_id: event.id, activo: active }),
          });
          likeButton.setAttribute('aria-pressed', String(active));
          likeButton.classList.toggle('liked', active);
          likeButton.setAttribute('aria-label', active ? 'Quitar like' : 'Dar like');
          const icon = likeButton.querySelector('[aria-hidden="true"]');
          if (icon) icon.textContent = active ? '♥' : '♡';
        } catch (error) {
          likeButton.setAttribute('aria-label', error.message || 'No se pudo actualizar el like');
        } finally {
          likeButton.disabled = false;
        }
      });
    }
    const controls = document.createElement('div');
    controls.className = 'event-interaction-tools';
    controls.innerHTML = `<button class="event-tool" type="button" data-event-detail title="Ver ficha del evento">Ver ficha</button><button class="event-tool" type="button" data-event-comments aria-expanded="false" title="Ver comentarios">${eventIcon('comment')}<span>Comentarios</span></button><button class="event-tool" type="button" data-event-save aria-pressed="false" title="Guardar evento">${eventIcon('save')}<span>Guardar</span></button><button class="event-tool" type="button" data-event-reservation aria-expanded="false" title="Reservar lugar">${eventIcon('reserve')}<span>Reservar</span></button>`;
    row.appendChild(controls);

    const panel = document.createElement('div');
    panel.className = 'event-interaction-panel';
    panel.hidden = true;
    panel.innerHTML = `<div class="event-panel-head"><strong>${escapeHtml(event.title)}</strong><button type="button" class="event-panel-close" data-event-close aria-label="Cerrar panel">×</button></div><div class="event-comments-view"><div class="event-comment-notice">Compartí experiencias útiles y respetá a la comunidad SIGTUR.</div><div class="comment-filter" role="group" aria-label="Ordenar comentarios"><button type="button" data-comment-order="newest" aria-pressed="true">Recientes</button><button type="button" data-comment-order="oldest" aria-pressed="false">Antiguos</button></div><p class="event-panel-status" data-event-panel-status></p><div class="event-comment-list" data-event-comment-list></div><form data-event-comment-form data-comment-media-form><textarea name="contenido" rows="2" maxlength="2000" placeholder="Sumá un comentario o adjuntá una imagen..."></textarea><button class="event-panel-submit" type="submit">Publicar</button></form></div><div class="event-reservation-view" hidden><p class="event-panel-status" data-reservation-status></p><div class="reservation-widget"><p class="reservation-widget-intro">Elegí la modalidad que mejor se adapte a tu día.</p><label>Cantidad de lugares<select data-reservation-quantity><option value="1">1 lugar</option><option value="2">2 lugares</option><option value="3">3 lugares</option><option value="4">4 lugares</option></select></label><fieldset><legend>Horario de llegada</legend><div class="reservation-slots"><label><input type="radio" name="slot-${escapeHtml(event.id)}" value="Temprano · 18:00" checked><span>Temprano<small>18:00</small></span></label><label><input type="radio" name="slot-${escapeHtml(event.id)}" value="Central · 20:00"><span>Central<small>20:00</small></span></label><label><input type="radio" name="slot-${escapeHtml(event.id)}" value="Flexible · a coordinar"><span>Flexible<small>A coordinar</small></span></label></div></fieldset></div><button class="event-panel-submit" type="button" data-reserve-confirm>Confirmar reserva</button></div>`;
    row.insertAdjacentElement('afterend', panel);
    loadComments(panel, event.id);
    syncSavedButton(controls.querySelector('[data-event-save]'), event);

    const closePanel = () => {
      panel.setAttribute('hidden', '');
      row.querySelectorAll('[data-event-comments],[data-event-reservation]').forEach(button => button.setAttribute('aria-expanded', 'false'));
    };
    panel.querySelector('[data-event-close]').addEventListener('click', closeEvent => {
      closeEvent.preventDefault();
      closeEvent.stopPropagation();
      closePanel();
    });

    row.addEventListener('click', async (clickEvent) => {
      const saveButton = clickEvent.target.closest('[data-event-save]');
      if (saveButton) {
        clickEvent.stopPropagation();
        try {
          if (!sigturGetSession()?.token) { showLogin(); return; }
          saveButton.disabled = true;
          const active = saveButton.getAttribute('aria-pressed') !== 'true';
          await sigturApiFetch('/api/guardados', { method: 'POST', body: JSON.stringify({ entidad_tipo: 'event', entidad_id: event.id, activo: active, metadata: { nombre: event.title, direccion: event.location, categorias: [event.category] } }) });
          saveButton.setAttribute('aria-pressed', String(active));
          saveButton.textContent = active ? '🔖 Guardado' : '🔖 Guardar';
        } catch (error) { panel.querySelector('[data-event-panel-status]').textContent = error.message || 'No se pudo guardar el evento.'; }
        finally { saveButton.disabled = false; }
        return;
      }
      if (clickEvent.target.closest('[data-event-detail]')) { clickEvent.stopPropagation(); openEventDetail(event); return; }
      const commentsButton = clickEvent.target.closest('[data-event-comments]');
      const reservationButton = clickEvent.target.closest('[data-event-reservation]');
      if (!commentsButton && !reservationButton) return;
      clickEvent.stopPropagation();
      const isReservation = Boolean(reservationButton);
      panel.hidden = false;
      panel.querySelector('.event-comments-view').hidden = isReservation;
      panel.querySelector('.event-reservation-view').hidden = !isReservation;
      const activeButton = isReservation ? reservationButton : commentsButton;
      const wasExpanded = activeButton.getAttribute('aria-expanded') === 'true';
      row.querySelectorAll('[data-event-comments],[data-event-reservation]').forEach(button => button.setAttribute('aria-expanded', 'false'));
      activeButton.setAttribute('aria-expanded', String(!wasExpanded));
      panel.hidden = wasExpanded;
      if (!isReservation && !wasExpanded) await loadComments(panel, event.id);
    });

    panel.addEventListener('click', async (clickEvent) => {
      const filterButton = clickEvent.target.closest('[data-comment-order]');
      if (filterButton) {
        panel.querySelectorAll('[data-comment-order]').forEach(button => button.setAttribute('aria-pressed', String(button === filterButton)));
        renderComments(panel, panel._eventComments || []);
        return;
      }
      if (clickEvent.target.closest('[data-event-close]')) {
        closePanel();
        return;
      }
      const reserveButton = clickEvent.target.closest('[data-reserve-confirm]');
      if (!reserveButton) return;
      const status = panel.querySelector('[data-reservation-status]');
      try {
        if (!sigturGetSession()?.token) { showLogin(); return; }
        reserveButton.disabled = true;
        const quantity = Number(panel.querySelector('[data-reservation-quantity]').value);
        const schedule = panel.querySelector(`input[name="slot-${CSS.escape(event.id)}"]:checked`)?.value || 'Flexible · a coordinar';
        await sigturApiFetch('/api/reservas/eventos', { method: 'POST', body: JSON.stringify({ event_ref: event.id, event_title: event.title, quantity, schedule }) });
        status.textContent = `Reserva registrada: ${quantity} ${quantity === 1 ? 'lugar' : 'lugares'} · ${schedule}.`;
      } catch (error) {
        status.textContent = error.message || 'No se pudo completar la reserva.';
      } finally { reserveButton.disabled = false; }
    });

    panel.addEventListener('click', async (clickEvent) => {
      const comment = clickEvent.target.closest('[data-comment-id]');
      if (!comment) return;
      try {
        if (!sigturGetSession()?.token) { showLogin(); return; }
        if (clickEvent.target.closest('[data-admin-delete-comment]')) {
          if (sigturGetSession()?.usuario?.rol !== 'admin' || !window.confirm('¿Eliminar este comentario?')) return;
          await sigturApiFetch(`/api/admin/comentarios/${comment.dataset.commentId}`, { method: 'DELETE' });
          await loadComments(panel, event.id);
          return;
        }
        if (clickEvent.target.closest('[data-delete-own-comment]')) {
          if (!window.confirm('¿Eliminar este comentario y sus respuestas?')) return;
          await sigturApiFetch(`/api/comentarios/${comment.dataset.commentId}`, { method: 'DELETE' });
          await loadComments(panel, event.id); return;
        }
        if (clickEvent.target.closest('[data-edit-comment]')) {
          const existing = panel._eventComments.find(item => item.id === comment.dataset.commentId)?.contenido || '';
          const contenido = window.prompt('Editá tu comentario:', existing);
          if (contenido === null || !contenido.trim()) return;
          await sigturApiFetch(`/api/comentarios/${comment.dataset.commentId}`, { method: 'PATCH', body: JSON.stringify({ contenido }) });
          await loadComments(panel, event.id); return;
        }
        if (clickEvent.target.closest('[data-comment-reply]')) {
          comment.querySelector('.event-reply-form').hidden = false;
        }
        if (clickEvent.target.closest('[data-submit-reply]')) {
          const contenido = comment.querySelector('textarea').value;
          await sigturApiFetch(`/api/comentarios/${comment.dataset.commentId}/respuestas`, { method: 'POST', body: JSON.stringify({ contenido }) });
          await loadComments(panel, event.id);
        }
        if (clickEvent.target.closest('[data-comment-like]')) {
          const button = clickEvent.target.closest('[data-comment-like]');
          const state = await sigturApiFetch(`/api/comentarios/${comment.dataset.commentId}/likes`);
          await sigturApiFetch(`/api/comentarios/${comment.dataset.commentId}/likes`, { method: 'POST', body: JSON.stringify({ activo: !state.liked }) });
          await loadComments(panel, event.id);
        }
        if (clickEvent.target.closest('[data-comment-message]')) {
          const recipient = comment.dataset.commentUser;
          const contenido = window.prompt('Mensaje para este usuario:');
          if (contenido?.trim()) await sigturApiFetch('/api/mensajes', { method: 'POST', body: JSON.stringify({ destinatario_id: recipient, contenido }) });
        }
      } catch (error) {
        panel.querySelector('[data-event-panel-status]').textContent = error.message || 'No se pudo completar la acción.';
      }
    });

    panel.querySelector('[data-event-comment-form]').addEventListener('submit', async (submitEvent) => {
      submitEvent.preventDefault();
      const form = submitEvent.currentTarget;
      const status = panel.querySelector('[data-event-panel-status]');
      try {
        if (!sigturGetSession()?.token) { showLogin(); return; }
        const contenido = new FormData(form).get('contenido');
        const media_paths = await window.sigturPrepareCommentMedia(form);
        if (!String(contenido || '').trim() && !media_paths.length) throw new Error('Escribí un comentario o adjuntá una imagen.');
        await sigturApiFetch('/api/comentarios', { method: 'POST', body: JSON.stringify({ entidad_tipo: 'event', entidad_id: event.id, contenido, media_paths }) });
        form.reset();
        window.sigturClearCommentMedia(form);
        await loadComments(panel, event.id);
      } catch (error) { status.textContent = error.message || 'No se pudo publicar el comentario.'; }
    });
  });
}

// ============================================================================
// setupAdminPage() — toda la lógica de admin.html
// Maneja 3 cosas: los 4 switches de ajustes (guardados en
// "sigtur-admin-settings"), el formulario de aviso del sitio (guardado en
// "sigtur-admin-announcement"), y el botón de exportar que copia todo al
// portapapeles como JSON. El "log de actividad" (la función log() de acá
// abajo) es un mini historial en pantalla, se recorta solo a 4 entradas
// (ver el while de abajo) para no crecer infinito.
// Como vimos en el HTML, esta página no tiene ningún control de acceso:
// esta función corre para CUALQUIERA que abra admin.html, logueado o no.
// ============================================================================
async function setupAdminPage() {
  const form = document.getElementById('admin-settings-form');
  if (!form) return;

  const session = sigturGetSession();
  if (!session?.token) {
    window.location.replace('login.html');
    return;
  }

  form.closest('.utility-grid')?.setAttribute('hidden', '');
  try {
    await sigturApiFetch('/api/auth/es-admin');
  } catch (error) {
    console.error('No se pudo validar el acceso de administrador:', error);
    if (error.status === 401) {
      sigturClearSession();
      window.location.replace('login.html');
    } else {
      const message = document.createElement('p');
      message.className = 'auth-status';
      message.setAttribute('role', 'status');
      message.textContent = error.status === 403 ? 'Esta cuenta no tiene permisos de administrador.' : 'No se pudo validar el acceso. Intentá nuevamente.';
      form.closest('.utility-grid')?.before(message);
    }
    return;
  }
  form.closest('.utility-grid')?.removeAttribute('hidden');

  const status = document.getElementById('admin-save-status');
  const activity = document.getElementById('admin-activity');
  const announcementForm = document.getElementById('admin-announcement-form');
  const preview = document.getElementById('admin-announcement-preview');
  const clearBtn = document.getElementById('admin-clear-announcement');
  const exportBtn = document.getElementById('admin-export');

  const defaults = {
    featuredEvents: true,
    reviewPlaces: true,
    showSupport: true,
    maintenanceMode: false
  };

  const log = async (message) => { try { await sigturApiFetch('/api/admin/actividad', { method: 'POST', body: JSON.stringify({ action: 'admin.action', details: { message } }) }); const rows = await sigturApiFetch('/api/admin/actividad?page=1&pageSize=8'); if (activity) activity.innerHTML = (rows.data || []).map(row => `<p>${escapeText(new Date(row.created_at).toLocaleString('es-UY'))} · ${escapeText(row.details?.message || row.action)}</p>`).join(''); } catch { if (activity) activity.textContent = 'No se pudo guardar la actividad.'; } };

  const setStatus = (message) => {
    if (!status) return;
    status.textContent = message;
    clearTimeout(setStatus.timer);
    setStatus.timer = setTimeout(() => { status.textContent = 'Listo'; }, 1800);
  };

  const applySettings = (settings) => {
    Object.entries({ ...defaults, ...settings }).forEach(([key, value]) => {
      const input = form.elements[key];
      if (input) input.checked = Boolean(value);
    });
  };

  const collectSettings = () => Array.from(form.querySelectorAll('input[type="checkbox"]')).reduce((acc, input) => {
    acc[input.name] = input.checked;
    return acc;
  }, {});

  const updatePreview = () => {
    const saved = savedAnnouncement;
    if (!preview) return;
    preview.textContent = saved?.title ? `${saved.title}: ${saved.body || 'Sin descripcion'}` : 'Sin aviso publicado.';
  };

  let savedAnnouncement = null;
  try {
    const [settings, notice, metrics] = await Promise.all([sigturApiFetch('/api/admin/configuracion'), sigturApiFetch('/api/admin/aviso'), sigturApiFetch('/api/admin/metricas')]);
    applySettings({ ...defaults, ...settings });
    savedAnnouncement = notice.data || null;
    if (savedAnnouncement && announcementForm) { announcementForm.elements.title.value = savedAnnouncement.title || ''; announcementForm.elements.body.value = savedAnnouncement.body || ''; }
    Object.entries(metrics).forEach(([key, value]) => { const metric = document.querySelector(`[data-admin-metric="${key}"]`); if (metric) metric.textContent = String(value); });
  } catch (error) { setStatus(error.message || 'No se pudo cargar la configuración.'); }
  updatePreview();
  try { const rows = await sigturApiFetch('/api/admin/actividad?page=1&pageSize=8'); if (activity) activity.innerHTML = (rows.data || []).map(row => `<p>${escapeText(new Date(row.created_at).toLocaleString('es-UY'))} · ${escapeText(row.action.replaceAll('.', ' '))}</p>`).join('') || '<p>Sin actividad registrada.</p>'; } catch { if (activity) activity.textContent = 'No se pudo cargar la actividad.'; }

  form.addEventListener('change', async (event) => {
    const settings = collectSettings();
    try { await sigturApiFetch('/api/admin/configuracion', { method: 'PATCH', body: JSON.stringify(settings) }); setStatus('Cambios guardados en el servidor'); await loadPublicSiteSettings(); }
    catch (error) { event.target.checked = !event.target.checked; setStatus(error.message || 'No se pudieron guardar los ajustes.'); return; }
    const label = event.target?.closest('.settings-item')?.querySelector('strong')?.textContent || 'Ajuste';
    void label;
  });

  announcementForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const data = new FormData(announcementForm);
    const announcement = {
      title: String(data.get('title') || '').trim(),
      body: String(data.get('body') || '').trim(),
      updatedAt: new Date().toISOString()
    };
    try { const response = await sigturApiFetch('/api/admin/aviso', { method: 'PUT', body: JSON.stringify(announcement) }); savedAnnouncement = response.data; await loadPublicSiteSettings(); }
    catch (error) { setStatus(error.message || 'No se pudo guardar el aviso.'); return; }
    updatePreview();
    setStatus('Aviso guardado');

  });

  clearBtn?.addEventListener('click', async () => {
    try { await sigturApiFetch('/api/admin/aviso', { method: 'DELETE' }); savedAnnouncement = null; await loadPublicSiteSettings(); }
    catch (error) { setStatus(error.message || 'No se pudo eliminar el aviso.'); return; }
    announcementForm?.reset();
    updatePreview();
    setStatus('Aviso limpiado');
  });

  // gonza: el export copia el estado actual del admin al portapapeles como JSON.
  // clipboard.writeText también es async porque acceder al portapapeles
  // puede requerir permiso del browser en algunos casos
  exportBtn?.addEventListener('click', async () => {
    const payload = {
      settings: collectSettings(),
      announcement: savedAnnouncement,
      exportedAt: new Date().toISOString()
    };
    const text = JSON.stringify(payload, null, 2);
    try {
      await navigator.clipboard.writeText(text);
      setStatus('Estado copiado');
      log('Estado copiado al portapapeles');
    } catch {
      setStatus('Export listo en consola');
      console.info('SIGTUR admin export', payload);
      log('Estado enviado a consola');
    }
  });

  const eventForm = document.getElementById('admin-event-form');
  const eventsList = document.getElementById('admin-events-list');
  const eventImageInput = document.getElementById('admin-event-image');
  const eventImagePreview = document.getElementById('admin-event-image-preview');
  const eventImagePreviewImg = eventImagePreview?.querySelector('img');
  const eventMapElement = document.getElementById('admin-event-map');
  const eventLatitude = document.getElementById('admin-event-latitude');
  const eventLongitude = document.getElementById('admin-event-longitude');
  const eventCategorySymbols = {
    cultura: '🎭', musica: '♫', deportes: '⚽', feria: '▦',
    gastronomia: '♨', religiosos: '✦', infantiles: '★'
  };
  const eventCategorySymbol = (categories) => {
    const category = Array.isArray(categories) ? categories[0] : categories;
    return eventCategorySymbols[String(category || '').toLowerCase()] || '◉';
  };
  const renderAdminEvents = (events) => {
    if (!eventsList) return;
    eventsList.innerHTML = events.map(event => {
      const category = Array.isArray(event.categories) ? event.categories[0] : '';
      const eventDate = event.date_start ? new Date(`${event.date_start}T00:00:00`).toLocaleDateString('es-UY') : 'Fecha pendiente';
      const eventTime = event.event_time ? ` · ${String(event.event_time).slice(0, 5)}` : '';
      const image = event.image_url
        ? `<img src="${escapeText(event.image_url)}" alt="" loading="lazy"><span class="admin-event-fallback" aria-hidden="true">${eventCategorySymbol(event.categories)}</span>`
        : `<span class="admin-event-fallback" aria-hidden="true">${eventCategorySymbol(event.categories)}</span>`;
      return `<li class="admin-event-item"><div class="admin-event-thumb">${image}</div><div class="admin-event-summary"><strong>${escapeText(event.title || 'Evento sin título')}</strong><span>${eventCategorySymbol(event.categories)} ${escapeText(category || 'Evento')} · ${eventDate}${eventTime}</span><small>${escapeText(event.location || 'Lugar sin especificar')} · ${Number(event.price) > 0 ? `$${escapeText(event.price)}` : 'Gratis'}</small></div><button type="button" class="admin-event-delete" data-delete-event="${escapeText(event.id)}" aria-label="Eliminar ${escapeText(event.title || 'evento')}" title="Eliminar evento">Eliminar</button></li>`;
    }).join('') || '<li class="admin-event-empty ui-list-status">Todavía no hay eventos publicados.</li>';
    eventsList.querySelectorAll('.admin-event-thumb img').forEach(image => image.addEventListener('error', () => image.remove(), { once: true }));
  };
  let eventsPage = 1;
  const loadAdminEvents = async () => {
    if (!eventsList) return;
    eventsList.setAttribute('aria-busy', 'true'); eventsList.innerHTML = '<li class="admin-event-empty ui-list-status is-loading" role="status">Cargando eventos...</li>;'
    try {
      const query = new URLSearchParams({ page: eventsPage, pageSize: 10, q: document.getElementById('admin-events-search')?.value || '' });
      const response = await sigturApiFetch(`/api/admin/eventos?${query}`);
      renderAdminEvents(response.data || []); eventsList.setAttribute('aria-busy', 'false');
      const label = document.getElementById('admin-events-page'); if (label) label.textContent = `Página ${eventsPage} · ${response.total} eventos`;
    } catch (error) {
      eventsList.innerHTML = `<li class="admin-event-empty ui-list-status is-error" role="alert">${escapeText(error.message || 'No se pudieron cargar los eventos.')}</li>`; eventsList.setAttribute('aria-busy', 'false');
    }
  };
  const updateEventImagePreview = () => {
    const imageUrl = String(eventImageInput?.value || '').trim();
    if (!eventImagePreview || !eventImagePreviewImg) return;
    if (!imageUrl) {
      eventImagePreview.hidden = true;
      eventImagePreviewImg.removeAttribute('src');
      return;
    }
    eventImagePreviewImg.onload = () => { eventImagePreview.hidden = false; };
    eventImagePreviewImg.onerror = () => { eventImagePreview.hidden = true; };
    eventImagePreviewImg.src = imageUrl;
  };
  eventImageInput?.addEventListener('input', updateEventImagePreview);
  eventImageInput?.addEventListener('change', updateEventImagePreview);
  loadAdminEvents();
  document.querySelectorAll('[data-admin-page="events"]').forEach(button => button.addEventListener('click', () => { eventsPage = Math.max(1, eventsPage + Number(button.dataset.direction)); loadAdminEvents(); }));
  document.getElementById('admin-events-search')?.addEventListener('input', () => { eventsPage = 1; clearTimeout(window.adminEventsSearchTimer); window.adminEventsSearchTimer = setTimeout(loadAdminEvents, 250); });
  if (eventMapElement && eventLatitude && eventLongitude && window.L) {
    // El clic en el mapa completa las coordenadas que viajan al backend.
    const eventMap = L.map(eventMapElement).setView([-31.383, -57.964], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© OpenStreetMap contributors' }).addTo(eventMap);
    let eventMarker;
    const setEventPoint = (latitude, longitude) => {
      eventLatitude.value = latitude.toFixed(6);
      eventLongitude.value = longitude.toFixed(6);
      if (eventMarker) eventMarker.setLatLng([latitude, longitude]);
      else eventMarker = L.marker([latitude, longitude]).addTo(eventMap);
    };
    eventMap.on('click', clickEvent => setEventPoint(clickEvent.latlng.lat, clickEvent.latlng.lng));
    // Tambien permite pegar coordenadas manuales para ajustar el punto.
    [eventLatitude, eventLongitude].forEach(input => input.addEventListener('change', () => {
      if (!eventLatitude.value.trim() || !eventLongitude.value.trim()) return;
      const latitude = Number(eventLatitude.value);
      const longitude = Number(eventLongitude.value);
      if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
        setEventPoint(latitude, longitude);
        eventMap.setView([latitude, longitude], Math.max(eventMap.getZoom(), 15));
      }
    }));
    window.setTimeout(() => eventMap.invalidateSize(), 0);
  }
  const usersList = document.getElementById('admin-users-list');
  const commentsList = document.getElementById('admin-comments-list');
  const adminStatus = document.getElementById('admin-resource-status');
  const showResourceStatus = (message) => { if (adminStatus) adminStatus.textContent = message; };
  const renderUsers = (users) => {
    if (!usersList) return;
    usersList.innerHTML = users.map(user => `<li><span>${escapeText(user.nombre || 'Usuario')} · ${escapeText(user.correo)}</span><button type="button" data-ban-user="${user.id}" data-banned="${Boolean(user.banned)}">${user.banned ? 'Desbanear' : 'Banear 24 h'}</button></li>`).join('') || '<li>No hay usuarios.</li>';
  };
  const pages = { users: 1, comments: 1, support: 1 };
  const loadUsers = async () => {
    if (usersList) { usersList.setAttribute('aria-busy', 'true'); usersList.innerHTML = '<li class="ui-list-status is-loading" role="status">Cargando usuarios...</li>'; }
    try {
      const q = new URLSearchParams({ page: pages.users, pageSize: 10, q: document.getElementById('admin-users-search')?.value || '' });
      const result = await sigturApiFetch(`/api/admin/usuarios?${q}`);
      renderUsers(result.data || []);
      const label = document.getElementById('admin-users-page'); if (label) label.textContent = `Página ${pages.users} · ${result.total} usuarios`;
    } catch (error) {
      if (usersList) usersList.innerHTML = `<li class="ui-list-status is-error" role="alert">${escapeText(error.message || 'No se pudieron cargar los usuarios.')}</li>`;
      showResourceStatus(error.message); throw error;
    } finally { usersList?.setAttribute('aria-busy', 'false'); }
  };
  const loadComments = async () => {
    if (commentsList) { commentsList.setAttribute('aria-busy', 'true'); commentsList.innerHTML = '<li class="ui-list-status is-loading" role="status">Cargando comentarios...</li>'; }
    try {
      const q = new URLSearchParams({ page: pages.comments, pageSize: 10, q: document.getElementById('admin-comments-search')?.value || '' });
      const result = await sigturApiFetch(`/api/admin/comentarios?${q}`);
      if (commentsList) commentsList.innerHTML = (result.data || []).map(comment => `<li><span>${comment.fijado ? 'Fijado \u00b7 ' : ''}${escapeText(comment.contenido.slice(0, 120))}</span><span><button type="button" data-pin-comment="${comment.id}" data-pinned="${Boolean(comment.fijado)}">${comment.fijado ? 'Desfijar' : 'Fijar'}</button><button type="button" data-delete-comment="${comment.id}">Borrar</button></span></li>`).join('') || '<li class="ui-list-status">No hay comentarios.</li>';
      const label = document.getElementById('admin-comments-page'); if (label) label.textContent = `Página ${pages.comments} · ${result.total} comentarios`;
    } catch (error) {
      if (commentsList) commentsList.innerHTML = `<li class="ui-list-status is-error" role="alert">${escapeText(error.message || 'No se pudieron cargar los comentarios.')}</li>`;
      showResourceStatus(error.message); throw error;
    } finally { commentsList?.setAttribute('aria-busy', 'false'); }
  };
  const loadSupport = async () => {
    const list = document.getElementById('admin-support-list');
    if (list) { list.setAttribute('aria-busy', 'true'); list.innerHTML = '<li class="ui-list-status is-loading" role="status">Cargando consultas...</li>'; }
    try {
      const q = new URLSearchParams({ page: pages.support, pageSize: 10, status: document.getElementById('admin-support-status')?.value || '' });
      const result = await sigturApiFetch(`/api/admin/soporte?${q}`);
      if (list) list.innerHTML = (result.data || []).map(ticket => `<li><span><strong>${escapeText(ticket.topic)}</strong> \u00b7 ${escapeText(ticket.name)} (${escapeText(ticket.email)})<br>${escapeText(ticket.message.slice(0, 160))}<small> \u00b7 ${escapeText(ticket.status)}</small></span><select data-ticket-status="${ticket.id}" aria-label="Estado del ticket"><option value="open" ${ticket.status === 'open' ? 'selected' : ''}>Abierta</option><option value="in_progress" ${ticket.status === 'in_progress' ? 'selected' : ''}>En curso</option><option value="resolved" ${ticket.status === 'resolved' ? 'selected' : ''}>Resuelta</option></select></li>`).join('') || '<li class="ui-list-status">No hay consultas.</li>';
      const label = document.getElementById('admin-support-page'); if (label) label.textContent = `Página ${pages.support} · ${result.total} consultas`;
    } catch (error) {
      if (list) list.innerHTML = `<li class="ui-list-status is-error" role="alert">${escapeText(error.message || 'No se pudieron cargar las consultas.')}</li>`;
      showResourceStatus(error.message); throw error;
    } finally { list?.setAttribute('aria-busy', 'false'); }
  };
  try { await Promise.all([loadUsers(), loadComments(), loadSupport()]); } catch (error) { showResourceStatus(error.message); }
  document.querySelectorAll('[data-admin-page]').forEach(button => button.addEventListener('click', async () => { const key = button.dataset.adminPage; pages[key] = Math.max(1, pages[key] + Number(button.dataset.direction)); try { await ({ users: loadUsers, comments: loadComments, support: loadSupport })[key](); } catch (error) { showResourceStatus(error.message); } }));
  [['admin-users-search','users',loadUsers],['admin-comments-search','comments',loadComments]].forEach(([id,key,loader]) => document.getElementById(id)?.addEventListener('input', () => { pages[key] = 1; clearTimeout(window.adminSearchTimer); window.adminSearchTimer = setTimeout(() => loader().catch(error => showResourceStatus(error.message)), 250); }));
  document.getElementById('admin-support-status')?.addEventListener('change', () => { pages.support = 1; loadSupport().catch(error => showResourceStatus(error.message)); });
  document.getElementById('admin-support-list')?.addEventListener('change', async event => { const select = event.target.closest('[data-ticket-status]'); if (!select) return; try { await sigturApiFetch(`/api/admin/soporte/${select.dataset.ticketStatus}`, { method: 'PATCH', body: JSON.stringify({ status: select.value }) }); await loadSupport(); } catch (error) { showResourceStatus(error.message); } });
  eventForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const data = new FormData(eventForm);
    try {
      await sigturApiFetch('/api/admin/eventos', { method: 'POST', body: JSON.stringify({ title: data.get('title'), description: data.get('description'), date_start: data.get('date_start'), date_end: data.get('date_end'), event_time: data.get('event_time'), location: data.get('location'), latitude: data.get('latitude'), longitude: data.get('longitude'), price: data.get('price'), color: data.get('color'), image_url: data.get('image_url'), categories: [data.get('category')] }) });
      eventForm.reset();
      updateEventImagePreview();
      showResourceStatus('Evento creado correctamente.');
      await loadAdminEvents();
    } catch (error) { showResourceStatus(error.message); }
  });
  eventsList?.addEventListener('click', async (event) => {
    const button = event.target.closest('[data-delete-event]');
    if (!button || !window.confirm('¿Eliminar este evento? Esta acción no se puede deshacer.')) return;
    button.disabled = true;
    try {
      await sigturApiFetch(`/api/admin/eventos/${encodeURIComponent(button.dataset.deleteEvent)}`, { method: 'DELETE' });
      button.closest('.admin-event-item')?.remove();
      if (!eventsList.querySelector('.admin-event-item')) renderAdminEvents([]);
      showResourceStatus('Evento eliminado.');
    } catch (error) {
      button.disabled = false;
      showResourceStatus(error.message || 'No se pudo eliminar el evento.');
    }
  });
  usersList?.addEventListener('click', async (event) => {
    const button = event.target.closest('[data-ban-user]');
    if (!button) return;
    try {
      const duration = button.dataset.banned === 'true' ? 'none' : '24h';
      await sigturApiFetch(`/api/admin/usuarios/${button.dataset.banUser}/baneo`, { method: 'PATCH', body: JSON.stringify({ duration }) });
      button.dataset.banned = duration === 'none' ? 'false' : 'true';
      button.textContent = duration === 'none' ? 'Banear 24 h' : 'Desbanear';
      showResourceStatus(duration === 'none' ? 'Usuario desbaneado.' : 'Usuario baneado por 24 horas.');
    } catch (error) { showResourceStatus(error.message); }
  });
  commentsList?.addEventListener('click', async event => {
    const pinButton = event.target.closest('[data-pin-comment]');
    if (pinButton) {
      try {
        const fixed = pinButton.dataset.pinned !== 'true';
        await sigturApiFetch(`/api/admin/comentarios/${pinButton.dataset.pinComment}/fijado`, { method: 'PATCH', body: JSON.stringify({ fijado: fixed }) });
        pinButton.dataset.pinned = String(fixed);
        pinButton.textContent = fixed ? 'Desfijar' : 'Fijar';
        const text = pinButton.closest('li')?.querySelector('span');
        if (text) text.innerHTML = `${fixed ? '📌 ' : ''}${text.textContent.replace(/^📌\s*/, '')}`;
        showResourceStatus(fixed ? 'Comentario fijado.' : 'Comentario desfijado.');
      } catch (error) { showResourceStatus(error.message); }
      return;
    }
    const button = event.target.closest('[data-delete-comment]');
    if (!button || !window.confirm('¿Borrar este comentario?')) return;
    try {
      await sigturApiFetch(`/api/admin/comentarios/${button.dataset.deleteComment}`, { method: 'DELETE' });
      button.closest('li')?.remove();
      showResourceStatus('Comentario borrado.');
    } catch (error) { showResourceStatus(error.message); }
  });
}

// ============================================================================
// setupSupportPage() — envía las consultas al backend y carga el historial
// del usuario autenticado desde la API de soporte.
// ============================================================================
async function loadPublicSiteSettings() {
  try {
    const site = await sigturApiFetch('/api/public/site');
    let banner = document.getElementById('site-announcement');
    if (site.announcement?.title && !banner) { banner = document.createElement('aside'); banner.id = 'site-announcement'; banner.className = 'site-announcement'; document.body.prepend(banner); }
    if (banner) { banner.hidden = !site.announcement?.title; banner.textContent = site.announcement?.title ? `${site.announcement.title}: ${site.announcement.body}` : ''; }
    if (site.settings?.showSupport === false) document.querySelectorAll('a[href*="soporte.html"]').forEach(link => { link.hidden = true; });
    let maintenance = document.getElementById('site-maintenance-notice');
    if (site.settings?.maintenanceMode && !maintenance) { maintenance = document.createElement('aside'); maintenance.id = 'site-maintenance-notice'; maintenance.className = 'site-announcement'; maintenance.textContent = 'Estamos realizando tareas de mantenimiento. Algunas funciones pueden cambiar temporalmente.'; document.body.prepend(maintenance); }
    if (maintenance) maintenance.hidden = !site.settings?.maintenanceMode;
  } catch { /* el sitio sigue disponible si el backend temporalmente no responde */ }
}

function setupSupportPage() {
  const form = document.getElementById('support-form');
  if (!form) return;

  const list = document.getElementById('support-ticket-list');
  const status = document.getElementById('support-status');

  const render = tickets => {
    if (!list) return;
    list.innerHTML = tickets.length ? tickets.map(ticket => `<article class="support-ticket"><div><strong>${escapeText(ticket.topic)}</strong><span>${escapeText(ticket.name)} · ${escapeText(ticket.email)}</span></div><p>${escapeText(ticket.message)}</p><small>${escapeText(new Date(ticket.created_at).toLocaleString('es-UY'))} · ${escapeText(ticket.status)}</small></article>`).join('') : '<p class="empty-state">Todavía no hay tickets.</p>';
  };
  const loadMine = async () => {
    if (!sigturGetSession()?.token || !list) return;
    list.textContent = 'Cargando tus consultas…';
    try { const result = await sigturApiFetch('/api/soporte/mios?page=1&pageSize=5'); render(result.data || []); }
    catch { list.textContent = 'No se pudieron cargar tus consultas.'; }
  };
  loadMine();
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const ticket = {
      // crypto.randomUUID genera un id único, el fallback es Date.now() para browsers viejos
      name: String(data.get('name') || '').trim(),
      email: String(data.get('email') || '').trim(),
      topic: String(data.get('topic') || 'General'),
      message: String(data.get('message') || '').trim(),
      createdAt: new Date().toISOString()
    };
    if (!ticket.name || !ticket.email || !ticket.message) {
      if (status) status.textContent = 'Completa los campos requeridos';
      return;
    }
    if (status) status.textContent = 'Enviando consulta…';
    try { const result = await sigturApiFetch('/api/soporte', { method: 'POST', body: JSON.stringify(ticket) }); form.reset(); if (status) status.textContent = `Consulta recibida (${result.data.id.slice(0, 8)}).`; await loadMine(); }
    catch (error) { if (status) status.textContent = error.message || 'No se pudo enviar la consulta. Intentá nuevamente.'; }
  });
}
