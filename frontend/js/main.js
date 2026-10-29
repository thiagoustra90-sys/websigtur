// ============================================================================
// main.js — ÚNICO archivo de JavaScript de todo el sitio (SIGTUR Salto)

// Nota del equipo: acá vive TODA la interactividad de las 7 páginas del
// sitio (home, eventos, turismo, lugares, login, admin, soporte). No hay
// ningún framework (nada de React/Vue), es JS "vanilla" puro con
// querySelector/addEventListener de toda la vida. Tampoco hay backend real:
// todo lo que "se guarda" en este sitio (sesión de usuario, tickets de
// soporte, ajustes del admin, tema claro/oscuro) se guarda en
// localStorage del navegador. Buscar "localStorage" en este archivo para
// ver los ~6 lugares donde pasa esto.
//
// Fijate que ya hay comentarios de "gonza" (uno del equipo, según parece)
// repartidos por todo el archivo, bastante buenos y explicando las partes
// más complicadas (el carrusel con clones, el fetch del clima, etc). Los
// dejamos tal cual están y solo sumamos algunas notas nuestras donde
// hacía falta un poco más de contexto o donde vimos algo para señalar.
//
// Estructura general del archivo:
//   1) Un solo DOMContentLoaded gigante al principio, que arranca TODO:
//      tema guardado, menú del logo, setup de auth/admin/soporte/footer,
//      y después un bloque por página (page-home / page-eventos / etc)
//   2) Funciones sueltas declaradas más abajo (setupFooterAccordions,
//      buildLogoMenu, setupHomeWeather, setupAuthPage, setupAdminPage,
//      setupSupportPage) que el DOMContentLoaded de arriba llama
// ============================================================================

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
  processOAuthCallback((message, type = 'ok') => {
    if (!oauthStatus) return;
    oauthStatus.textContent = message;
    oauthStatus.dataset.type = type;
    oauthStatus.hidden = !message;
  });
  setupAdminPage();
  setupProfilePage();
  setupSupportPage();
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

      // creamos un puntito por cada slide y lo agregamos al DOM
      slides.forEach((_, i) => {
        const dot = document.createElement('div');
        dot.className = 'dot' + (i === 0 ? ' active' : '');
        dot.addEventListener('click', () => goTo(i));
        dotsEl.appendChild(dot);
      });

      function updateDots() { dotsEl.querySelectorAll('.dot').forEach((dot, i) => dot.classList.toggle('active', i === current)); }

      // gonza: el truco del carrusel es mover el track con translateX.
      // si current=1 y cada slide ocupa 100%, movemos -100% → muestra el slide 2
      function goTo(index) { current = (index + total) % total; track.style.transform = `translateX(-${current * 100}%)`; updateDots(); }

      // reseteamos el timer automático cada vez que el usuario clickea una flecha
      function resetAuto() { clearInterval(autoTimer); autoTimer = setInterval(() => goTo(current + 1), 4500); }

      prevBtn?.addEventListener('click', () => { goTo(current - 1); resetAuto(); });
      nextBtn?.addEventListener('click', () => { goTo(current + 1); resetAuto(); });
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
    featCarousel?.addEventListener('mouseenter', () => clearInterval(autoTimer));
    featCarousel?.addEventListener('mouseleave', () => { autoTimer = setInterval(next, 4000); });

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
      tabs.forEach(tab => {
        tab.addEventListener('click', () => {
          tabs.forEach(item => item.classList.remove('active'));
          tab.classList.add('active');
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
  // gonza: esto es un buscador mínimo que detecta palabras clave y
  // scrollea a la sección correspondiente. Nada de IA, solo includes() 😄
  if (body.classList.contains('page-turismo')) {
    const navSearch = document.querySelector('.nav-search input');
    navSearch?.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter') return;
      const query = navSearch.value.toLowerCase();
      const selector = query.includes('aloj') || query.includes('hotel') ? '#alojamientos' :
        query.includes('restau') || query.includes('comid') || query.includes('sabor') ? '#restaurantes' :
        query.includes('histor') ? '#historia' : null;
      if (selector) document.querySelector(selector)?.scrollIntoView({ behavior: 'smooth' });
    });
    setupTourismPlanning();
    setupTourismCuriosity();
  }

  // --- LUGARES (lugares.html) ---
  if (body.classList.contains('page-lugares')) {
    document.querySelectorAll('.lugar-action-link.guardar').forEach(btn => {
      btn.addEventListener('click', (event) => { event.preventDefault(); btn.classList.toggle('liked'); });
    });
  }

  // corazones de las cards de alojamiento y tickets de eventos
  document.querySelectorAll('.prop-heart, .ticket-heart').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.classList.toggle('liked');
      const fill = btn.querySelector('.heart-fill');
      if (fill) {
        const liked = btn.classList.contains('liked');
        fill.setAttribute('fill', liked ? '#e84040' : 'none');
        fill.setAttribute('stroke', liked ? '#e84040' : 'rgba(0,0,0,0.25)');
      }
    });
  });
});

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

// el botón de "Cerrar sesion" del menú del logo reusa la pinta de los <a>
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
  const session = sigturGetSession();
  const accountLink = session?.usuario
    ? `<a href="perfil.html" role="menuitem">Mi perfil (${session.usuario.nombre})</a>`
    : `<a href="login.html" role="menuitem">Login / Registro</a>`;

  const menu = document.createElement('div');
  menu.className = 'logo-menu';
  menu.setAttribute('role', 'menu');
  menu.innerHTML = `
    <a href="index.html" role="menuitem">Inicio</a>
    ${accountLink}
    <a href="admin.html" role="menuitem">Configuracion admin</a>
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

  menu.querySelector('[data-logout]')?.addEventListener('click', async () => {
    try { await sigturApiFetch('/api/auth/logout', { method: 'POST' }); } catch { /* igual limpiamos local */ }
    sigturClearSession();
    window.location.reload();
  });

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
// y backend/rutas/auth rutas.js). La sesión (token + datos del usuario) se
// cachea en localStorage bajo 'sigtur-session' solo para no tener que
// loguearse de nuevo en cada página, pero la fuente de verdad es siempre
// el backend: el token se manda en el header Authorization de cada fetch.
const xamppRoot = window.location.pathname.split('/frontend/html/')[0];
const SIGTUR_IS_LOCAL_HOST = ['localhost', '127.0.0.1'].includes(window.location.hostname);
const SIGTUR_XAMPP_BASE = SIGTUR_IS_LOCAL_HOST && xamppRoot !== window.location.pathname ? `${window.location.origin}${xamppRoot}/frontend/html` : '';
const SIGTUR_BACKEND_URL = window.SIGTUR_BACKEND_URL || '';
const SIGTUR_API_BASE = SIGTUR_XAMPP_BASE || SIGTUR_BACKEND_URL;
const SIGTUR_SESSION_KEY = 'sigtur-session';

function sanitizeAuthMessage(message, fallback) {
  const text = String(message || '').trim();
  if (!text) return fallback;
  if (/token|refresh_token|access_token|authorization|Bearer|secret|api[_ -]?key/i.test(text)) {
    return fallback;
  }
  return text;
}

function sigturGetSession() {
  try {
    return JSON.parse(localStorage.getItem(SIGTUR_SESSION_KEY)) || null;
  } catch {
    return null;
  }
}

function sigturSaveSession(session) {
  localStorage.setItem(SIGTUR_SESSION_KEY, JSON.stringify(session));
}

function sigturClearSession() {
  localStorage.removeItem(SIGTUR_SESSION_KEY);
}

async function processOAuthCallback(setStatus) {
  const queryParams = new URLSearchParams(window.location.search);
  const hashParams = new URLSearchParams(window.location.hash.slice(1));
  const params = queryParams.has('access_token') || queryParams.has('refresh_token') ? queryParams : hashParams;
  const oauthError = queryParams.get('oauth_error') || hashParams.get('oauth_error');
  const accessToken = params.get('access_token');
  if (oauthError && !accessToken) {
    window.history.replaceState({}, document.title, window.location.pathname);
    if (!document.getElementById('auth-status') && window.location.pathname === '/') {
      const loginUrl = new URL('/login.html', window.location.origin);
      loginUrl.searchParams.set('oauth_error', oauthError);
      window.location.replace(loginUrl.toString());
      return;
    }
    setStatus(oauthError, 'error');
    return;
  }
  if (!accessToken) return;

  const session = {
    token: accessToken,
    refreshToken: params.get('refresh_token') || null,
    expiresAt: Number(params.get('expires_at')) || null,
  };
  sigturSaveSession(session);
  window.history.replaceState({}, document.title, window.location.pathname);
  try {
    const result = await sigturApiFetch('/api/auth/me');
    sigturSaveSession({ ...session, usuario: result.usuario });
    setStatus(`Bienvenido, ${result.usuario?.nombre || 'usuario'}.`, 'ok');
    window.location.href = 'index.html';
  } catch {
    sigturClearSession();
    setStatus('La sesión de Google no pudo validarse. Intenta nuevamente.', 'error');
  }
}

async function logout() {
  try { await sigturApiFetch('/api/auth/logout', { method: 'POST' }); } catch { /* la sesión local también debe limpiarse */ }
  sigturClearSession();
  window.location.href = 'login.html';
}

async function sigturRefreshSession() {
  const currentSession = sigturGetSession();
  if (!currentSession?.refreshToken) return null;

  try {
    const response = await fetch(`${SIGTUR_BACKEND_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: currentSession.refreshToken }),
    });
    const renewedSession = await response.json().catch(() => null);
    if (!response.ok || !renewedSession?.token) return null;
    sigturSaveSession({ ...currentSession, ...renewedSession, usuario: renewedSession.usuario || currentSession.usuario });
    return sigturGetSession();
  } catch {
    return null;
  }
}

async function sigturApiFetch(path, options = {}, retriedAfterRefresh = false) {
  const session = sigturGetSession();
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (session?.token) headers.Authorization = `Bearer ${session.token}`;

  const isXamppAuth = SIGTUR_API_BASE.endsWith('/frontend/html') && path.startsWith('/api/auth/');
  const isRefresh = path === '/api/auth/refresh';
  const isProfileUpdate = path === '/api/auth/me' && String(options.method || 'GET').toUpperCase() === 'PATCH';
  const isXamppInteraction = SIGTUR_API_BASE.endsWith('/frontend/html') && /^(\/api\/(guardados|likes|comentarios|mensajes|admin))/.test(path);
  const isXamppBackendRoute = SIGTUR_API_BASE.endsWith('/frontend/html') && /^\/api\/(eventos|companias|mapa)/.test(path);
  const target = isXamppAuth && !isProfileUpdate && !isRefresh
    ? `${SIGTUR_API_BASE}/api/auth.php?action=${encodeURIComponent(path.slice('/api/auth/'.length))}`
    : isXamppInteraction || isXamppBackendRoute || isProfileUpdate || isRefresh
      ? `${SIGTUR_BACKEND_URL}${path}`
    : `${SIGTUR_API_BASE}${path}`;
  let response;
  try {
    response = await fetch(target, { ...options, headers });
  } catch (cause) {
    console.error(`Error de red al llamar a ${target}`, cause);
    throw new Error('No se pudo conectar al servidor. Verificá la configuración de la URL pública del backend.');
  }
  let payload = null;
  try { payload = await response.json(); } catch { /* respuesta vacía */ }

  if (response.status === 401 && !retriedAfterRefresh && !isRefresh && session?.refreshToken) {
    const renewedSession = await sigturRefreshSession();
    if (renewedSession) return sigturApiFetch(path, options, true);
  }

  if (!response.ok) {
    throw new Error(payload?.error || 'Ocurrió un error inesperado. Intenta de nuevo.');
  }
  return payload;
}

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
    setStatus(`Ya iniciaste sesión como ${existingSession.usuario.nombre}. Podes cerrar sesión desde el menú del logo.`, 'ok');
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => activateTab(tab.dataset.authTab));
  });

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
      sigturSaveSession(resultado);
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
      sigturSaveSession(resultado);
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

  document.getElementById('recovery-cancel')?.addEventListener('click', () => {
    recoveryForm?.toggleAttribute('hidden', true);
    loginForm?.toggleAttribute('hidden', false);
    recoveryForm?.classList.remove('active');
    loginForm?.classList.add('active');
    setStatus('');
  });
}

async function setupProfilePage() {
  const profilePage = document.querySelector('.profile-page');
  if (!profilePage) return;

  const session = sigturGetSession();
  if (!session?.token) {
    window.location.href = 'login.html';
    return;
  }

  try {
    const result = await sigturApiFetch('/api/auth/me');
    const usuario = result.usuario || {};
    sigturSaveSession({ ...session, usuario });

    const name = usuario.nombre || usuario.correo?.split('@')[0] || 'Usuario';
    const initials = name.trim().split(/\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase();
    renderProfileIdentity(usuario, initials || '?');
    document.getElementById('role-tags').innerHTML = `<span class="tag">${usuario.rol === 'admin' ? 'Administrador' : 'Explorador'}</span>`;
    document.getElementById('followers').textContent = 'Activa';
    setupProfileEditor(usuario);
    renderProfileReservations(usuario.id);

    try {
      const saved = await sigturApiFetch('/api/guardados');
      const savedPlaces = await hydrateSavedPlaces(saved.data || [], usuario.id);
      document.getElementById('total-count').textContent = savedPlaces.length;
      document.getElementById('following').textContent = savedPlaces.filter(item => item.entidad_tipo === 'place').length;
      renderProfileGrid(savedPlaces);
    } catch {
      // El perfil sigue siendo válido aunque falte la migración de interacciones.
      renderProfileGrid([]);
    }
    setupMessaging();
  } catch {
    sigturClearSession();
    window.location.href = 'login.html';
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
      sigturSaveSession({ ...session, usuario: result.usuario });
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
  if (!contactSelect || !thread || !form) return;

  let contacts = [];
  let conversations = [];
  let activeId = '';
  let refreshing = false;
  let messagingBroadcast = null;

  const currentUserId = () => sigturGetSession()?.usuario?.id;
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
    if (activeId) {
      await loadThread(activeId);
    }
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
    const visible = conversations.filter((item) => {
      const user = item.usuario || {};
      const hayTexto = [nameOf(user), user.correo || '', item.last_message?.contenido || '']
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return !term || hayTexto.includes(term);
    });

    if (!visible.length) {
      contactList.innerHTML = '<p class="dm-empty">No hay conversaciones para mostrar.</p>';
      return;
    }

    contactList.innerHTML = visible.map((item) => {
      const user = item.usuario || {};
      const fecha = item.updated_at ? new Date(item.updated_at).toLocaleString('es-UY', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '';
      const ultimo = item.last_message?.contenido ? escapeText(item.last_message.contenido) : 'No hay mensajes todavía.';
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

  const loadThread = async (userId) => {
    if (!userId) return;
    activeId = userId;
    renderConversations();
    try {
      const result = await sigturApiFetch(`/api/mensajes?usuario_id=${encodeURIComponent(userId)}`);
      const items = Array.isArray(result) ? result : result.data || [];
      thread.innerHTML = (items || []).map((item) => {
        const isOutgoing = item.remitente_id === currentUserId();
        const stateText = isOutgoing ? (item.leido ? '✓✓ Leído' : '✓ Enviado') : '';
        return `
          <p class="dm-bubble ${isOutgoing ? 'outgoing' : 'incoming'}">
            ${escapeText(item.contenido)}
            <time>${new Date(item.created_at).toLocaleString('es-UY')} ${stateText ? `· ${escapeText(stateText)}` : ''}</time>
          </p>
        `;
      }).join('') || '<p class="dm-empty">No hay mensajes todavía.</p>';
      thread.scrollTop = thread.scrollHeight;
      status.textContent = '';
      await sigturApiFetch('/api/mensajes/leer', { method: 'PATCH', body: JSON.stringify({ usuario_id: userId }) });
      notifyMessagingSync(userId);
      await loadConversations();
    } catch (error) {
      status.textContent = error.message || 'No se pudo abrir la conversación.';
    }
  };


const refreshActiveThread = async () => {
  if (!activeId || document.hidden || refreshing) return;

  refreshing = true;
  try {
    await loadThread(activeId);
  } finally {
    refreshing = false;
  }
};

const refreshMessaging = async () => {
  if (document.hidden) return;

  // Actualiza la lista para detectar conversaciones nuevas.
  await loadConversations();

  // Si hay una conversación abierta, actualiza sus mensajes.
  await refreshActiveThread();
};


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

const refreshTimer = window.setInterval(refreshMessaging, 4000);

document.addEventListener('visibilitychange', refreshMessaging);

window.addEventListener('beforeunload', () => {
  window.clearInterval(refreshTimer);
  document.removeEventListener('visibilitychange', refreshMessaging);
  window.removeEventListener('focus', refreshMessaging);
  messagingBroadcast?.close();
}, { once: true });

  form.addEventListener('submit', async event => {
    event.preventDefault();
    try {
      if (!activeId) throw new Error('Elegí un usuario para iniciar la conversación.');
      const contenido = message.value.trim();
      if (!contenido) throw new Error('Escribí un mensaje antes de enviarlo.');
      await sigturApiFetch('/api/mensajes', {
        method: 'POST',
        body: JSON.stringify({ destinatario_id: activeId, contenido })
      });
      message.value = '';
      notifyMessagingSync(activeId);
      await loadThread(activeId);
      await loadConversations();
    } catch (error) {
      status.textContent = error.message || 'No se pudo enviar el mensaje.';
    }
  });
}

function escapeText(value) {
  const element = document.createElement('span');
  element.textContent = String(value ?? '');
  return element.innerHTML;
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
    dialog.innerHTML = `<form method="dialog" class="tourism-plan-widget"><header><div><p>Planificá tu visita</p><h2>${escapeText(name)}</h2></div><button value="cancel" aria-label="Cerrar">×</button></header><div class="tourism-plan-grid"><label>Fecha preferida<input name="date" type="date" min="${new Date().toISOString().slice(0, 10)}" required></label><label>Personas<select name="people"><option value="1">1 persona</option><option value="2">2 personas</option><option value="3">3 personas</option><option value="4">4 personas</option></select></label></div><fieldset><legend>Horario flexible</legend><div class="reservation-slots"><label><input type="radio" name="schedule" value="Mañana · 09:00–12:00" checked><span>Mañana<small>09:00–12:00</small></span></label><label><input type="radio" name="schedule" value="Tarde · 14:00–18:00"><span>Tarde<small>14:00–18:00</small></span></label><label><input type="radio" name="schedule" value="Flexible · a coordinar"><span>Flexible<small>A coordinar</small></span></label></div></fieldset><div class="tourism-plan-summary"><span>Desde</span><strong>${escapeText(price)}</strong></div><footer><button value="cancel" type="submit">Cancelar</button><button value="confirm" type="submit">Solicitar disponibilidad</button></footer><p class="tourism-plan-status" aria-live="polite"></p></form>`;
    dialog.showModal();
    dialog.addEventListener('close', () => {
      if (dialog.returnValue !== 'confirm') return;
      const values = new FormData(dialog.querySelector('form'));
      if (!values.get('date')) return;
      const key = `sigtur-tourism-plans:${sigturGetSession()?.usuario?.id || 'guest'}`;
      const current = JSON.parse(localStorage.getItem(key) || '[]');
      current.push({ name, date: values.get('date'), people: values.get('people'), schedule: values.get('schedule'), createdAt: new Date().toISOString() });
      localStorage.setItem(key, JSON.stringify(current));
    }, { once: true });
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
  const localOnly = Object.values(cachedPins).filter(pin => !remoteIds.has(String(pin.id))).map(pin => ({ entidad_tipo: 'place', entidad_id: pin.id, created_at: pin.createdAt, pin, localOnly: true }));
  return [...remote, ...localOnly].sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
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
    return `<article class="profile-card">${image}<div><small class="profile-card-kind">${kind}${item.localOnly ? ' · pendiente de sincronizar' : ''}</small><h3>${escapeText(title)}</h3>${pin.direccion ? `<p>${escapeText(pin.direccion)}</p>` : ''}${tags}<p>Guardado el ${new Date(item.created_at).toLocaleDateString('es-UY')}</p><a href="${href}">${action}</a></div></article>`;
  }).join('');
}

function renderProfileReservations(userId) {
  const list = document.getElementById('reservations-list');
  if (!list) return;
  let reservations = {};
  try { reservations = JSON.parse(localStorage.getItem(`sigtur-event-reservations:${userId}`) || localStorage.getItem('sigtur-event-reservations') || '{}'); } catch { /* datos locales inválidos */ }
  let placeReservations = [];
  try { placeReservations = JSON.parse(localStorage.getItem(`sigtur-tourism-plans:${userId}`) || '[]'); } catch { /* datos locales inválidos */ }
  const events = Object.entries(reservations).map(([eventId, reservation]) => ({ type: 'event', id: eventId, ...reservation }));
  const places = placeReservations.map((reservation, index) => ({ type: 'place', id: `place-${index}`, ...reservation }));
  const entries = [...events, ...places].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  list.innerHTML = entries.length
    ? entries.map(reservation => reservation.type === 'event'
      ? `<article class="reservation-card"><div><small>EVENTO</small><strong>${escapeText(reservation.title || 'Evento')}</strong><p>${reservation.quantity || 1} ${Number(reservation.quantity) === 1 ? 'lugar reservado' : 'lugares reservados'} · ${escapeText(reservation.schedule || 'Horario a coordinar')} · ${new Date(reservation.createdAt).toLocaleDateString('es-UY')}</p></div><a href="eventos.html#${encodeURIComponent(reservation.id)}">Ver evento</a></article>`
      : `<article class="reservation-card"><div><small>VISITA / LUGAR</small><strong>${escapeText(reservation.name || 'Experiencia turística')}</strong><p>${escapeText(reservation.date || 'Fecha a coordinar')} · ${reservation.people || 1} ${Number(reservation.people) === 1 ? 'persona' : 'personas'} · ${escapeText(reservation.schedule || 'Horario flexible')}</p></div><a href="turismo.html">Ver turismo</a></article>`).join('')
    : '<p class="profile-empty">Todavía no tenés reservas ni visitas planificadas.</p>';
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
      comment: '<path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5Z"/>',
      save: '<path d="M6 4h12a2 2 0 0 1 2 2v15l-8-5-8 5V6a2 2 0 0 1 2-2Z"/>',
      reserve: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18"/>'
    };
    return `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${paths[name] || paths.culture}</svg>`;
  };
  const categoryIcon = (value) => {
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
  const reservationKey = () => `sigtur-event-reservations:${sigturGetSession()?.usuario?.id || 'guest'}`;
  const readReservations = () => {
    try { return JSON.parse(localStorage.getItem(reservationKey()) || localStorage.getItem('sigtur-event-reservations') || '{}'); } catch { return {}; }
  };
  const saveReservation = (eventId, reservation) => {
    try {
      const reservations = readReservations();
      reservations[eventId] = reservation;
      localStorage.setItem(reservationKey(), JSON.stringify(reservations));
      return true;
    } catch { return false; }
  };
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
      return `<article class="event-comment ${comment.fijado ? 'is-pinned' : ''}" data-comment-id="${escapeHtml(comment.id)}" data-comment-user="${escapeHtml(comment.usuario_id)}"><div class="comment-author">${authorAvatar(comment)}<span><strong>${escapeHtml(authorName(comment))}</strong><small>${comment.autor?.rol === 'admin' ? 'Administrador' : 'Explorador'}${comment.fijado ? ' · 📌 Fijado' : ''}</small></span><time>${new Date(comment.created_at).toLocaleDateString('es-UY')}</time></div><p>${escapeHtml(comment.contenido)}</p><div class="event-comment-actions"><button type="button" data-comment-like>♡ Me gusta</button><button type="button" data-comment-reply>↩ Responder</button><button type="button" data-comment-message>✉ Mensaje</button>${sigturGetSession()?.usuario?.rol === 'admin' ? '<button type="button" data-admin-delete-comment>Eliminar</button>' : ''}</div><div class="event-reply-form" hidden><textarea rows="2" maxlength="2000" placeholder="Responder a ${escapeHtml(authorName(comment))}..."></textarea><button type="button" data-submit-reply>Publicar respuesta</button></div>${replies.length ? `<div class="event-comment-replies"><span>${replies.length} ${replies.length === 1 ? 'respuesta' : 'respuestas'}</span>${replies.map(renderComment).join('')}</div>` : ''}</article>`;
    };
    const roots = sort(byParent.get('root') || []);
    list.innerHTML = roots.length
      ? roots.map(renderComment).join('')
      : '<p class="event-panel-status">Todavía no hay comentarios.</p>';
  };
  const loadComments = async (panel, eventId) => {
    const status = panel.querySelector('[data-event-panel-status]');
    try {
      status.textContent = 'Cargando comentarios...';
      const result = await sigturApiFetch(`/api/comentarios?entidad_tipo=event&entidad_id=${encodeURIComponent(eventId)}`);
      panel._eventComments = result.data || [];
      renderComments(panel, panel._eventComments);
      status.textContent = '';
    } catch (error) {
      status.textContent = error.message || 'No se pudieron cargar los comentarios. Ejecutá migration_interacciones.sql en Supabase.';
    }
  };
  const showLogin = () => { window.location.href = 'login.html'; };
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
    panel.innerHTML = `<div class="event-panel-head"><strong>${escapeHtml(event.title)}</strong><button type="button" class="event-panel-close" data-event-close aria-label="Cerrar panel">×</button></div><div class="event-comments-view"><div class="event-comment-notice">Compartí experiencias útiles y respetá a la comunidad SIGTUR.</div><div class="comment-filter" role="group" aria-label="Ordenar comentarios"><button type="button" data-comment-order="newest" aria-pressed="true">Recientes</button><button type="button" data-comment-order="oldest" aria-pressed="false">Antiguos</button></div><p class="event-panel-status" data-event-panel-status></p><div class="event-comment-list" data-event-comment-list></div><form data-event-comment-form><textarea name="contenido" rows="2" maxlength="2000" placeholder="Sumá un comentario..." required></textarea><button class="event-panel-submit" type="submit">Publicar</button></form></div><div class="event-reservation-view" hidden><p class="event-panel-status" data-reservation-status></p><div class="reservation-widget"><p class="reservation-widget-intro">Elegí la modalidad que mejor se adapte a tu día.</p><label>Cantidad de lugares<select data-reservation-quantity><option value="1">1 lugar</option><option value="2">2 lugares</option><option value="3">3 lugares</option><option value="4">4 lugares</option></select></label><fieldset><legend>Horario de llegada</legend><div class="reservation-slots"><label><input type="radio" name="slot-${escapeHtml(event.id)}" value="Temprano · 18:00" checked><span>Temprano<small>18:00</small></span></label><label><input type="radio" name="slot-${escapeHtml(event.id)}" value="Central · 20:00"><span>Central<small>20:00</small></span></label><label><input type="radio" name="slot-${escapeHtml(event.id)}" value="Flexible · a coordinar"><span>Flexible<small>A coordinar</small></span></label></div></fieldset></div><button class="event-panel-submit" type="button" data-reserve-confirm>Confirmar reserva</button></div>`;
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
          await sigturApiFetch('/api/guardados', { method: 'POST', body: JSON.stringify({ entidad_tipo: 'event', entidad_id: event.id, activo: active }) });
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
        if (!saveReservation(event.id, { title: event.title, quantity, schedule, createdAt: new Date().toISOString() })) throw new Error('No se pudo guardar la reserva en este navegador.');
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
          button.textContent = state.liked ? '♡ Me gusta' : `♥ Me gusta (${state.likes + 1})`;
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
        await sigturApiFetch('/api/comentarios', { method: 'POST', body: JSON.stringify({ entidad_tipo: 'event', entidad_id: event.id, contenido }) });
        form.reset();
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
    window.location.href = 'login.html';
    return;
  }

  form.closest('.utility-grid')?.setAttribute('hidden', '');
  try {
    await sigturApiFetch('/api/auth/es-admin');
  } catch (error) {
    console.error('No se pudo validar el acceso de administrador:', error);
    sigturClearSession();
    window.location.href = 'login.html';
    return;
  }
  form.closest('.utility-grid')?.removeAttribute('hidden');

  const storageKey = 'sigtur-admin-settings';
  const announcementKey = 'sigtur-admin-announcement';
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

  const readJSON = (key, fallback) => {
    try {
      return JSON.parse(localStorage.getItem(key)) || fallback;
    } catch {
      return fallback;
    }
  };

  const log = (message) => {
    if (!activity) return;
    const item = document.createElement('p');
    item.textContent = `${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${message}`;
    activity.prepend(item);
    while (activity.children.length > 4) activity.lastElementChild?.remove();
  };

  const setStatus = (message) => {
    if (!status) return;
    status.textContent = message;
    clearTimeout(setStatus.timer);
    setStatus.timer = setTimeout(() => { status.textContent = 'Guardado local'; }, 1800);
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
    const saved = readJSON(announcementKey, null);
    if (!preview) return;
    preview.textContent = saved?.title ? `${saved.title}: ${saved.body || 'Sin descripcion'}` : 'Sin aviso publicado.';
  };

  applySettings(readJSON(storageKey, defaults));
  updatePreview();
  log('Panel abierto');

  form.addEventListener('change', (event) => {
    const settings = collectSettings();
    localStorage.setItem(storageKey, JSON.stringify(settings));
    setStatus('Cambios guardados');
    const label = event.target?.closest('.settings-item')?.querySelector('strong')?.textContent || 'Ajuste';
    log(`${label} ${event.target.checked ? 'activado' : 'desactivado'}`);
  });

  announcementForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(announcementForm);
    const announcement = {
      title: String(data.get('title') || '').trim(),
      body: String(data.get('body') || '').trim(),
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(announcementKey, JSON.stringify(announcement));
    updatePreview();
    setStatus('Aviso guardado');
    log('Aviso del sitio actualizado');
  });

  clearBtn?.addEventListener('click', () => {
    localStorage.removeItem(announcementKey);
    announcementForm?.reset();
    updatePreview();
    setStatus('Aviso limpiado');
    log('Aviso eliminado');
  });

  // gonza: el export copia el estado actual del admin al portapapeles como JSON.
  // clipboard.writeText también es async porque acceder al portapapeles
  // puede requerir permiso del browser en algunos casos
  exportBtn?.addEventListener('click', async () => {
    const payload = {
      settings: collectSettings(),
      announcement: readJSON(announcementKey, null),
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
    }).join('') || '<li class="admin-event-empty">Todavía no hay eventos publicados.</li>';
    eventsList.querySelectorAll('.admin-event-thumb img').forEach(image => image.addEventListener('error', () => image.remove(), { once: true }));
  };
  const loadAdminEvents = async () => {
    if (!eventsList) return;
    eventsList.innerHTML = '<li class="admin-event-empty">Cargando eventos…</li>';
    try {
      const response = await sigturApiFetch('/api/admin/eventos');
      renderAdminEvents(response.data || []);
    } catch (error) {
      eventsList.innerHTML = `<li class="admin-event-empty">${escapeText(error.message || 'No se pudieron cargar los eventos.')}</li>`;
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
    usersList.innerHTML = users.map(user => `<li><span>${user.nombre || 'Usuario'} · ${user.correo}</span><button type="button" data-ban-user="${user.id}" data-banned="false">Banear 24 h</button></li>`).join('') || '<li>No hay usuarios.</li>';
  };
  try {
    const users = await sigturApiFetch('/api/admin/usuarios');
    renderUsers(users.data || []);
  } catch (error) { showResourceStatus(error.message); }
  try {
    const comments = await sigturApiFetch('/api/admin/comentarios');
    if (commentsList) commentsList.innerHTML = (comments.data || []).map(comment => `<li><span>${comment.fijado ? '📌 ' : ''}${escapeText(comment.contenido.slice(0, 120))}</span><span><button type="button" data-pin-comment="${comment.id}" data-pinned="${Boolean(comment.fijado)}">${comment.fijado ? 'Desfijar' : 'Fijar'}</button><button type="button" data-delete-comment="${comment.id}">Borrar</button></span></li>`).join('') || '<li>No hay comentarios.</li>';
  } catch (error) { showResourceStatus(error.message); }
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
// setupSupportPage() — toda la lógica de soporte.html
// Guarda los tickets en localStorage bajo la key "sigtur-support-tickets"
// y los vuelve a pintar en pantalla cada vez que se crea uno nuevo (ver
// render() acá abajo). Al no haber backend, estos tickets NO le llegan a
// nadie de verdad (no hay ningún email ni notificación), quedan viviendo
// únicamente en el navegador de quien completó el formulario -- el propio
// FAQ de soporte.html ya avisa esto ("guardado en este navegador").
// ============================================================================
function setupSupportPage() {
  const form = document.getElementById('support-form');
  if (!form) return;

  const key = 'sigtur-support-tickets';
  const list = document.getElementById('support-ticket-list');
  const status = document.getElementById('support-status');

  const readTickets = () => {
    try {
      return JSON.parse(localStorage.getItem(key)) || [];
    } catch {
      return [];
    }
  };

  const saveTickets = (tickets) => localStorage.setItem(key, JSON.stringify(tickets));

  const render = () => {
    const tickets = readTickets();
    if (!list) return;
    list.innerHTML = '';
    if (!tickets.length) {
      list.innerHTML = '<p class="empty-state">Todavia no hay tickets creados.</p>';
      return;
    }
    // gonza: slice(0, 5) muestra solo los últimos 5 tickets para no llenar la pantalla
    tickets.slice(0, 5).forEach(ticket => {
      const item = document.createElement('article');
      item.className = 'support-ticket';
      const meta = document.createElement('div');
      const title = document.createElement('strong');
      const author = document.createElement('span');
      const message = document.createElement('p');
      const date = document.createElement('small');
      title.textContent = ticket.topic;
      author.textContent = `${ticket.name} - ${ticket.email}`;
      message.textContent = ticket.message;
      date.textContent = new Date(ticket.createdAt).toLocaleString();
      meta.append(title, author);
      item.append(meta, message, date);
      list.appendChild(item);
    });
  };

  render();

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const ticket = {
      // crypto.randomUUID genera un id único, el fallback es Date.now() para browsers viejos
      id: window.crypto?.randomUUID ? window.crypto.randomUUID() : String(Date.now()),
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
    const tickets = readTickets();
    tickets.unshift(ticket); // unshift agrega al principio (más reciente primero)
    saveTickets(tickets);
    form.reset();
    render();
    if (status) status.textContent = `Ticket #${ticket.id.slice(0, 6)} creado`;
  });
}
