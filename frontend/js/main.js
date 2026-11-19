// Interactividad del sitio. La API y Supabase gestionan los datos persistentes.

function obtenerEnlaceWebEvento(valor) {
  const textoUrl = String(valor ?? '').trim();
  if (!textoUrl) return '';
  try {
    const enlace = new URL(textoUrl, window.location.href);
    return ['http:', 'https:'].includes(enlace.protocol) ? enlace.href : '';
  } catch { return ''; }
}

function analizarMultimediaEvento(valor) {
  const url = obtenerEnlaceWebEvento(valor);
  if (!url) return { tipo: 'ninguno', url: '' };
  const enlace = new URL(url);
  const dominio = enlace.hostname.toLowerCase().replace(/^www\./, '');
  const youtube = dominio === 'youtu.be' || dominio === 'youtube.com' || dominio.endsWith('.youtube.com') || dominio === 'youtube-nocookie.com';
  if (youtube) {
    const id = dominio === 'youtu.be' ? enlace.pathname.split('/').filter(Boolean)[0] : enlace.searchParams.get('v') || enlace.pathname.match(/\/(?:embed|shorts)\/([^/?]+)/)?.[1];
    if (id && /^[\w-]{6,20}$/.test(id)) return { tipo: 'youtube', url: `https://www.youtube-nocookie.com/embed/${id}` };
  }
  if (dominio === 'vimeo.com' || dominio.endsWith('.vimeo.com')) {
    const id = enlace.pathname.match(/\/(?:video\/)?(\d+)/)?.[1];
    if (id) return { tipo: 'vimeo', url: `https://player.vimeo.com/video/${id}` };
  }
  if (/\.(?:mp4|webm|ogg|mov|m4v)$/i.test(enlace.pathname)) return { tipo: 'video', url };
  if (/\.(?:avif|gif|jpe?g|png|webp)$/i.test(enlace.pathname) || /[?&](?:format|fm)=(?:avif|gif|jpe?g|png|webp)/i.test(enlace.search)) return { tipo: 'imagen', url };
  return { tipo: 'enlace', url };
}

// Inicializacion despues de cargar el DOM.
// gonza: esto se ejecuta cuando el HTML terminó de cargar del todo.
// si ponés código acá afuera (fuera del DOMContentLoaded) y el HTML
// todavía no cargó, querySelector va a devolver null y nada va a funcionar.
document.addEventListener('DOMContentLoaded', () => {
  const cuerpo = document.body;

  // guardamos el tema en localStorage para que se acuerde entre páginas
  const temaGuardado = localStorage.getItem('sigtur-theme') || 'light';
  cuerpo.classList.toggle('tema-oscuro', temaGuardado === 'dark');

  // el menú del logo no existe en la pantalla de login, así que lo saltamos
  if (!cuerpo.classList.contains('cuenta-redisenada')) crearMenuLogotipo(temaGuardado);

  configurarPaginaAutenticacion();
  const estadoOAuth = document.getElementById('cuenta-estado');
  const establecerEstadoAutenticacion = (mensaje, tipo = 'ok') => {
    if (!estadoOAuth) return;
    estadoOAuth.textContent = mensaje;
    estadoOAuth.dataset.tipo = tipo;
    estadoOAuth.hidden = !mensaje;
  };
  let fichaAutenticacionAlmacenado = false;
  try { fichaAutenticacionAlmacenado = Boolean(JSON.parse(localStorage.getItem(SIGTUR_CLAVE_SESION) || 'null')?.token); } catch { /* caché inválida */ }
  if (estadoOAuth && fichaAutenticacionAlmacenado && !window.location.hash.includes('access_token')) {
    establecerEstadoAutenticacion('Verificando la sesión guardada...', 'loading');
  }
  procesarRetornoOAuth(establecerEstadoAutenticacion)
    .then(() => validarSesionAlmacenadaSigtur())
    .finally(() => {
      actualizarCuentaMenuLogotipo();
      configurarPaginaAdministracion();
      configurarPaginaPerfil();
      const sesion = obtenerSesionSigtur();
      if (document.querySelector('.cuenta-redisenada') && sesion?.usuario && (!estadoOAuth?.textContent || estadoOAuth.dataset.tipo === 'loading')) {
        establecerEstadoAutenticacion(`Ya iniciaste sesión como ${sesion.usuario.nombre}.`, 'ok');
      } else if (document.querySelector('.cuenta-redisenada') && fichaAutenticacionAlmacenado && !sesion?.usuario && estadoOAuth?.dataset.tipo === 'loading') {
        establecerEstadoAutenticacion('No pudimos verificar la sesión guardada. Iniciá sesión nuevamente.', 'error');
      }
    });
  configurarPaginaSoporte();
  cargarConfiguracionPublica();
  configurarAcordeonesPie();

  // --- HOME (index.html) ---
  if (cuerpo.classList.contains('pagina-inicio')) {
    configurarPlanificacionTuristica();
    configurarInformacionGastronomica();

    // gonza: acá escuchamos el scroll de la ventana. Cuando el usuario
    // baja más de 60px, le agregamos la clase 'scrolled' al navbar para
    // que cambie de estilo (el CSS se encarga del resto).
    const barraNavegacion = document.getElementById('barra-navegacion');
    if (barraNavegacion) window.addEventListener('scroll', () => barraNavegacion.classList.toggle('desplazado', window.scrollY > 60));

    // setupHomeWeather es async (ver abajo), la llamamos sin await
    // porque no necesitamos esperar el clima para que el resto de la página funcione
    configurarClimaInicio();

    // --- CAROUSEL DE EVENTOS (el que está en el medio de la home) ---
    const pista = document.querySelector('.carrusel-pista');
    const diapositivas = document.querySelectorAll('.carrusel-diapositiva');
    const puntosElemento = document.querySelector('.carrusel-puntos');
    const botonAnterior = document.querySelector('.carrusel-boton.anterior');
    const botonSiguiente = document.querySelector('.carrusel-boton.siguiente');

    if (pista && diapositivas.length && puntosElemento) {
      let actual = 0;
      const total = diapositivas.length;
      let temporizadorAutomatico;
      const carrusel = pista.closest('.carrusel');
      const detenerRotacion = () => { clearInterval(temporizadorAutomatico); temporizadorAutomatico = null; };

      // creamos un puntito por cada slide y lo agregamos al DOM
      diapositivas.forEach((_, i) => {
        const punto = document.createElement('button');
        punto.type = 'button';
        punto.className = 'punto' + (i === 0 ? ' activo' : '');
        punto.setAttribute('aria-label', `Mostrar evento ${i + 1}`);
        punto.setAttribute('aria-controls', 'home-event-carousel');
        punto.addEventListener('click', () => irA(i));
        puntosElemento.appendChild(punto);
      });
      diapositivas.forEach((diapositiva, i) => {
        diapositiva.setAttribute('role', 'group');
        diapositiva.setAttribute('aria-roledescription', 'diapositiva');
        diapositiva.setAttribute('aria-label', `${i + 1} de ${total}`);
      });

      function actualizarPuntos() {
        puntosElemento.querySelectorAll('.punto').forEach((punto, i) => {
          punto.classList.toggle('activo', i === actual);
          punto.setAttribute('aria-current', String(i === actual));
          diapositivas[i].setAttribute('aria-hidden', String(i !== actual));
        });
      }

      // gonza: el truco del carrusel es mover el track con translateX.
      // si current=1 y cada slide ocupa 100%, movemos -100% → muestra el slide 2
      function irA(indice) { actual = (indice + total) % total; pista.style.transform = `translateX(-${actual * 100}%)`; actualizarPuntos(); }

      // reseteamos el timer automático cada vez que el usuario clickea una flecha
      function restablecerRotacion() { detenerRotacion(); if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) temporizadorAutomatico = setInterval(() => irA(actual + 1), 4500); }

      botonAnterior?.addEventListener('click', () => { irA(actual - 1); restablecerRotacion(); });
      botonSiguiente?.addEventListener('click', () => { irA(actual + 1); restablecerRotacion(); });
      carrusel?.addEventListener('keydown', evento => {
        if (evento.key === 'ArrowLeft' || evento.key === 'ArrowRight') {
          detenerRotacion();
          irA(actual + (evento.key === 'ArrowRight' ? 1 : -1));
          evento.preventDefault();
        }
      });
      carrusel?.addEventListener('focusin', detenerRotacion);
      carrusel?.addEventListener('mouseenter', detenerRotacion);
      carrusel?.setAttribute('role', 'region');
      carrusel?.setAttribute('aria-roledescription', 'carrusel');
      carrusel?.setAttribute('aria-label', 'Eventos destacados');
      pista.id = 'inicio-evento-carrusel';
      carrusel?.addEventListener('focusout', evento => { if (!carrusel.contains(evento.relatedTarget)) restablecerRotacion(); });
      restablecerRotacion();
    }

    // --- ANIMACIÓN DE ENTRADA DE LAS CARDS ---
    // gonza: IntersectionObserver es una API del browser que avisa
    // cuando un elemento entra en el viewport. Mucho mejor que calcular
    // posición con scroll, no frena la página.
    const elementosRevelar = document.querySelectorAll('.caracteristica-elemento, .alojamiento-tarjeta, .comida-tarjeta, .eventos-izquierda, .carrusel');
    if ('IntersectionObserver' in window) {
      const observadorInterseccion = new IntersectionObserver((entradas) => {
        entradas.forEach(entrada => {
          if (entrada.isIntersecting) {
            entrada.target.classList.add('visible');
            observadorInterseccion.unobserve(entrada.target); // una vez que apareció, dejamos de observarlo
          }
        });
      }, { threshold: 0.12 }); // se activa cuando el 12% del elemento es visible

      elementosRevelar.forEach(elementoDom => {
        elementoDom.style.opacity = '0';
        elementoDom.style.transform = 'translateY(28px)';
        elementoDom.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observadorInterseccion.observe(elementoDom);
      });
    }
  }

  // --- EVENTOS (eventos.html) ---
  if (cuerpo.classList.contains('pagina-eventos')) {
    const pistaDestacada = document.querySelector('.destacado-pista');
    const diapositivasDestacadas = Array.from(document.querySelectorAll('.destacado-pista > .destacado-diapositiva:not([aria-hidden="true"]):not(.estado-clon)'));
    const contenedorPuntos = document.querySelector('.carrusel-seccion .carrusel-puntos');
    const total = diapositivasDestacadas.length;
    let actual = 0;
    let posicion = 0;

    // gonza: FIX loop continuo (11/07/2026) — antes el carrusel llegaba al
    // final y se quedaba con un solo card pegadito, se veía feo. La solucion
    // es clonar las primeras slides y pegarlas al final del track: asi
    // siempre hay cards de sobra para llenar la vista, y cuando el auto-scroll
    // pasa por los clones saltamos al principio real SIN transicion (es invisible
    // para el ojo porque el clon es pixel-a-pixel igual al slide real).
    function cantidadVisible() {
      if (!pistaDestacada || !diapositivasDestacadas.length) return 1;
      const anchoPista = pistaDestacada.parentElement?.getBoundingClientRect().width || pistaDestacada.getBoundingClientRect().width;
      const anchoDiapositiva = diapositivasDestacadas[0].getBoundingClientRect().width || 1;
      return Math.max(1, Math.min(total, Math.round(anchoPista / anchoDiapositiva)));
    }

    function configurarClones() {
      pistaDestacada?.querySelectorAll('.destacado-diapositiva.estado-clon').forEach(elementoDom => elementoDom.remove());
      if (!pistaDestacada || !total) return;
      const cantidad = cantidadVisible();
      for (let i = 0; i < cantidad; i++) {
        const clon = diapositivasDestacadas[i].cloneNode(true);
        clon.classList.add('estado-clon');
        clon.setAttribute('aria-hidden', 'true');
        clon.querySelectorAll('a, button, input').forEach(elementoDom => elementoDom.setAttribute('tabindex', '-1'));
        pistaDestacada.appendChild(clon);
      }
    }

    // gonza: acá calculamos el porcentaje real de cada slide en vez de
    // asumir 33.33%, porque en mobile los slides pueden ser más anchos
    function porcentajeDiapositiva() {
      const primeraDiapositiva = pistaDestacada?.querySelector('.destacado-diapositiva');
      const anchoPista = pistaDestacada?.getBoundingClientRect().width;
      return (primeraDiapositiva && anchoPista)
        ? (primeraDiapositiva.getBoundingClientRect().width / anchoPista) * 100
        : (100 / 3);
    }

    function representar(conTransicion) {
      if (!pistaDestacada) return;
      if (!conTransicion) pistaDestacada.style.transition = 'none';
      pistaDestacada.style.transform = `translateX(-${posicion * porcentajeDiapositiva()}%)`;
      if (!conTransicion) {
        void pistaDestacada.offsetHeight; // fuerza el reflow antes de sacar el "none"
        pistaDestacada.style.transition = '';
      }
    }

    function crearPuntos() {
      if (!contenedorPuntos || !total) return;
      contenedorPuntos.innerHTML = '';
      for (let i = 0; i < total; i++) {
        const botonAccion = document.createElement('button');
        botonAccion.className = 'punto-carrusel' + (i === 0 ? ' activo' : '');
        botonAccion.setAttribute('aria-label', `Slide ${i + 1}`);
        const interno = document.createElement('span');
        interno.className = 'punto-carrusel-interior';
        interno.style.width = i === 0 ? '18px' : '12px';
        interno.style.height = i === 0 ? '18px' : '12px';
        botonAccion.appendChild(interno);
        botonAccion.addEventListener('click', () => irA(i));
        contenedorPuntos.appendChild(botonAccion);
      }
    }

    function actualizarPuntos() {
      document.querySelectorAll('.punto-carrusel').forEach((punto, i) => {
        const interno = punto.querySelector('.punto-carrusel-interior');
        const activo = i === actual;
        punto.classList.toggle('activo', activo);
        if (interno) { interno.style.width = activo ? '18px' : '12px'; interno.style.height = activo ? '18px' : '12px'; }
      });
    }

    // avanza un slide (lo usa el autoplay). Si nos pasamos del ultimo slide
    // real seguimos de largo por los clones, y una vez termina la transicion
    // reseteamos la posicion al slide real sin transicion (salto invisible)
    function siguiente() {
      if (!pistaDestacada || !total) return;
      posicion += 1;
      actual = posicion % total;
      representar(true);
      actualizarPuntos();
      if (posicion >= total) {
        const alFinalizar = () => {
          pistaDestacada.removeEventListener('transitionend', alFinalizar);
          posicion = actual;
          representar(false);
        };
        pistaDestacada.addEventListener('transitionend', alFinalizar);
      }
    }

    // clic directo en un punto: salto simple, sin pasar por los clones
    function irA(indice) {
      if (!pistaDestacada || !total) return;
      actual = (indice + total) % total;
      posicion = actual;
      representar(true);
      actualizarPuntos();
    }

    configurarClones();
    crearPuntos();
    representar(false);

    let temporizadorAutomatico = total ? setInterval(siguiente, 4000) : null;

    // pausamos el auto cuando el mouse está encima, es más cómodo para el usuario
    const carruselDestacado = pistaDestacada?.closest('.destacado-carrusel');
    const detenerRotacionDestacados = () => { clearInterval(temporizadorAutomatico); temporizadorAutomatico = null; };
    const iniciarRotacionDestacados = () => { if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches && !temporizadorAutomatico) temporizadorAutomatico = setInterval(siguiente, 4000); };
    carruselDestacado?.setAttribute('role', 'region');
    carruselDestacado?.setAttribute('aria-roledescription', 'carrusel');
    carruselDestacado?.setAttribute('aria-label', 'Eventos destacados');
    carruselDestacado?.addEventListener('mouseenter', detenerRotacionDestacados);
    carruselDestacado?.addEventListener('focusin', detenerRotacionDestacados);
    carruselDestacado?.addEventListener('keydown', evento => {
      if (evento.key !== 'ArrowLeft' && evento.key !== 'ArrowRight') return;
      detenerRotacionDestacados();
      irA(actual + (evento.key === 'ArrowRight' ? 1 : -1));
      evento.preventDefault();
    });
    carruselDestacado?.addEventListener('mouseleave', () => { if (!carruselDestacado.contains(document.activeElement)) iniciarRotacionDestacados(); });
    carruselDestacado?.addEventListener('focusout', evento => { if (!carruselDestacado.contains(evento.relatedTarget)) iniciarRotacionDestacados(); });
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) detenerRotacionDestacados();

    // recalculamos los clones si cambia el tamaño de pantalla (mobile <-> desktop)
    let temporizadorRedimension;
    window.addEventListener('resize', () => {
      clearTimeout(temporizadorRedimension);
      temporizadorRedimension = setTimeout(() => {
        configurarClones();
        posicion = actual;
        representar(false);
      }, 200);
    });

    // filtro de categorías: muestra/oculta tickets según data-categoria-evento
    const prepararCarruselesEventos = () => {
      document.querySelectorAll('.pagina-eventos .evento-entradas').forEach(lista => {
        if (lista.closest('.evento-carrusel-marco')) return;
        const contenedor = document.createElement('div');
        contenedor.className = 'evento-carrusel-marco';
        const carrusel = document.createElement('div');
        carrusel.className = 'evento-carrusel';
        const botonAnteriorEventos = document.createElement('button');
        botonAnteriorEventos.className = 'evento-carrusel-control';
        botonAnteriorEventos.type = 'button';
        botonAnteriorEventos.setAttribute('aria-label', 'Ver eventos anteriores');
        botonAnteriorEventos.innerHTML = '<span aria-hidden="true">‹</span>';
        const botonSiguienteEventos = document.createElement('button');
        botonSiguienteEventos.className = 'evento-carrusel-control';
        botonSiguienteEventos.type = 'button';
        botonSiguienteEventos.setAttribute('aria-label', 'Ver más eventos');
        botonSiguienteEventos.innerHTML = '<span aria-hidden="true">›</span>';
        const panelesInteraccion = document.createElement('div');
        panelesInteraccion.className = 'evento-interaccion-paneles';
        botonAnteriorEventos.setAttribute('aria-controls', lista.id);
        botonSiguienteEventos.setAttribute('aria-controls', lista.id);
        lista.tabIndex = 0;
        lista.parentNode.insertBefore(contenedor, lista);
        contenedor.append(carrusel, panelesInteraccion);
        carrusel.append(botonAnteriorEventos, lista, botonSiguienteEventos);

        const actualizarControles = () => {
          const hayDesplazamiento = lista.scrollWidth > lista.clientWidth + 2;
          botonAnteriorEventos.disabled = !hayDesplazamiento || lista.scrollLeft <= 2;
          botonSiguienteEventos.disabled = !hayDesplazamiento || lista.scrollLeft + lista.clientWidth >= lista.scrollWidth - 2;
          contenedor.classList.toggle('sin-desplazamiento', !hayDesplazamiento);
        };
        const desplazar = direccion => {
          const tarjeta = lista.querySelector('.entrada-fila:not([style*="display: none"])');
          const separacion = Number.parseFloat(getComputedStyle(lista).gap) || 16;
          const distancia = tarjeta ? tarjeta.getBoundingClientRect().width + separacion : lista.clientWidth * .8;
          lista.scrollBy({ left: direccion * distancia, behavior: 'smooth' });
        };
        botonAnteriorEventos.addEventListener('click', () => desplazar(-1));
        botonSiguienteEventos.addEventListener('click', () => desplazar(1));
        lista.addEventListener('scroll', actualizarControles, { passive: true });
        lista.addEventListener('eventosactualizados', actualizarControles);
        window.addEventListener('resize', actualizarControles);
        actualizarControles();
      });
    };

    document.querySelectorAll('.categoria-tabs').forEach(grupo => {
      const pestanas = grupo.querySelectorAll('.categoria-tab');
      const seccion = grupo.closest('section');
      const identificadorListaPestanas = grupo.id || `category-tabs-${Math.random().toString(36).slice(2)}`;
      grupo.id = identificadorListaPestanas;
      grupo.setAttribute('role', 'tablist');
      grupo.setAttribute('aria-label', 'Filtrar eventos por categoría');
      const lista = grupo.parentElement?.querySelector('.evento-entradas');
      if (lista) { lista.id ||= `${identificadorListaPestanas}-events`; lista.setAttribute('role', 'tabpanel'); lista.setAttribute('aria-labelledby', pestanas[0]?.id || `${identificadorListaPestanas}-tab-0`); }
      pestanas.forEach((tab, indice) => {
        tab.type = 'button'; tab.setAttribute('role', 'tab');
        if (!tab.id) tab.id = `${identificadorListaPestanas}-tab-${indice}`;
        tab.setAttribute('aria-controls', lista?.id || identificadorListaPestanas);
        tab.setAttribute('aria-selected', String(tab.classList.contains('activo')));
        tab.tabIndex = tab.classList.contains('activo') ? 0 : -1;
      });
      pestanas.forEach(tab => {
        tab.addEventListener('click', () => {
          pestanas.forEach(elemento => { elemento.classList.remove('activo'); elemento.setAttribute('aria-selected', 'false'); elemento.tabIndex = -1; });
          tab.classList.add('activo');
          tab.setAttribute('aria-selected', 'true'); tab.tabIndex = 0;
          if (lista) lista.setAttribute('aria-labelledby', tab.id);
          const filtro = tab.dataset.categoriaEvento;
          seccion?.querySelectorAll('.entrada-fila').forEach(fila => {
            const categoriaFila = fila.dataset.categoriaEvento || '';
            const visible = filtro === 'todos' || categoriaFila === filtro;
            fila.style.display = visible ? '' : 'none';
            const panelActual = fila._panelInteraccion || fila.nextElementSibling;
            if (!visible && panelActual?.classList.contains('evento-interaccion-panel')) panelActual.hidden = true;
          });
          lista?.dispatchEvent(new Event('eventosactualizados'));
        });
      });
      grupo.addEventListener('keydown', evento => {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(evento.key)) return;
        const indiceActual = [...pestanas].indexOf(document.activeElement);
        const indiceSiguiente = evento.key === 'Home' ? 0 : evento.key === 'End' ? pestanas.length - 1 : (indiceActual + (evento.key === 'ArrowRight' ? 1 : pestanas.length - 1)) % pestanas.length;
        evento.preventDefault(); pestanas[indiceSiguiente]?.focus(); pestanas[indiceSiguiente]?.click();
      });
    });

    prepararCarruselesEventos();

    // búsqueda en tiempo real: filtra mientras escribís, sin botón de submit
    const entradaBusqueda = document.querySelector('.busqueda-pastilla input');
    entradaBusqueda?.addEventListener('input', () => {
      const consulta = entradaBusqueda.value.toLowerCase().trim();
      document.querySelectorAll('.próximos-seccion .entrada-fila').forEach(fila => {
        const visible = !consulta || fila.textContent.toLowerCase().includes(consulta);
        fila.style.display = visible ? '' : 'none';
        const panelActual = fila._panelInteraccion || fila.nextElementSibling;
        if (!visible && panelActual?.classList.contains('evento-interaccion-panel')) panelActual.hidden = true;
      });
      document.querySelector('.próximos-seccion .evento-entradas')?.dispatchEvent(new Event('eventosactualizados'));
    });

    configurarInteraccionesEventos();
    configurarAccesoRapidoEventosAdministracion();

  }

  // --- TURISMO (turismo.html) ---
  if (cuerpo.classList.contains('pagina-turismo')) {
    configurarPlanificacionTuristica();
    configurarCuriosidadesTuristicas();
  }

  // --- LUGARES (lugares.html) ---
  if (cuerpo.classList.contains('pagina-lugares')) {
    configurarBotonesFavoritos();
  }
  if (cuerpo.classList.contains('pagina-turismo')) configurarBotonesFavoritos();
  if (cuerpo.classList.contains('pagina-inicio')) configurarBotonesFavoritos();
  document.getElementById('contenido-cuadricula')?.addEventListener('click', async evento => {
    const boton = evento.target.closest('[data-eliminar-guardado]'); if (!boton) return;
    boton.disabled = true;
    try { await solicitarApiSigtur('/api/guardados', { method: 'POST', body: JSON.stringify({ entidad_tipo: boton.dataset.guardadoTipo, entidad_id: boton.dataset.eliminarGuardado, activo: false }) }); boton.closest('.perfil-tarjeta')?.remove(); const total = document.getElementById('total-cantidad'), lugares = document.getElementById('siguiendo'); if (total) total.textContent = String(Math.max(0, Number(total.textContent) - 1)); if (lugares && boton.dataset.guardadoTipo === 'place') lugares.textContent = String(Math.max(0, Number(lugares.textContent) - 1)); }
    catch (fallo) { boton.disabled = false; window.alert(fallo.message || 'No se pudo quitar de guardados.'); }
  });

  configurarBusquedaNavegacion();
});

function normalizarTextoBusqueda(valor) {
  return valor.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

function obtenerDestinoBusqueda(valor) {
  const normalizado = normalizarTextoBusqueda(valor);
  return /evento|concierto|feria|agenda|musica|deporte/.test(normalizado) ? 'eventos.html' :
    /hotel|alojamiento|restaurante|comida|gastronomia|sabor|terma|historia/.test(normalizado) ? 'turismo.html' :
    /mapa|ubicacion|llegar|ruta/.test(normalizado) ? 'mapa.html' : 'lugares.html';
}

function navegarBusqueda(valor, destino = obtenerDestinoBusqueda(valor)) {
  const url = new URL(destino, window.location.href);
  url.searchParams.set('q', valor);
  window.location.assign(url);
}

function configurarBusquedaNavegacion() {
  const entradaBusqueda = document.querySelector('.navegacion-busqueda input');
  const consulta = new URLSearchParams(window.location.search).get('q')?.trim();

  const campoBusqueda = entradaBusqueda.closest('.navegacion-busqueda');
  if (!campoBusqueda) return;

  const identificadorLista = 'navbar-search-suggestions';
  const sugerenciaLista = document.createElement('div');
  sugerenciaLista.className = 'navegacion-busqueda-sugerencias';
  sugerenciaLista.id = identificadorLista;
  sugerenciaLista.setAttribute('role', 'listbox');
  sugerenciaLista.setAttribute('aria-label', 'Sugerencias de búsqueda');
  sugerenciaLista.hidden = true;
  campoBusqueda.appendChild(sugerenciaLista);

  entradaBusqueda.setAttribute('role', 'combobox');
  entradaBusqueda.setAttribute('aria-autocomplete', 'list');
  entradaBusqueda.setAttribute('aria-expanded', 'false');
  entradaBusqueda.setAttribute('aria-controls', identificadorLista);

  const sugerencias = [
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
  document.querySelectorAll('.entrada-fila, .lugar-tarjeta, .alojamiento-tarjeta, .restaurante-tarjeta').forEach(elemento => {
    const encabezado = elemento.querySelector('h2, h3, .restaurante-nombre, .alojamiento-nombre');
    const etiqueta = encabezado?.textContent.trim();
    if (etiqueta && !sugerencias.some(sugerencia => normalizarTextoBusqueda(sugerencia.label) === normalizarTextoBusqueda(etiqueta))) {
      const destino = elemento.matches('.entrada-fila') ? 'eventos.html' :
        elemento.matches('.alojamiento-tarjeta, .restaurante-tarjeta') ? 'turismo.html' : 'lugares.html';
      sugerencias.push({ label: etiqueta, query: etiqueta, destination: destino });
    }
  });

  let indiceActivo = -1;
  let sugerenciasVisibles = [];

  function cerrarSugerencias() {
    sugerenciaLista.hidden = true;
    entradaBusqueda.setAttribute('aria-expanded', 'false');
    entradaBusqueda.removeAttribute('aria-activedescendant');
    indiceActivo = -1;
  }

  function representarSugerencias() {
    const normalizado = normalizarTextoBusqueda(entradaBusqueda.value);
    sugerenciaLista.replaceChildren();
    indiceActivo = -1;

    if (!normalizado) {
      cerrarSugerencias();
      return;
    }

    sugerenciasVisibles = sugerencias
      .filter(sugerencia => normalizarTextoBusqueda(sugerencia.label).includes(normalizado))
      .slice(0, 7);

    if (!sugerenciasVisibles.length) {
      cerrarSugerencias();
      return;
    }

    sugerenciasVisibles.forEach((sugerencia, indice) => {
      const opcion = document.createElement('button');
      opcion.type = 'button';
      opcion.className = 'navegacion-busqueda-sugerencia';
      opcion.id = `${identificadorLista}-${indice}`;
      opcion.setAttribute('role', 'option');
      opcion.setAttribute('aria-selected', 'false');
      opcion.textContent = sugerencia.label;
      opcion.addEventListener('pointerdown', evento => evento.preventDefault());
      opcion.addEventListener('click', () => navegarBusqueda(sugerencia.query, sugerencia.destination));
      sugerenciaLista.appendChild(opcion);
    });

    sugerenciaLista.hidden = false;
    entradaBusqueda.setAttribute('aria-expanded', 'true');
  }

  function establecerSugerenciaActiva(indice) {
    if (!sugerenciasVisibles.length) return;
    indiceActivo = (indice + sugerenciasVisibles.length) % sugerenciasVisibles.length;
    sugerenciaLista.querySelectorAll('.navegacion-busqueda-sugerencia').forEach((opcion, indiceOpcion) => {
      const activo = indiceOpcion === indiceActivo;
      opcion.classList.toggle('estado-activo', activo);
      opcion.setAttribute('aria-selected', String(activo));
    });
    entradaBusqueda.setAttribute('aria-activedescendant', `${identificadorLista}-${indiceActivo}`);
  }

  entradaBusqueda.addEventListener('input', representarSugerencias);
  entradaBusqueda.addEventListener('keydown', evento => {
    if (evento.key === 'ArrowDown' && !sugerenciaLista.hidden) {
      evento.preventDefault();
      establecerSugerenciaActiva(indiceActivo + 1);
    } else if (evento.key === 'ArrowUp' && !sugerenciaLista.hidden) {
      evento.preventDefault();
      establecerSugerenciaActiva(indiceActivo < 0 ? sugerenciasVisibles.length - 1 : indiceActivo - 1);
    } else if (evento.key === 'Escape') {
      cerrarSugerencias();
    } else if (evento.key === 'Enter') {
      const sugerencia = indiceActivo >= 0 ? sugerenciasVisibles[indiceActivo] : null;
      const valor = sugerencia?.query || entradaBusqueda.value.trim();
      if (!valor) return;
      evento.preventDefault();
      navegarBusqueda(valor, sugerencia?.destination);
    }
  });
  entradaBusqueda.addEventListener('focus', representarSugerencias);
  document.addEventListener('pointerdown', evento => {
    if (!campoBusqueda.contains(evento.target)) cerrarSugerencias();
  });

  if (!consulta) return;

  const consultaNormalizada = normalizarTextoBusqueda(consulta);
  const terminos = consultaNormalizada
    .replace(/\b(eventos?|conciertos?|ferias?|agenda|musica|deportes?|turismo|turisticos?|alojamientos?|hoteles?|restaurantes?|comida|gastronomia|sabores?|termas?|termal|historia|lugares?|plazas?|parques?|costanera|mapa|ubicacion|llegar|ruta)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (entradaBusqueda) entradaBusqueda.value = consulta;

  let elementos = [];
  if (document.body.classList.contains('pagina-eventos')) {
    const busquedaEventos = document.querySelector('.busqueda-pastilla input');
    if (busquedaEventos) {
      busquedaEventos.value = terminos;
      busquedaEventos.dispatchEvent(new Event('input', { bubbles: true }));
    }
    elementos = Array.from(document.querySelectorAll('.próximos-seccion .entrada-fila'));
  } else if (document.body.classList.contains('pagina-lugares')) {
    elementos = Array.from(document.querySelectorAll('.lugar-tarjeta'));
  } else if (document.body.classList.contains('pagina-turismo')) {
    elementos = Array.from(document.querySelectorAll('.alojamiento-tarjeta, .restaurante-tarjeta'));
  }

  if (terminos && elementos.length) {
    const terminosNormalizados = normalizarTextoBusqueda(terminos);
    elementos.forEach(elemento => {
      elemento.style.display = normalizarTextoBusqueda(elemento.textContent).includes(terminosNormalizados) ? '' : 'none';
    });
  }

  const seccion = /hotel|alojamiento/.test(consultaNormalizada) ? '#alojamientos' :
    /restaurante|comida|gastronomia|sabor/.test(consultaNormalizada) ? '#restaurantes' :
    /historia/.test(consultaNormalizada) ? '#historia' : '';
  if (seccion) document.querySelector(seccion)?.scrollIntoView({ behavior: 'smooth' });
}

// gonza: el footer en mobile se convierte en acordeón para no ocupar tanto espacio.
// cada columna tiene un título clickeable que muestra/oculta la lista de links.
function configurarAcordeonesPie() {
  const piePagina = document.querySelector('.pie-pagina');
  if (!piePagina) return;

  const consultaMovil = window.matchMedia('(max-width: 700px)');
  const columnas = Array.from(piePagina.querySelectorAll('.pie-pagina-columna'));

  columnas.forEach((columna, indice) => {
    const titulo = columna.querySelector('.pie-pagina-columna-titulo');
    const lista = columna.querySelector('ul');
    if (!titulo || !lista || titulo.dataset.accordionReady) return;

    titulo.dataset.accordionReady = 'true';
    titulo.setAttribute('role', 'button');
    titulo.setAttribute('tabindex', '0');
    titulo.setAttribute('aria-expanded', indice === 0 ? 'true' : 'false');
    columna.classList.toggle('estado-abierto', indice === 0); // la primera columna arranca abierta

    const alternar = () => {
      if (!consultaMovil.matches) return; // en desktop no hace nada, todo visible
      const estaAbierto = columna.classList.toggle('estado-abierto');
      titulo.setAttribute('aria-expanded', String(estaAbierto));
    };

    titulo.addEventListener('click', alternar);
    titulo.addEventListener('keydown', (evento) => {
      if (evento.key !== 'Enter' && evento.key !== ' ') return;
      evento.preventDefault();
      alternar();
    });
  });

  const sincronizarModoPie = () => {
    columnas.forEach((columna, indice) => {
      const titulo = columna.querySelector('.pie-pagina-columna-titulo');
      if (consultaMovil.matches) {
        const estaAbierto = indice === 0 ? true : columna.classList.contains('estado-abierto');
        columna.classList.toggle('estado-abierto', estaAbierto);
        titulo?.setAttribute('aria-expanded', String(estaAbierto));
      } else {
        columna.classList.add('estado-abierto');
        titulo?.setAttribute('aria-expanded', 'true');
      }
    });
  };

  sincronizarModoPie();
  consultaMovil.addEventListener?.('change', sincronizarModoPie);
}

// gonza: esto inyecta los estilos de la animación de reveal directamente en el <head>.
// no hace falta un archivo CSS extra para esto, son dos reglas nomás.
const estiloRevelar = document.createElement('style');
estiloRevelar.textContent = '.revealed { opacity: 1 !important; transform: translateY(0) !important; } @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:none; } }';
document.head.appendChild(estiloRevelar);

// el botón de "Cerrar sesión" del menú del logo reusa la pinta de los <a>
// de .logo-menu, pero es un <button> (no navega a ningún lado), asi que
// necesita este reset minimo para no verse como un boton de navegador.
const estiloCerrarSesion = document.createElement('style');
estiloCerrarSesion.textContent = '.logo-menu-account { all: unset; display: block; width: 100%; box-sizing: border-box; cursor: pointer; font: inherit; color: inherit; }';
document.head.appendChild(estiloCerrarSesion);

// menú que aparece al clickear el logo (con links de navegación y toggle de tema)
function crearMenuLogotipo(temaInicial) {
  const logotipo = document.querySelector('.navegacion-logotipo');
  const barraNavegacion = document.querySelector('.barra-navegacion');
  if (!logotipo || !barraNavegacion) return;

  logotipo.setAttribute('aria-haspopup', 'menu');
  logotipo.setAttribute('aria-expanded', 'false');

  // gonza: creamos el div del menú desde JS en vez de tenerlo en el HTML
  // porque así funciona en todas las páginas sin repetir el markup
  const menu = document.createElement('div');
  menu.className = 'logotipo-menu';
  menu.setAttribute('role', 'menu');
  menu.innerHTML = `
    <a href="index.html" role="menuitem">Inicio</a>
    <span data-menu-cuenta></span>
    <a href="admin.html" role="menuitem" data-enlace-administracion hidden>Panel de administración</a>
    <a href="soporte.html" role="menuitem">Soporte</a>
    <button class="tema-interruptor" type="button" role="menuitem" aria-pressed="${temaInicial === 'dark'}">
      <span class="tema-orbita" aria-hidden="true">
        <span class="tema-sol"></span>
        <span class="tema-luna"></span>
      </span>
      <span class="tema-interruptor-texto">${temaInicial === 'dark' ? 'Modo claro' : 'Modo oscuro'}</span>
    </button>
  `;
  logotipo.insertAdjacentElement('afterend', menu);
  representarCuentaMenuLogotipo(menu);

  const botonTema = menu.querySelector('.tema-interruptor');
  const textoTema = menu.querySelector('.tema-interruptor-texto');

  logotipo.addEventListener('click', (evento) => {
    evento.preventDefault();
    const abrir = menu.classList.toggle('abierto');
    logotipo.setAttribute('aria-expanded', String(abrir));
  });

  botonTema?.addEventListener('click', () => {
    const oscuro = !document.body.classList.contains('tema-oscuro');
    document.body.classList.toggle('tema-oscuro', oscuro);
    // guardamos en localStorage para que se acuerde al recargar o cambiar de página
    localStorage.setItem('sigtur-theme', oscuro ? 'dark' : 'light');
    botonTema.setAttribute('aria-pressed', String(oscuro));
    if (textoTema) textoTema.textContent = oscuro ? 'Modo claro' : 'Modo oscuro';
  });

  // cerrar el menú si clickeás en cualquier otro lado
  document.addEventListener('click', (evento) => {
    if (logotipo.contains(evento.target) || menu.contains(evento.target)) return;
    menu.classList.remove('abierto');
    logotipo.setAttribute('aria-expanded', 'false');
  });

  document.addEventListener('keydown', (evento) => {
    if (evento.key !== 'Escape') return;
    menu.classList.remove('abierto');
    logotipo.setAttribute('aria-expanded', 'false');
  });
}

function representarCuentaMenuLogotipo(menu = document.querySelector('.logotipo-menu')) {
  const espacio = menu?.querySelector('[data-menu-cuenta]');
  if (!espacio) return;
  menu.querySelector('[data-enlace-administracion]')?.setAttribute('hidden', '');
  const sesion = obtenerSesionSigtur();
  if (!sesion?.usuario) {
    espacio.innerHTML = '<a href="login.html" role="menuitem">Login / Registro</a>';
    return;
  }
  espacio.innerHTML = `<a href="perfil.html" role="menuitem">Mi perfil (${escaparTexto(sesion.usuario.nombre || 'Usuario')})</a><button class="menu-cuenta-logotipo" type="button" role="menuitem" data-logout>Cerrar sesión</button>`;
  espacio.querySelector('[data-logout]')?.addEventListener('click', async () => {
    await cerrarSesionSigtur();
    window.location.reload();
  });
}

function actualizarCuentaMenuLogotipo() {
  representarCuentaMenuLogotipo();
  document.querySelectorAll('[data-enlace-administracion]').forEach(enlace => { enlace.hidden = true; });
  validarAccesoMenuAdministracion();
}

async function validarAccesoMenuAdministracion() {
  const enlaces = [...document.querySelectorAll('[data-enlace-administracion]')];
  const sesion = obtenerSesionSigtur();
  if (!enlaces.length || !sesion?.token) return;
  try {
    await solicitarApiSigtur('/api/auth/es-admin');
    if (obtenerSesionSigtur()?.token !== sesion.token) return;
    const extension = window.location.pathname.toLowerCase().endsWith('.php') ? 'php' : 'html';
    enlaces.forEach(enlace => {
      const enlaceInterno = enlace.matches('a') ? enlace : enlace.querySelector('a');
      if (enlaceInterno) enlaceInterno.href = `admin.${extension}`;
      enlace.hidden = false;
    });
  } catch {
    enlaces.forEach(enlace => { enlace.hidden = true; });
  }
}

// gonza: esta función es async porque hace un fetch a una API externa (open-meteo).
// fetch devuelve una Promise, y con async/await podemos esperar la respuesta
// sin bloquear el resto de la página. Si algo falla, el catch muestra "--".
// La API de open-meteo es gratis y no necesita key, re copada para prototipos.
async function configurarClimaInicio() {
  const componente = document.querySelector('.clima-widget');
  if (!componente) return;

  const elementoTemporal = componente.querySelector('[data-clima-temp]');
  const elementoDescripcion = componente.querySelector('[data-clima-descripcion]');
  const elementoSensacion = componente.querySelector('[data-clima-feels]');
  const elementoViento = componente.querySelector('[data-clima-wind]');
  const elementoIcono = componente.querySelector('[data-clima-icono]');

  // tabla de códigos WMO → descripción + emoji. la API devuelve un número, nosotros lo traducimos
  const codigos = {
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
    const parametros = new URLSearchParams({
      latitude: '-31.3833',
      longitude: '-57.9667',
      current: 'temperature_2m,apparent_temperature,weather_code,wind_speed_10m',
      timezone: 'America/Montevideo'
    });

    const respuesta = await fetch(`https://api.open-meteo.com/v1/forecast?${parametros.toString()}`);
    if (!respuesta.ok) throw new Error('No se pudo consultar el clima.');
    const datos = await respuesta.json();
    const actual = datos.current || {};
    const [descripcion, icono] = codigos[actual.weather_code] || ['Clima actual', '◐'];

    if (elementoTemporal) elementoTemporal.innerHTML = `${Math.round(actual.temperature_2m)}&deg;`;
    if (elementoDescripcion) elementoDescripcion.textContent = descripcion;
    if (elementoSensacion) elementoSensacion.innerHTML = `${Math.round(actual.apparent_temperature)}&deg;`;
    if (elementoViento) elementoViento.textContent = `${Math.round(actual.wind_speed_10m)} km/h`;
    if (elementoIcono) elementoIcono.textContent = icono;
    componente.classList.add('estado-listo');
  } catch {
    // si la API no responde o hay error de red, mostramos placeholders
    if (elementoTemporal) elementoTemporal.innerHTML = 'Salto';
    if (elementoDescripcion) elementoDescripcion.textContent = 'Clima no disponible';
    if (elementoSensacion) elementoSensacion.textContent = '--';
    if (elementoViento) elementoViento.textContent = '--';
    if (elementoIcono) elementoIcono.textContent = '◐';
  }
}

// Auth conectado al backend real (Express + Supabase, ver backend/app.js
// y backend/rutas/auth_rutas.js). La sesión (token + datos del usuario) se
// cachea en localStorage bajo 'sigtur-session' solo para no tener que
// loguearse de nuevo en cada página, pero la fuente de verdad es siempre
// el backend: el token se manda en el header Authorization de cada fetch.
const raizXampp = window.location.pathname.split('/frontend/html/')[0];
const SIGTUR_ES_SERVIDOR_LOCAL = ['localhost', '127.0.0.1'].includes(window.location.hostname);
const SIGTUR_BASE_XAMPP = SIGTUR_ES_SERVIDOR_LOCAL && raizXampp !== window.location.pathname ? `${window.location.origin}${raizXampp}/frontend/html` : '';
const SIGTUR_URL_SERVIDOR = window.SIGTUR_BACKEND_URL || '';
const SIGTUR_BASE_API = SIGTUR_BASE_XAMPP || SIGTUR_URL_SERVIDOR;
const SIGTUR_CLAVE_SESION = 'sigtur-session';
let SIGTURFICHAVALIDADO = null;
let SIGTUR_PROMESA_RENOVACION = null;
let SIGTUR_TEMPORIZADOR_VENCIMIENTO = null;

function limpiarMensajeAutenticacion(mensaje, alternativa) {
  const texto = String(mensaje || '').trim().slice(0, 240);
  if (!texto) return alternativa;
  if (/token|refresh_token|access_token|authorization|Bearer|secret|api[_ -]?key/i.test(texto)) {
    return alternativa;
  }
  return texto;
}

function obtenerSesionSigtur() {
  try {
    const sesion = JSON.parse(localStorage.getItem(SIGTUR_CLAVE_SESION)) || null;
    if (!sesion?.token) return null;
    const venceEn = Number(sesion.expiresAt || 0);
    const vigente = !venceEn || venceEn > Math.floor(Date.now() / 1000);
    return sesion.token === SIGTURFICHAVALIDADO && vigente ? sesion : { ...sesion, usuario: null, profileValidated: false };
  } catch {
    return null;
  }
}

function guardarSesionSigtur(sesion, perfilValidado = false) {
  if (!sesion?.token) return limpiarSesionSigtur();
  const fichaActual = SIGTURFICHAVALIDADO;
  SIGTURFICHAVALIDADO = perfilValidado && sesion.usuario ? sesion.token : (fichaActual === sesion.token ? fichaActual : null);
  sesion = { ...sesion, profileValidated: Boolean(SIGTURFICHAVALIDADO === sesion.token && sesion.usuario) };
  localStorage.setItem(SIGTUR_CLAVE_SESION, JSON.stringify(sesion));
  clearTimeout(SIGTUR_TEMPORIZADOR_VENCIMIENTO);
  const venceEn = Number(sesion.expiresAt || 0);
  if (sesion.profileValidated && venceEn) {
    SIGTUR_TEMPORIZADOR_VENCIMIENTO = setTimeout(async () => {
      if (!obtenerSesionSigtur()?.refreshToken) {
        limpiarSesionSigtur();
        return;
      }
      const renovado = await renovarSesionSigtur();
      if (!renovado) actualizarCuentaMenuLogotipo();
    }, Math.max(0, venceEn * 1000 - Date.now()));
  }
}

function limpiarSesionSigtur() {
  SIGTURFICHAVALIDADO = null;
  localStorage.removeItem(SIGTUR_CLAVE_SESION);
  actualizarCuentaMenuLogotipo();
}

async function procesarRetornoOAuth(establecerEstado) {
  const parametrosConsulta = new URLSearchParams(window.location.search);
  const parametrosHash = new URLSearchParams(window.location.hash.slice(1));
  const parametros = parametrosHash.has('access_token') || parametrosHash.has('refresh_token') ? parametrosHash : parametrosConsulta;
  const falloOAuth = parametrosConsulta.get('oauth_error') || parametrosHash.get('oauth_error') || parametrosHash.get('error_description') || parametrosHash.get('error');
  const accesoFicha = parametros.get('access_token');
  if (falloOAuth && !accesoFicha) {
    window.history.replaceState({}, document.title, window.location.pathname);
    if (!document.getElementById('cuenta-estado') && window.location.pathname === '/') {
      const urlInicioSesion = new URL('/login.html', window.location.origin);
      urlInicioSesion.searchParams.set('oauth_error', falloOAuth);
      window.location.replace(urlInicioSesion.toString());
      return;
    }
    establecerEstado(limpiarMensajeAutenticacion(falloOAuth, 'No se pudo completar el acceso con Google.'), 'error');
    return;
  }
  if (!accesoFicha) return;

  const sesion = {
    token: accesoFicha,
    refreshToken: parametros.get('refresh_token') || null,
    expiresAt: Number(parametros.get('expires_at') || parametros.get('expires_in')) || null,
  };
  if (sesion.expiresAt && sesion.expiresAt < 1000000000) sesion.expiresAt += Math.floor(Date.now() / 1000);
  guardarSesionSigtur(sesion);
  const destinoAutenticado = obtenerDestinoDespuesAutenticacion();
  const esRecuperacion = parametros.get('type') === 'recovery';
  window.history.replaceState({}, document.title, window.location.pathname);
  establecerEstado(esRecuperacion ? 'Validando el enlace de recuperación...' : 'Validando la sesión de Google...', 'loading');
  try {
    const resultado = await solicitarApiSigtur('/api/auth/me');
    if (!resultado?.usuario?.id || !resultado.usuario.nombre || !resultado.usuario.correo) throw new Error('No se pudo validar el perfil.');
    guardarSesionSigtur({ ...obtenerSesionSigtur(), usuario: resultado.usuario }, true);
    if (esRecuperacion) {
      mostrarFormularioRestablecerContrasena();
      establecerEstado('El enlace fue validado. Elige una contrasena nueva.', 'ok');
      return;
    }
    establecerEstado(`Bienvenido, ${resultado.usuario.nombre}.`, 'ok');
    window.location.replace(destinoAutenticado);
  } catch (fallo) {
    if (fallo.status === 401 || fallo.message === 'No se pudo validar el perfil.') limpiarSesionSigtur();
    establecerEstado(esRecuperacion ? 'El enlace venció o ya fue utilizado. Solicitá uno nuevo.' : 'No pudimos validar la sesión de Google. Intentá nuevamente.', 'error');
  }
}

function obtenerDestinoDespuesAutenticacion() {
  const destinoSolicitado = new URLSearchParams(window.location.search).get('returnTo');
  if (!destinoSolicitado) return 'index.html';
  try {
    const destino = new URL(destinoSolicitado, window.location.origin);
    if (destino.origin !== window.location.origin || /\/login\.(?:html|php)$/i.test(destino.pathname)) return 'index.html';
    return `${destino.pathname}${destino.search}${destino.hash}`;
  } catch {
    return 'index.html';
  }
}

async function cerrarSesionSigtur() {
  try { await solicitarApiSigtur('/api/auth/logout', { method: 'POST' }); } catch { /* La sesión local también debe limpiarse. */ }
  limpiarSesionSigtur();
}

async function cerrarSesionDesdeInterfaz() {
  await cerrarSesionSigtur();
  window.location.replace('login.html');
}

async function renovarSesionSigtur() {
  if (SIGTUR_PROMESA_RENOVACION) return SIGTUR_PROMESA_RENOVACION;
  SIGTUR_PROMESA_RENOVACION = (async () => {
    const sesionActual = obtenerSesionSigtur();
    if (!sesionActual?.refreshToken) return null;
    try {
      const destinoActualizacion = SIGTUR_BASE_XAMPP
        ? `${SIGTUR_BASE_XAMPP}/api/auth.php?action=refresh`
        : `${SIGTUR_URL_SERVIDOR}/api/auth/refresh`;
      const respuesta = await fetch(destinoActualizacion, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: sesionActual.refreshToken }),
      });
      const sesionRenovada = await respuesta.json().catch(() => null);
      if (!respuesta.ok || !sesionRenovada?.token || !sesionRenovada?.usuario?.id) {
        let sesionMasReciente = null;
        try { sesionMasReciente = JSON.parse(localStorage.getItem(SIGTUR_CLAVE_SESION) || 'null'); } catch { /* almacenamiento local inválido */ }
        if (sesionMasReciente?.token && sesionMasReciente.refreshToken && sesionMasReciente.refreshToken !== sesionActual.refreshToken) return obtenerSesionSigtur();
        if (respuesta.status === 400 || respuesta.status === 401) limpiarSesionSigtur();
        return null;
      }
      guardarSesionSigtur({ ...sesionActual, ...sesionRenovada }, true);
      return obtenerSesionSigtur();
    } catch {
      return null;
    } finally {
      SIGTUR_PROMESA_RENOVACION = null;
    }
  })();
  return SIGTUR_PROMESA_RENOVACION;
}

async function solicitarApiSigtur(ruta, opciones = {}, reintentoTrasRenovacion = false) {
  let sesion = obtenerSesionSigtur();
  const esRenovacion = ruta === '/api/auth/refresh';
  const esEntradaAutenticacion = ['/api/auth/login', '/api/auth/register', '/api/auth/recuperar', '/api/auth/password'].includes(ruta);
  if (!reintentoTrasRenovacion && !esRenovacion && !esEntradaAutenticacion && sesion?.token) {
    const venceEn = Number(sesion.expiresAt || 0);
    if (venceEn && venceEn <= Math.floor(Date.now() / 1000) + 30) {
      const renovado = await renovarSesionSigtur();
      sesion = renovado || obtenerSesionSigtur();
    }
  }

  const encabezados = { 'Content-Type': 'application/json', ...(opciones.headers || {}) };
  if (sesion?.token) encabezados.Authorization = `Bearer ${sesion.token}`;
  const esAutenticacionXampp = SIGTUR_BASE_API.endsWith('/frontend/html') && ruta.startsWith('/api/auth/');
  const esActualizacionPerfil = ruta === '/api/auth/me' && String(opciones.method || 'GET').toUpperCase() === 'PATCH';
  const esActualizacionContrasena = ruta === '/api/auth/password';
  const esInteraccionXampp = SIGTUR_BASE_API.endsWith('/frontend/html') && /^(\/api\/(guardados|likes|comentarios|mensajes|reservas|admin))/.test(ruta);
  const esRutaBackendXampp = SIGTUR_BASE_API.endsWith('/frontend/html') && /^\/api\/(eventos|companias|mapa)/.test(ruta);
  const destino = esAutenticacionXampp && !esActualizacionPerfil
    ? `${SIGTUR_BASE_API}/api/auth.php?action=${encodeURIComponent(ruta.slice('/api/auth/'.length))}`
    : esInteraccionXampp || esRutaBackendXampp || esActualizacionPerfil || esActualizacionContrasena || esRenovacion
      ? `${SIGTUR_URL_SERVIDOR}${ruta}`
      : `${SIGTUR_BASE_API}${ruta}`;
  let respuesta;
  try {
    respuesta = await fetch(destino, { ...opciones, headers: encabezados });
  } catch (causa) {
    console.error(`Error de red al llamar a ${destino}`, causa);
    throw new Error('No se pudo conectar al servidor. Verifica la URL publica del backend.');
  }
  let datosEnviados = null;
  try { datosEnviados = await respuesta.json(); } catch { /* Empty response. */ }

  if (respuesta.status === 401 && !reintentoTrasRenovacion && !esRenovacion && sesion?.refreshToken) {
    const sesionRenovada = await renovarSesionSigtur();
    if (sesionRenovada) return solicitarApiSigtur(ruta, opciones, true);
  }
  if (!respuesta.ok) {
    if (respuesta.status === 401 && sesion?.token) limpiarSesionSigtur();
    throw Object.assign(new Error(datosEnviados?.error || 'Ocurrió un error inesperado. Intentá de nuevo.'), { status: respuesta.status });
  }
  return datosEnviados;
}

window.sigturSolicitarApi = solicitarApiSigtur;
window.sigturObtenerSesion = obtenerSesionSigtur;

async function validarSesionAlmacenadaSigtur() {
  const sesion = obtenerSesionSigtur();
  const venceEn = Number(sesion?.expiresAt || 0);
  if (!sesion?.token || (sesion.token === SIGTURFICHAVALIDADO && (!venceEn || venceEn > Math.floor(Date.now() / 1000) + 30))) return;
  try {
    const resultado = await solicitarApiSigtur('/api/auth/me');
    if (!resultado?.usuario?.id || !resultado.usuario.nombre || !resultado.usuario.correo) throw new Error('No se pudo validar el perfil.');
    guardarSesionSigtur({ ...obtenerSesionSigtur(), usuario: resultado.usuario }, true);
  } catch (fallo) {
    if (fallo.status === 401 || fallo.message === 'No se pudo validar el perfil.') limpiarSesionSigtur();
  }
}

window.addEventListener('storage', evento => {
  if (evento.key !== SIGTUR_CLAVE_SESION) return;
  SIGTURFICHAVALIDADO = null;
  if (!evento.newValue) {
    actualizarCuentaMenuLogotipo();
    const estadoAutenticacion = document.getElementById('cuenta-estado');
    if (estadoAutenticacion) { estadoAutenticacion.hidden = true; estadoAutenticacion.textContent = ''; }
    if (document.querySelector('.perfil-pagina') || document.getElementById('administracion-ajustes-formulario')) window.location.reload();
    return;
  }
  validarSesionAlmacenadaSigtur().finally(() => {
    actualizarCuentaMenuLogotipo();
    const sesion = obtenerSesionSigtur();
    const estadoAutenticacion = document.getElementById('cuenta-estado');
    if (estadoAutenticacion && sesion?.usuario) {
      estadoAutenticacion.textContent = `Ya iniciaste sesión como ${sesion.usuario.nombre}.`;
      estadoAutenticacion.dataset.tipo = 'ok';
      estadoAutenticacion.hidden = false;
    }
  });
});

function iniciarSesionGoogle(boton) {
  if (boton) boton.disabled = true;

  const url = SIGTUR_BASE_XAMPP
    ? `${SIGTUR_BASE_XAMPP}/api/auth.php?action=google`
    : `${SIGTUR_URL_SERVIDOR}/api/auth/google`;

  window.location.href = url;
}

function configurarPaginaAutenticacion() {
  const paginaAutenticacion = document.querySelector('.cuenta-redisenada');
  if (!paginaAutenticacion) return;

  const pestanas = document.querySelectorAll('[data-cuenta-tab]');
  const paneles = document.querySelectorAll('[data-cuenta-panel]');
  const estado = document.getElementById('cuenta-estado');
  const formularioInicioSesion = document.getElementById('acceso-formulario');
  const formularioRegistro = document.getElementById('registro-formulario');
  const formularioRecuperacion = document.getElementById('recovery-formulario');
  const formularioRestablecerContrasena = document.getElementById('contrasena-reset-formulario');

  const establecerEstado = (mensaje, tipo = 'ok') => {
    if (!estado) return;
    estado.textContent = mensaje;
    estado.dataset.tipo = tipo;
    estado.hidden = !mensaje;
  };

  const establecerOcupado = (formulario, ocupado, mensajeCarga = '') => {
    const botonEnviar = formulario?.querySelector('.cuenta-enviar');
    if (botonEnviar) {
      botonEnviar.disabled = ocupado;
      botonEnviar.dataset.busy = ocupado ? 'true' : 'false';
      botonEnviar.textContent = ocupado && mensajeCarga ? mensajeCarga : botonEnviar.dataset.defaultLabel || botonEnviar.textContent;
    }
    if (ocupado && mensajeCarga) {
      establecerEstado(mensajeCarga, 'loading');
    }
  };

  const activarPestana = (nombre) => {
    formularioRecuperacion?.toggleAttribute('hidden', true);
    formularioRestablecerContrasena?.toggleAttribute('hidden', true);
    formularioRestablecerContrasena?.classList.remove('activo');
    formularioInicioSesion?.toggleAttribute('hidden', nombre !== 'login');
    formularioRegistro?.toggleAttribute('hidden', nombre !== 'register');
    pestanas.forEach(tab => tab.removeAttribute('hidden'));
    pestanas.forEach(tab => {
      const activo = tab.dataset.cuentaTab === nombre;
      tab.classList.toggle('activo', activo);
      tab.setAttribute('aria-selected', String(activo));
      tab.tabIndex = activo ? 0 : -1;
    });
    paneles.forEach(panelActual => panelActual.classList.toggle('activo', panelActual.dataset.cuentaPanel === nombre));
    establecerEstado('');
  };

  document.querySelectorAll('.cuenta-enviar').forEach(botonAccion => {
    botonAccion.dataset.defaultLabel = botonAccion.textContent.trim();
  });

  document.querySelectorAll('[data-contrasena-alternar]').forEach(boton => {
    boton.addEventListener('click', () => {
      const entrada = document.getElementById(boton.dataset.contrasenaAlternar);
      if (!entrada) return;
      const tipoSiguiente = entrada.type === 'password' ? 'text' : 'password';
      entrada.type = tipoSiguiente;
      boton.textContent = tipoSiguiente === 'password' ? 'Mostrar' : 'Ocultar';
      boton.setAttribute('aria-label', tipoSiguiente === 'password' ? 'Mostrar contraseña' : 'Ocultar contraseña');
      entrada.focus();
    });
  });

  // si ya hay sesión guardada, lo avisamos en vez de mostrar los forms como si nada
  const sesionExistente = obtenerSesionSigtur();
  if (sesionExistente?.usuario) {
    establecerEstado(`Ya iniciaste sesión como ${sesionExistente.usuario.nombre}. Podés cerrar sesión desde el menú del logo.`, 'ok');
  }

  pestanas.forEach(tab => {
    tab.addEventListener('click', () => activarPestana(tab.dataset.cuentaTab));
  });
      pestanas.forEach((tab, indice) => tab.addEventListener('keydown', evento => {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(evento.key)) return;
        const destino = evento.key === 'Home' ? 0 : evento.key === 'End' ? pestanas.length - 1 : (indice + (evento.key === 'ArrowRight' ? 1 : pestanas.length - 1)) % pestanas.length;
        evento.preventDefault(); pestanas[destino].focus(); activarPestana(pestanas[destino].dataset.cuentaTab);
      }));

  formularioRegistro?.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    const datos = new FormData(formularioRegistro);
    const nombre = String(datos.get('name') || '').trim();
    const correo = String(datos.get('email') || '').trim().toLowerCase();
    const contrasena = String(datos.get('password') || '');
    const expresionCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!nombre) {
      establecerEstado('Ingresá tu nombre para continuar.', 'error');
      formularioRegistro.querySelector('[name="name"]').focus();
      return;
    }

    if (!expresionCorreo.test(correo)) {
      establecerEstado('Ingresá un correo válido. Ejemplo: nombre@dominio.com', 'error');
      formularioRegistro.querySelector('[name="email"]').focus();
      return;
    }

    if (contrasena.length < 8) {
      establecerEstado('La contraseña debe tener al menos 8 caracteres.', 'error');
      formularioRegistro.querySelector('[name="password"]').focus();
      return;
    }

    establecerOcupado(formularioRegistro, true, 'Creando tu cuenta...');
    try {
      const resultado = await solicitarApiSigtur('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ nombre, correo, password: contrasena })
      });
      if (resultado.pending) {
        establecerEstado(resultado.message || 'Cuenta creada. Revisá tu correo para confirmar la cuenta.', 'ok');
        formularioRegistro.reset();
        activarPestana('login');
        return;
      }
      guardarSesionSigtur(resultado, true);
      establecerEstado(`Cuenta creada. Sesión iniciada como ${resultado.usuario.nombre}.`, 'ok');
      formularioRegistro.reset();
      window.location.href = obtenerDestinoDespuesAutenticacion();
    } catch (fallo) {
      establecerEstado(limpiarMensajeAutenticacion(fallo.message, 'No se pudo crear la cuenta. Intentá nuevamente.'), 'error');
    } finally {
      establecerOcupado(formularioRegistro, false);
    }
  });

  formularioInicioSesion?.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    const datos = new FormData(formularioInicioSesion);
    const correo = String(datos.get('user') || '').trim().toLowerCase();
    const contrasena = String(datos.get('password') || '');
    const expresionCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!correo) {
      establecerEstado('Ingresá tu correo para continuar.', 'error');
      formularioInicioSesion.querySelector('[name="user"]').focus();
      return;
    }

    if (!expresionCorreo.test(correo)) {
      establecerEstado('Ingresá un correo válido. Revisá el formato.', 'error');
      formularioInicioSesion.querySelector('[name="user"]').focus();
      return;
    }

    if (!contrasena) {
      establecerEstado('Ingresá tu contraseña.', 'error');
      formularioInicioSesion.querySelector('[name="password"]').focus();
      return;
    }

    establecerOcupado(formularioInicioSesion, true, 'Iniciando sesión...');
    try {
      const resultado = await solicitarApiSigtur('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ correo, password: contrasena })
      });
      guardarSesionSigtur(resultado, true);
      establecerEstado(`Bienvenido de nuevo, ${resultado.usuario.nombre}.`, 'ok');
      formularioInicioSesion.reset();
      window.location.href = obtenerDestinoDespuesAutenticacion();
    } catch (fallo) {
      establecerEstado(limpiarMensajeAutenticacion(fallo.message, 'No se pudo iniciar sesión. Revisá tus datos e intentá nuevamente.'), 'error');
    } finally {
      establecerOcupado(formularioInicioSesion, false);
    }
  });

  // Google se completa en el backend para no exponer credenciales sensibles.
  document.querySelectorAll('[data-cuenta-proveedor]').forEach(boton => {
    boton.addEventListener('click', () => {
      const proveedor = boton.dataset.cuentaProveedor;
      if (proveedor === 'Google') {
        establecerEstado('Redirigiendo a Google para continuar...', 'loading');
        iniciarSesionGoogle(boton);
        return;
      }
      establecerEstado(`La opción de ${proveedor} aún no está disponible en este entorno. Podés seguir con Google o tu correo.`, 'info');
    });
  });

  document.querySelectorAll('[data-cuenta-mensaje]').forEach(boton => {
    boton.addEventListener('click', () => {
      if (boton.dataset.cuentaMensaje !== 'recuperar') return establecerEstado(boton.dataset.cuentaMensaje, 'info');
      formularioInicioSesion?.toggleAttribute('hidden', true);
      formularioRegistro?.toggleAttribute('hidden', true);
      formularioRecuperacion?.toggleAttribute('hidden', false);
      formularioInicioSesion?.classList.remove('activo');
      formularioRegistro?.classList.remove('activo');
      formularioRecuperacion?.classList.add('activo');
      establecerEstado('Escribe tu correo y te enviaremos un enlace de recuperación.', 'info');
    });
  });

  formularioRecuperacion?.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    const correo = String(new FormData(formularioRecuperacion).get('email') || '').trim().toLowerCase();
    const expresionCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!expresionCorreo.test(correo)) {
      establecerEstado('Ingresá un correo válido para recuperar tu contraseña.', 'error');
      formularioRecuperacion.querySelector('[name="email"]').focus();
      return;
    }

    establecerOcupado(formularioRecuperacion, true, 'Enviando enlace...');
    try {
      const resultado = await solicitarApiSigtur('/api/auth/recuperar', {
        method: 'POST',
        body: JSON.stringify({ correo })
      });
      establecerEstado(resultado.message, 'ok');
      formularioRecuperacion.reset();
    } catch (fallo) {
      establecerEstado(limpiarMensajeAutenticacion(fallo.message, 'No se pudo enviar el enlace. Intentá nuevamente.'), 'error');
    } finally {
      establecerOcupado(formularioRecuperacion, false);
    }
  });

  formularioRestablecerContrasena?.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    const datos = new FormData(formularioRestablecerContrasena);
    const contrasena = String(datos.get('password') || '');
    const confirmacion = String(datos.get('password_confirmation') || '');
    if (contrasena.length < 8) return establecerEstado('La contraseña debe tener al menos 8 caracteres.', 'error');
    if (contrasena !== confirmacion) return establecerEstado('Las contraseñas no coinciden.', 'error');
    if (!obtenerSesionSigtur()?.token) return establecerEstado('Solicitá un enlace nuevo para cambiar la contraseña.', 'error');
    establecerOcupado(formularioRestablecerContrasena, true, 'Actualizando contraseña...');
    try {
      await solicitarApiSigtur('/api/auth/password', { method: 'PATCH', body: JSON.stringify({ password: contrasena }) });
      await cerrarSesionSigtur();
      formularioRestablecerContrasena.reset();
      formularioRestablecerContrasena.hidden = true;
      formularioRestablecerContrasena.classList.remove('activo');
      pestanas.forEach(tab => tab.removeAttribute('hidden'));
      activarPestana('login');
      establecerEstado('Contraseña actualizada. Ya puedes iniciar sesión.', 'ok');
    } catch (fallo) {
      establecerEstado(limpiarMensajeAutenticacion(fallo.message, 'No se pudo cambiar la contraseña. Solicitá un enlace nuevo.'), 'error');
    } finally {
      establecerOcupado(formularioRestablecerContrasena, false);
    }
  });

  document.getElementById('recovery-cancel')?.addEventListener('click', () => {
    formularioRecuperacion?.toggleAttribute('hidden', true);
    formularioInicioSesion?.toggleAttribute('hidden', false);
    formularioRecuperacion?.classList.remove('activo');
    formularioInicioSesion?.classList.add('activo');
    establecerEstado('');
  });
}

function mostrarFormularioRestablecerContrasena() {
  const restablecer = document.getElementById('contrasena-reset-formulario');
  if (!restablecer) return;
  document.querySelectorAll('[data-cuenta-panel]').forEach(panelActual => {
    panelActual.hidden = true;
    panelActual.classList.remove('activo');
  });
  document.querySelectorAll('[data-cuenta-tab]').forEach(tab => tab.hidden = true);
  restablecer.hidden = false;
  restablecer.classList.add('activo');
}

async function configurarPaginaPerfil() {
  const paginaPerfil = document.querySelector('.perfil-pagina');
  if (!paginaPerfil) return;
  paginaPerfil.setAttribute('aria-busy', 'true');

  const sesion = obtenerSesionSigtur();
  if (!sesion?.token) {
    const extension = window.location.pathname.toLowerCase().endsWith('.php') ? 'php' : 'html';
    window.location.replace(`login.${extension}`);
    return;
  }

  try {
    const resultado = await solicitarApiSigtur('/api/auth/me');
    const usuario = resultado.usuario;
    if (!usuario?.id || !usuario.nombre || !usuario.correo) throw new Error('No se pudo validar el perfil de la cuenta.');
    guardarSesionSigtur({ ...sesion, usuario }, true);
    paginaPerfil.setAttribute('aria-busy', 'false');

    const nombre = usuario.nombre || usuario.correo?.split('@')[0] || 'Usuario';
    const iniciales = nombre.trim().split(/\s+/).slice(0, 2).map(parte => parte[0]).join('').toUpperCase();
    representarIdentidadPerfil(usuario, iniciales || '?');
    document.getElementById('rol-etiquetas').innerHTML = `<span class="etiqueta">${usuario.rol === 'admin' ? 'Administrador' : 'Explorador'}</span>`;
    document.getElementById('seguidores').textContent = 'Activa';
    configurarEditorPerfil(usuario);
    await representarReservasPerfil(usuario.id);

    try {
      const guardado = await solicitarApiSigtur('/api/guardados');
      const lugaresGuardados = await completarLugaresGuardados(guardado.data || [], usuario.id);
      document.getElementById('total-cantidad').textContent = lugaresGuardados.length;
      document.getElementById('siguiendo').textContent = lugaresGuardados.filter(elemento => elemento.entidad_tipo === 'place').length;
      representarCuadriculaPerfil(lugaresGuardados);
    } catch (fallo) {
      const cuadricula = document.getElementById('contenido-cuadricula');
      if (cuadricula) cuadricula.innerHTML = `<p class="interfaz-lista-estado estado-error" role="alert">${escaparTexto(fallo.message || 'No se pudieron cargar tus lugares guardados. Intentá nuevamente.')}</p>`;
    }
    configurarMensajeria();
  } catch (fallo) {
    paginaPerfil.setAttribute('aria-busy', 'false');
    if (!obtenerSesionSigtur()?.token) {
      window.location.replace('login.html');
    } else {
      const titulo = document.getElementById('perfil-titulo');
      if (titulo) titulo.textContent = fallo.message || 'No se pudo cargar el perfil. Intentá nuevamente.';
    }
    return;
  }

  document.querySelector('[data-perfil-logout]')?.addEventListener('click', cerrarSesionDesdeInterfaz);
}

function representarIdentidadPerfil(usuario, iniciales) {
  const nombre = usuario.nombre || usuario.correo?.split('@')[0] || 'Usuario';
  const avatar = document.getElementById('avatar');
  if (avatar) avatar.innerHTML = usuario.avatar_url ? `<img src="${escaparTexto(usuario.avatar_url)}" alt="">` : escaparTexto(iniciales);
  document.getElementById('perfil-titulo').textContent = nombre;
  document.getElementById('bio').textContent = usuario.biografia || usuario.ubicacion || usuario.correo || 'Explorador de Salto';
}

function configurarEditorPerfil(usuarioInicial) {
  const editor = document.querySelector('[data-perfil-editor]');
  const disparador = document.querySelector('[data-perfil-editar]');
  const formulario = document.getElementById('perfil-editar-formulario');
  const entrada = document.getElementById('perfil-avatar-entrada');
  const vistaPrevia = document.getElementById('perfil-avatar-vista-previa');
  const estado = document.querySelector('[data-perfil-editor-estado]');
  if (!editor || !disparador || !formulario || !entrada || !vistaPrevia) return;
  let urlAvatar = usuarioInicial.avatar_url || '';
  const dibujarVistaPrevia = () => { vistaPrevia.innerHTML = urlAvatar ? `<img src="${escaparTexto(urlAvatar)}" alt="">` : escaparTexto((usuarioInicial.nombre || '?').slice(0, 1).toUpperCase()); };
  formulario.nombre.value = usuarioInicial.nombre || '';
  formulario.ubicacion.value = usuarioInicial.ubicacion || '';
  formulario.biografia.value = usuarioInicial.biografia || '';
  formulario.sitio_web.value = usuarioInicial.sitio_web || '';
  dibujarVistaPrevia();
  disparador.addEventListener('click', () => { editor.hidden = false; editor.scrollIntoView({ behavior: 'smooth', block: 'start' }); });
  editor.querySelector('[data-perfil-editar-cancel]').addEventListener('click', () => {
    formulario.nombre.value = usuarioInicial.nombre || '';
    formulario.ubicacion.value = usuarioInicial.ubicacion || '';
    formulario.biografia.value = usuarioInicial.biografia || '';
    formulario.sitio_web.value = usuarioInicial.sitio_web || '';
    entrada.value = '';
    urlAvatar = usuarioInicial.avatar_url || '';
    dibujarVistaPrevia();
    editor.hidden = true;
    estado.textContent = '';
  });
  entrada.addEventListener('change', () => {
    const archivo = entrada.files?.[0];
    if (!archivo) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(archivo.type) || archivo.size > 1_000_000) { estado.textContent = 'Elegí una imagen JPG, PNG o WebP de hasta 1 MB.'; entrada.value = ''; return; }
    const lector = new FileReader();
    lector.onload = () => { urlAvatar = String(lector.result); dibujarVistaPrevia(); estado.textContent = ''; };
    lector.onerror = () => { estado.textContent = 'No se pudo leer la imagen.'; };
    lector.readAsDataURL(archivo);
  });
  formulario.addEventListener('submit', async evento => {
    evento.preventDefault();
    const enviar = formulario.querySelector('[type="submit"]');
    const valores = Object.fromEntries(new FormData(formulario));
    try {
      enviar.disabled = true; estado.textContent = 'Guardando cambios...';
      const resultado = await solicitarApiSigtur('/api/auth/me', { method: 'PATCH', body: JSON.stringify({ ...valores, avatar_url: urlAvatar }) });
      const sesion = obtenerSesionSigtur();
      guardarSesionSigtur({ ...sesion, usuario: resultado.usuario }, true);
      usuarioInicial = resultado.usuario; urlAvatar = resultado.usuario.avatar_url || '';
      const iniciales = (resultado.usuario.nombre || '?').split(/\s+/).slice(0, 2).map(parte => parte[0]).join('').toUpperCase();
      representarIdentidadPerfil(resultado.usuario, iniciales);
      estado.textContent = 'Perfil actualizado.';
    } catch (fallo) { estado.textContent = fallo.message || 'No se pudo guardar el perfil.'; }
    finally { enviar.disabled = false; }
  });
}

async function configurarMensajeria() {
  const selectorContactos = document.getElementById('mensaje-directo-contacto');
  const listaContactos = document.getElementById('mensaje-directo-contacto-lista');
  const busquedaContactos = document.getElementById('mensaje-directo-contacto-busqueda');
  const hilo = document.getElementById('mensaje-directo-hilo-lista');
  const formulario = document.getElementById('mensaje-directo-formulario');
  const mensaje = document.getElementById('mensaje-directo-mensaje');
  const estado = document.getElementById('mensaje-directo-estado');
  const botonGrabar = document.getElementById('mensaje-directo-grabar');
  const estadoGrabacion = document.getElementById('mensaje-directo-grabando-estado');
  const vistaPreviaAudio = document.getElementById('mensaje-directo-audio-vista-previa');
  const reproduccionAudio = document.getElementById('mensaje-directo-audio-playback');
  const botonDescartarAudio = document.getElementById('mensaje-directo-audio-discard');
  const botonEnviarAudio = document.getElementById('mensaje-directo-audio-enviar');
  const botonAdjunto = document.getElementById('mensaje-directo-adjuntar');
  const entradaAdjunto = document.getElementById('mensaje-directo-adjunto-entrada');
  const adjuntoEstado = document.getElementById('mensaje-directo-adjunto-estado');
  const vistaPreviaAdjunto = document.getElementById('mensaje-directo-adjunto-vista-previa');
  const etiquetaContactoActivo = document.getElementById('mensaje-directo-activo-contacto');
  const botonLimpiarArchivos = document.getElementById('mensaje-directo-cleanup-files');
  const botonEnviarTexto = formulario?.querySelector('.mensaje-directo-enviar-texto');
  if (!selectorContactos || !hilo || !formulario) return;

  botonLimpiarArchivos?.addEventListener('click', async () => {
    if (!window.confirm('Se eliminarán de tu almacenamiento los archivos y audios sin uso que tengan más de 30 días. ¿Continuar?')) return;
    botonLimpiarArchivos.disabled = true;
    try { const eliminado = await solicitarApiSigtur('/api/mensajes/archivos-antiguos', { method: 'DELETE' }); estado.textContent = `Limpieza terminada: ${eliminado.audio} audios y ${eliminado.attachments} adjuntos eliminados.`; }
    catch (fallo) { estado.textContent = fallo.message || 'No se pudo limpiar el almacenamiento.'; }
    finally { botonLimpiarArchivos.disabled = false; }
  });

  let contactos = [];
  let conversaciones = [];
  let activoIdentificador = '';
  let actualizando = false;
  let difusionMensajes = null;
  let grabadorMultimedia = null;
  let flujoGrabacion = null;
  let fragmentosGrabacion = [];
  let grabacionIniciadaEn = 0;
  let temporizadorGrabacion = null;
  let audioGrabado = null;
  let duracionAudioGrabado = 0;
  let urlObjetoAudio = '';
  let enviandoAudio = false;
  let enviandoMensaje = false;
  let adjuntosPendientes = [];
  let urlsVistaPreviaAdjuntos = [];
  const segundosMaximosAudio = 120;
  const bytesMaximosAudio = 10 * 1024 * 1024;
  const adjuntosMaximos = 3;
  const bytesMaximosAdjunto = 10 * 1024 * 1024;
  const tiposAdjuntosAceptados = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']);

  const formatearDuracionAudio = segundos => `${Math.floor(segundos / 60)}:${String(segundos % 60).padStart(2, '0')}`;
  const tipoMimeGrabador = () => [
    'audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/ogg', 'audio/mp4',
  ].find(tipo => window.MediaRecorder?.isTypeSupported?.(tipo)) || '';
  const restablecerVistaPreviaAudio = () => {
    if (urlObjetoAudio) URL.revokeObjectURL(urlObjetoAudio);
    urlObjetoAudio = '';
    audioGrabado = null;
    duracionAudioGrabado = 0;
    reproduccionAudio?.pause();
    if (reproduccionAudio) reproduccionAudio.removeAttribute('src');
    if (vistaPreviaAudio) vistaPreviaAudio.hidden = true;
    if (botonEnviarAudio) botonEnviarAudio.disabled = true;
    if (botonGrabar) {
      botonGrabar.disabled = false;
      botonGrabar.classList.remove('estado-grabando');
      botonGrabar.setAttribute('aria-pressed', 'false');
      botonGrabar.innerHTML = '<span aria-hidden="true">🎙</span> Grabar audio';
    }
    if (estadoGrabacion) estadoGrabacion.textContent = 'El audio dura hasta 2 minutos.';
  };

  const etiquetaTamanoArchivo = bytes => bytes < 1024
    ? `${bytes} B`
    : bytes < 1024 * 1024
      ? `${Math.round(bytes / 1024)} KB`
      : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  const representarAdjuntosMensaje = adjuntos => {
    if (!Array.isArray(adjuntos) || !adjuntos.length) return '';
    return `<div class="mensaje-directo-mensaje-adjuntos">${adjuntos.map(archivo => {
      const url = escaparTexto(archivo.url || '#');
      const nombre = escaparTexto(archivo.name || (archivo.mime === 'application/pdf' ? 'Documento PDF' : 'Imagen adjunta'));
      return archivo.mime?.startsWith('image/')
        ? `<a class="mensaje-directo-archivo-imagen" href="${url}" target="_blank" rel="noopener noreferrer"><img src="${url}" alt="${nombre}" loading="lazy"><span>${nombre}</span></a>`
        : `<a class="mensaje-directo-archivo-documento" href="${url}" target="_blank" rel="noopener noreferrer"><span class="mensaje-directo-archivo-icono" aria-hidden="true">PDF</span><span><strong>${nombre}</strong><small>${etiquetaTamanoArchivo(Number(archivo.size) || 0)} · Abrir documento</small></span></a>`;
    }).join('')}</div>`;
  };
  const representarAdjuntosPendientes = () => {
    (urlsVistaPreviaAdjuntos || []).forEach(URL.revokeObjectURL);
    urlsVistaPreviaAdjuntos = [];
    if (!vistaPreviaAdjunto) return;
    vistaPreviaAdjunto.replaceChildren();
    adjuntosPendientes.forEach((archivo, indice) => {
      const elemento = document.createElement('div');
      elemento.className = 'mensaje-directo-pendiente-archivo';
      if (archivo.type.startsWith('image/')) {
        const imagen = document.createElement('img');
        imagen.src = URL.createObjectURL(archivo);
        imagen.alt = `Vista previa: ${archivo.name}`;
        urlsVistaPreviaAdjuntos.push(imagen.src);
        elemento.appendChild(imagen);
      } else {
        const icono = document.createElement('span');
        icono.className = 'mensaje-directo-archivo-icono';
        icono.textContent = 'PDF';
        elemento.appendChild(icono);
      }
      const nombre = document.createElement('span');
      nombre.className = 'mensaje-directo-pendiente-archivo-nombre';
      nombre.textContent = `${archivo.name} · ${etiquetaTamanoArchivo(archivo.size)}`;
      const quitar = document.createElement('button');
      quitar.type = 'button';
      quitar.className = 'mensaje-directo-eliminar-archivo';
      quitar.setAttribute('aria-label', `Quitar ${archivo.name}`);
      quitar.textContent = '×';
      quitar.addEventListener('click', () => {
        adjuntosPendientes.splice(indice, 1);
        representarAdjuntosPendientes();
      });
      elemento.append(nombre, quitar);
      vistaPreviaAdjunto.appendChild(elemento);
    });
    if (adjuntoEstado) {
      adjuntoEstado.textContent = adjuntosPendientes.length
        ? `${adjuntosPendientes.length} de ${adjuntosMaximos} archivos listos para enviar.`
        : 'JPG, PNG, WebP, GIF o PDF · hasta 3 archivos de 10 MB';
    }
  };
  const limpiarAdjuntosPendientes = () => {
    adjuntosPendientes = [];
    if (entradaAdjunto) entradaAdjunto.value = '';
    representarAdjuntosPendientes();
  };
  const agregarPendienteAdjuntos = archivos => {
    const elegido = [...archivos];
    const restante = adjuntosMaximos - adjuntosPendientes.length;
    const valido = elegido.filter(archivo => tiposAdjuntosAceptados.has(archivo.type) && archivo.size > 0 && archivo.size <= bytesMaximosAdjunto);
    const aceptado = valido.slice(0, Math.max(restante, 0));
    adjuntosPendientes.push(...aceptado);
    representarAdjuntosPendientes();
    if (elegido.some(archivo => !tiposAdjuntosAceptados.has(archivo.type) || archivo.size === 0 || archivo.size > bytesMaximosAdjunto)) {
      estado.textContent = 'Adjuntá JPG, PNG, WebP, GIF o PDF de hasta 10 MB cada uno.';
    } else if (aceptado.length < elegido.length) {
      estado.textContent = `Podés adjuntar hasta ${adjuntosMaximos} archivos por mensaje.`;
    }
  };

  const identificadorUsuarioActual = () => obtenerSesionSigtur()?.usuario?.id;
  const establecerCompositorHabilitado = habilitado => {
    if (mensaje) mensaje.disabled = !habilitado || enviandoMensaje || enviandoAudio;
    if (botonGrabar && grabadorMultimedia?.state !== 'recording' && !enviandoAudio && !enviandoMensaje) botonGrabar.disabled = !habilitado;
    if (botonEnviarTexto) botonEnviarTexto.disabled = !habilitado || enviandoMensaje || enviandoAudio;
    if (botonAdjunto) botonAdjunto.disabled = !habilitado || enviandoMensaje || enviandoAudio;
    if (entradaAdjunto) entradaAdjunto.disabled = !habilitado || enviandoMensaje || enviandoAudio;
  };
  const notificarSincronizacionMensajes = (usuarioIdentificador = null) => {
    const datosEnviados = { type: 'messaging-sync', userId: usuarioIdentificador, ts: Date.now() };
    if ('BroadcastChannel' in window) {
      const canal = new BroadcastChannel('sigtur-mensajes');
      canal.postMessage(datosEnviados);
      canal.close();
    }
    try {
      localStorage.setItem('sigtur-mensajes-sync', JSON.stringify(datosEnviados));
    } catch {
      // sin almacenamiento persistente no hay problema
    }
  };

  const gestionarSincronizacionMensajes = async (evento) => {
    const datosEnviados = evento?.data || (evento?.key === 'sigtur-mensajes-sync' ? JSON.parse(evento.newValue || 'null') : null);
    if (!datosEnviados || !datosEnviados.ts) return;
    await cargarConversaciones();
    if (activoIdentificador) await cargarHilo(activoIdentificador, { actualizarConversaciones: false });
  };
  const nombreDe = usuario => `${usuario.nombre || 'Usuario'}${usuario.apellido ? ` ${usuario.apellido}` : ''}`;
  const inicialesDe = usuario => {
    const nombre = nombreDe(usuario).trim();
    return nombre ? nombre.split(/\s+/).slice(0, 2).map(parte => parte[0]).join('').toUpperCase() : '?';
  };

  const representarContactos = () => {
    selectorContactos.innerHTML = '<option value="">Elegí un usuario</option>' + contactos.map(usuario => `<option value="${escaparTexto(usuario.id)}">${escaparTexto(nombreDe(usuario))} · ${escaparTexto(usuario.correo)}</option>`).join('');
  };

  const representarConversaciones = () => {
    if (!listaContactos) return;
    const termino = (busquedaContactos?.value || '').trim().toLowerCase();
    const coincideTermino = (usuario, vistaPrevia = '') => {
      const hayTexto = [nombreDe(usuario), usuario.correo || '', vistaPrevia].filter(Boolean).join(' ').toLowerCase();
      return !termino || hayTexto.includes(termino);
    };
    const visible = conversaciones.filter((elemento) => {
      const usuario = elemento.usuario || {};
      return coincideTermino(usuario, elemento.last_message?.contenido || '');
    });
    const identificadoresConversacion = new Set(conversaciones.map(elemento => elemento.usuario_id));
    if (termino) {
      contactos.filter(usuario => !identificadoresConversacion.has(usuario.id) && coincideTermino(usuario))
        .forEach(usuario => visible.push({ usuario_id: usuario.id, usuario: usuario, isNew: true }));
    }
    const activoContacto = contactos.find(usuario => usuario.id === activoIdentificador);
    if (activoContacto && !identificadoresConversacion.has(activoIdentificador) && !visible.some(elemento => elemento.usuario_id === activoIdentificador)) {
      visible.unshift({ usuario_id: activoIdentificador, usuario: activoContacto, isNew: true });
    }

    if (!visible.length) {
      listaContactos.innerHTML = termino
        ? '<p class="mensaje-directo-vacio">No encontramos usuarios ni conversaciones con ese nombre.</p>'
        : '<p class="mensaje-directo-vacio">Todavía no hay conversaciones. Buscá un usuario para iniciar una.</p>';
      return;
    }

    listaContactos.innerHTML = visible.map((elemento) => {
      const usuario = elemento.usuario || {};
      const fecha = elemento.updated_at ? new Date(elemento.updated_at).toLocaleString('es-UY', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '';
      const ultimo = elemento.last_message?.tipo === 'audio'
        ? '🎙 Mensaje de voz'
        : elemento.last_message?.tipo === 'archivo'
          ? '📎 Archivo adjunto'
        : elemento.last_message?.contenido ? escaparTexto(elemento.last_message.contenido) : elemento.isNew ? 'Iniciar chat · se entrega al reconectar' : 'No hay mensajes todavía.';
      const noLeido = Number(elemento.unread_count || 0);
      const activo = elemento.usuario_id === activoIdentificador ? 'estado-activo' : '';
      return `
        <button type="button" class="mensaje-directo-conversacion ${activo}" data-mensaje-directo-usuario="${escaparTexto(elemento.usuario_id)}">
          <span class="mensaje-directo-avatar">${escaparTexto(inicialesDe(usuario))}</span>
          <span class="mensaje-directo-conversacion-cuerpo">
            <strong>${escaparTexto(nombreDe(usuario))}</strong>
            <small>${ultimo}</small>
          </span>
          <span class="mensaje-directo-metadatos">
            <time>${escaparTexto(fecha)}</time>
            ${noLeido ? `<span class="mensaje-directo-insignia">${noLeido}</span>` : ''}
          </span>
        </button>
      `;
    }).join('');
  };

  const cargarConversaciones = async () => {
    try {
      const resultado = await solicitarApiSigtur('/api/mensajes/conversaciones');
      conversaciones = Array.isArray(resultado) ? resultado : resultado.data || [];
      representarConversaciones();
    } catch (fallo) {
      estado.textContent = fallo.message || 'No se pudieron cargar las conversaciones.';
    }
  };

  const cargarHilo = async (usuarioIdentificador, { desplazarAlFinal = false, actualizarConversaciones = true } = {}) => {
    if (!usuarioIdentificador) return;
    if (activoIdentificador && activoIdentificador !== usuarioIdentificador && grabadorMultimedia?.state === 'recording') { estado.textContent = 'Detené la grabación antes de cambiar de conversación.'; return; }
    if (activoIdentificador && activoIdentificador !== usuarioIdentificador && (audioGrabado || adjuntosPendientes.length) && !window.confirm('Tenés una grabación o archivos sin enviar. Si cambiás de conversación, se descartarán. ¿Continuar?')) return;
    const conversacionCambiada = activoIdentificador !== usuarioIdentificador;
    const estabaCercaDelFinal = hilo.scrollHeight - hilo.scrollTop - hilo.clientHeight < 80;
    if (activoIdentificador !== usuarioIdentificador) {
      restablecerVistaPreviaAudio();
      limpiarAdjuntosPendientes();
    }
    activoIdentificador = usuarioIdentificador;
    const activoContacto = contactos.find(usuario => usuario.id === usuarioIdentificador)
      || conversaciones.find(entrada => entrada.usuario_id === usuarioIdentificador)?.usuario;
    if (etiquetaContactoActivo) etiquetaContactoActivo.textContent = activoContacto ? nombreDe(activoContacto) : 'Conversación';
    establecerCompositorHabilitado(true);
    representarConversaciones();
    try {
      const resultado = await solicitarApiSigtur(`/api/mensajes?usuario_id=${encodeURIComponent(usuarioIdentificador)}`);
      const elementos = Array.isArray(resultado) ? resultado : resultado.data || [];
      if (activoIdentificador !== usuarioIdentificador) return;
      hilo.innerHTML = (elementos || []).map((elemento) => {
        const esSaliente = elemento.remitente_id === identificadorUsuarioActual();
        const textoEstado = esSaliente ? (elemento.leido ? '✓✓ Leído' : '✓ Enviado') : '';
        const contenidoPrincipal = elemento.tipo === 'audio' && elemento.audio_url
          ? `<div class="mensaje-directo-audio-mensaje"><span><span aria-hidden="true">🎙</span> Mensaje de voz · ${formatearDuracionAudio(Number(elemento.duration_seconds) || 0)}</span><audio controls preload="none" src="${escaparTexto(elemento.audio_url)}" aria-label="Reproducir mensaje de voz"></audio></div>`
          : `${elemento.tipo !== 'archivo' && elemento.contenido ? `<p class="mensaje-directo-mensaje-texto">${escaparTexto(elemento.contenido)}</p>` : ''}${representarAdjuntosMensaje(elemento.attachments)}`;
        return `
          <article class="mensaje-directo-burbuja ${esSaliente ? 'saliente' : 'entrante'} ${elemento.tipo === 'audio' ? 'mensaje-directo-burbuja-audio' : ''}" data-mensaje-id="${escaparTexto(elemento.id)}">
            ${contenidoPrincipal}
            <time>${new Date(elemento.created_at).toLocaleString('es-UY')} ${textoEstado ? `· ${escaparTexto(textoEstado)}` : ''}</time>
            ${esSaliente ? '<button type="button" data-eliminar-mensaje>Eliminar mensaje</button>' : ''}
          </article>
        `;
      }).join('') || '<p class="mensaje-directo-vacio">No hay mensajes todavía.</p>';
      if (desplazarAlFinal || conversacionCambiada || estabaCercaDelFinal) hilo.scrollTop = hilo.scrollHeight;
      estado.textContent = '';
      if (elementos.some(elemento => elemento.destinatario_id === identificadorUsuarioActual() && !elemento.leido)) {
        await solicitarApiSigtur('/api/mensajes/leer', { method: 'PATCH', body: JSON.stringify({ usuario_id: usuarioIdentificador }) });
        notificarSincronizacionMensajes(usuarioIdentificador);
      }
      if (actualizarConversaciones) await cargarConversaciones();
    } catch (fallo) {
      estado.textContent = fallo.message || 'No se pudo abrir la conversación.';
    }
  };

  hilo.addEventListener('click', async evento => {
    const boton = evento.target.closest('[data-eliminar-mensaje]');
    if (!boton) return;
    const burbuja = boton.closest('[data-mensaje-id]');
    if (!burbuja || !window.confirm('¿Eliminar este mensaje y sus archivos adjuntos?')) return;
    boton.disabled = true;
    try { await solicitarApiSigtur(`/api/mensajes/${encodeURIComponent(burbuja.dataset.mensajeId)}`, { method: 'DELETE' }); await cargarHilo(activoIdentificador); }
    catch (fallo) { boton.disabled = false; estado.textContent = fallo.message || 'No se pudo eliminar el mensaje.'; }
  });


const actualizarHiloActivo = async () => {
  const estaReproduciendoAudio = [...hilo.querySelectorAll('audio')].some(reproductor => !reproductor.paused);
  if (!activoIdentificador || document.hidden || actualizando || enviandoAudio || grabadorMultimedia?.state === 'recording' || estaReproduciendoAudio) return;

  actualizando = true;
  try {
    await cargarHilo(activoIdentificador, { actualizarConversaciones: false });
  } finally {
    actualizando = false;
  }
};

const actualizarMensajeria = async () => {
  if (document.hidden) return;

  // La lista de conversaciones cambia con menor frecuencia que el hilo activo.
  const ahora = Date.now();
  if (ahora - ultimaActualizacionConversacion >= 60000) {
    ultimaActualizacionConversacion = ahora;
    await cargarConversaciones();
  }

  // Si hay una conversación abierta, actualiza sus mensajes.
  await actualizarHiloActivo();
};

let ultimaActualizacionConversacion = Date.now();


  try {
    estado.textContent = 'Cargando usuarios…';
    const resultado = await solicitarApiSigtur('/api/mensajes/usuarios');
    contactos = Array.isArray(resultado) ? resultado : resultado.data || [];
    representarContactos();
    await cargarConversaciones();
    estado.textContent = contactos.length ? 'Elegí una conversación para empezar.' : 'No hay otros usuarios registrados para contactar.';
  } catch (fallo) {
    estado.textContent = fallo.message || 'No se pudieron cargar los usuarios.';
  }

  selectorContactos.addEventListener('change', () => {
    const tieneValor = selectorContactos.value;
    if (tieneValor) {
      cargarHilo(tieneValor);
    }
  });

  listaContactos?.addEventListener('click', evento => {
    const boton = evento.target.closest('[data-mensaje-directo-usuario]');
    if (!boton) return;
    const usuarioIdentificador = boton.dataset.mensajeDirectoUsuario;
    selectorContactos.value = usuarioIdentificador;
    cargarHilo(usuarioIdentificador);
  });

  busquedaContactos?.addEventListener('input', representarConversaciones);

  botonAdjunto?.addEventListener('click', () => entradaAdjunto?.click());
  entradaAdjunto?.addEventListener('change', () => {
    const elegido = [...(entradaAdjunto.files || [])];
    entradaAdjunto.value = '';
    agregarPendienteAdjuntos(elegido);
  });
  mensaje?.addEventListener('keydown', evento => {
    if (evento.key !== 'Enter' || evento.shiftKey || evento.isComposing) return;
    evento.preventDefault();
    if (botonEnviarTexto && !botonEnviarTexto.disabled) formulario.requestSubmit();
  });
  mensaje?.addEventListener('paste', evento => {
    const archivos = [...(evento.clipboardData?.items || [])]
      .filter(elemento => elemento.kind === 'file')
      .map(elemento => elemento.getAsFile())
      .filter(Boolean);
    if (!archivos.length) return;
    evento.preventDefault();
    agregarPendienteAdjuntos(archivos);
  });
  formulario.addEventListener('dragover', evento => {
    if ([...(evento.dataTransfer?.items || [])].some(elemento => elemento.kind === 'file')) {
      evento.preventDefault();
      formulario.classList.add('estado-destino-soltar');
    }
  });
  formulario.addEventListener('dragleave', evento => {
    if (!formulario.contains(evento.relatedTarget)) formulario.classList.remove('estado-destino-soltar');
  });
  formulario.addEventListener('drop', evento => {
    formulario.classList.remove('estado-destino-soltar');
    const archivos = [...(evento.dataTransfer?.files || [])];
    if (!archivos.length) return;
    evento.preventDefault();
    agregarPendienteAdjuntos(archivos);
  });

  if ('BroadcastChannel' in window) {
    difusionMensajes = new BroadcastChannel('sigtur-mensajes');
    difusionMensajes.addEventListener('message', gestionarSincronizacionMensajes);
  }
  window.addEventListener('storage', (evento) => {
    if (evento.key === 'sigtur-mensajes-sync') {
      gestionarSincronizacionMensajes(evento);
    }
  });


window.addEventListener('focus', actualizarMensajeria);

const temporizadorActualizacion = window.setInterval(actualizarMensajeria, 15000);

document.addEventListener('visibilitychange', actualizarMensajeria);

  botonGrabar?.addEventListener('click', async () => {
    if (grabadorMultimedia?.state === 'recording') {
      grabadorMultimedia.stop();
      return;
    }
    if (!activoIdentificador) {
      estado.textContent = 'Elegí una conversación antes de grabar un audio.';
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      estado.textContent = 'Este navegador no permite grabar audio. Podés enviar mensajes de texto.';
      return;
    }

    restablecerVistaPreviaAudio();
    if (botonGrabar) {
      botonGrabar.disabled = true;
      botonGrabar.textContent = 'Solicitando micrófono…';
    }
    try {
      flujoGrabacion = await navigator.mediaDevices.getUserMedia({ audio: true });
      const tipoMime = tipoMimeGrabador();
      grabadorMultimedia = new MediaRecorder(flujoGrabacion, tipoMime ? { mimeType: tipoMime } : undefined);
      fragmentosGrabacion = [];
      grabacionIniciadaEn = Date.now();
      grabadorMultimedia.addEventListener('dataavailable', evento => {
        if (evento.data?.size) fragmentosGrabacion.push(evento.data);
      });
      grabadorMultimedia.addEventListener('stop', () => {
        window.clearInterval(temporizadorGrabacion);
        temporizadorGrabacion = null;
        flujoGrabacion?.getTracks().forEach(pista => pista.stop());
        flujoGrabacion = null;
        const duracion = Math.max(1, Math.min(segundosMaximosAudio, Math.ceil((Date.now() - grabacionIniciadaEn) / 1000)));
        const archivoBinario = new Blob(fragmentosGrabacion, { type: grabadorMultimedia?.mimeType || tipoMime || 'audio/webm' });
        grabadorMultimedia = null;
        fragmentosGrabacion = [];
        botonGrabar?.classList.remove('estado-grabando');
        botonGrabar?.setAttribute('aria-pressed', 'false');
        if (botonGrabar) {
          botonGrabar.disabled = false;
          botonGrabar.innerHTML = '<span aria-hidden="true">🎙</span> Grabar audio';
        }
        if (!archivoBinario.size || archivoBinario.size > bytesMaximosAudio) {
          estado.textContent = archivoBinario.size ? 'La grabación supera el límite de 10 MB. Intentá hacerla más corta.' : 'No se capturó audio. Volvé a intentarlo.';
          restablecerVistaPreviaAudio();
          return;
        }
        audioGrabado = archivoBinario;
        duracionAudioGrabado = duracion;
        urlObjetoAudio = URL.createObjectURL(archivoBinario);
        if (reproduccionAudio) reproduccionAudio.src = urlObjetoAudio;
        if (vistaPreviaAudio) vistaPreviaAudio.hidden = false;
        if (botonEnviarAudio) botonEnviarAudio.disabled = false;
        if (estadoGrabacion) estadoGrabacion.textContent = `Grabación lista · ${formatearDuracionAudio(duracion)}. Podés escucharla antes de enviarla.`;
      }, { once: true });

      grabadorMultimedia.start(250);
      botonGrabar.disabled = false;
      botonGrabar.classList.add('estado-grabando');
      botonGrabar.setAttribute('aria-pressed', 'true');
      botonGrabar.innerHTML = '<span aria-hidden="true">■</span> Detener grabación';
      if (estadoGrabacion) estadoGrabacion.textContent = 'Grabando · 0:00';
      temporizadorGrabacion = window.setInterval(() => {
        const tiempoTranscurrido = Math.floor((Date.now() - grabacionIniciadaEn) / 1000);
        if (estadoGrabacion) estadoGrabacion.textContent = `Grabando · ${formatearDuracionAudio(tiempoTranscurrido)}`;
        if (tiempoTranscurrido >= segundosMaximosAudio && grabadorMultimedia?.state === 'recording') grabadorMultimedia.stop();
      }, 1000);
    } catch (fallo) {
      flujoGrabacion?.getTracks().forEach(pista => pista.stop());
      flujoGrabacion = null;
      grabadorMultimedia = null;
      estado.textContent = fallo.name === 'NotAllowedError'
        ? 'Permití el acceso al micrófono para grabar audio.'
        : fallo.message || 'No se pudo iniciar la grabación.';
      restablecerVistaPreviaAudio();
    }
  });

  botonDescartarAudio?.addEventListener('click', () => {
    restablecerVistaPreviaAudio();
    estado.textContent = 'Grabación descartada.';
  });

  botonEnviarAudio?.addEventListener('click', async () => {
    if (!activoIdentificador || !audioGrabado || enviandoAudio) return;
    const identificadorDestinatario = activoIdentificador;
    const audio = audioGrabado;
    const duracion = duracionAudioGrabado;
    try {
      if (!obtenerSesionSigtur()?.token) throw new Error('Iniciá sesión para enviar un mensaje de voz.');
      enviandoAudio = true;
      botonEnviarAudio.disabled = true;
      estado.textContent = 'Subiendo audio…';
      const tipoMime = audio.type.split(';')[0] || 'audio/webm';
      const cargado = await solicitarApiSigtur('/api/mensajes/audio', {
        method: 'POST',
        headers: { 'Content-Type': tipoMime },
        body: audio,
      });
      await solicitarApiSigtur('/api/mensajes', {
        method: 'POST',
        body: JSON.stringify({
          destinatario_id: identificadorDestinatario,
          tipo: 'audio',
          audio_path: cargado.path,
          duration_seconds: duracion,
        }),
      });
      restablecerVistaPreviaAudio();
      estado.textContent = 'Mensaje guardado. El destinatario lo verá cuando vuelva a conectarse.';
      notificarSincronizacionMensajes(identificadorDestinatario);
      await cargarHilo(identificadorDestinatario, { scrollToBottom: true });
    } catch (fallo) {
      estado.textContent = fallo.message || 'No se pudo enviar el audio.';
      if (botonEnviarAudio) botonEnviarAudio.disabled = false;
    } finally {
      enviandoAudio = false;
    }
  });

window.addEventListener('beforeunload', evento => {
  if (audioGrabado || adjuntosPendientes.length || grabadorMultimedia?.state === 'recording') { evento.preventDefault(); evento.returnValue = ''; return; }
  window.clearInterval(temporizadorActualizacion);
  window.clearInterval(temporizadorGrabacion);
  flujoGrabacion?.getTracks().forEach(pista => pista.stop());
  if (urlObjetoAudio) URL.revokeObjectURL(urlObjetoAudio);
  document.removeEventListener('visibilitychange', actualizarMensajeria);
  window.removeEventListener('focus', actualizarMensajeria);
  difusionMensajes?.close();
}, { once: true });

  const subirAdjuntosPendientes = async () => {
    const archivosSubidos = [];
    for (let indice = 0; indice < adjuntosPendientes.length; indice += 1) {
      const archivo = adjuntosPendientes[indice];
      if (!tiposAdjuntosAceptados.has(archivo.type) || !archivo.size || archivo.size > bytesMaximosAdjunto) {
        throw new Error('Adjuntá JPG, PNG, WebP, GIF o PDF de hasta 10 MB cada uno.');
      }
      if (adjuntoEstado) adjuntoEstado.textContent = `Subiendo archivo ${indice + 1} de ${adjuntosPendientes.length}…`;
      const cargado = await solicitarApiSigtur('/api/mensajes/adjuntos', {
        method: 'POST',
        headers: { 'Content-Type': archivo.type },
        body: archivo,
      });
      archivosSubidos.push({
        path: cargado.path,
        name: archivo.name,
        mime: cargado.mime || archivo.type,
        size: cargado.size || archivo.size,
      });
    }
    return archivosSubidos;
  };

  formulario.addEventListener('submit', async evento => {
    evento.preventDefault();
    try {
      if (!activoIdentificador) throw new Error('Elegí un usuario para iniciar la conversación.');
      const contenido = mensaje.value.trim();
      if (!contenido && !adjuntosPendientes.length) throw new Error('Escribí un mensaje o adjuntá un archivo.');
      if (!obtenerSesionSigtur()?.token) throw new Error('Iniciá sesión para enviar mensajes.');
      const identificadorDestinatario = activoIdentificador;
      enviandoMensaje = true;
      establecerCompositorHabilitado(true);
      estado.textContent = adjuntosPendientes.length ? 'Subiendo adjuntos…' : 'Enviando mensaje…';
      const adjuntos = await subirAdjuntosPendientes();
      await solicitarApiSigtur('/api/mensajes', {
        method: 'POST',
        body: JSON.stringify({
          destinatario_id: identificadorDestinatario,
          contenido,
          tipo: contenido ? 'texto' : 'archivo',
          attachments: adjuntos,
        })
      });
      mensaje.value = '';
      limpiarAdjuntosPendientes();
      estado.textContent = 'Mensaje guardado. El destinatario lo verá cuando vuelva a conectarse.';
      notificarSincronizacionMensajes(identificadorDestinatario);
      await cargarHilo(identificadorDestinatario, { scrollToBottom: true });
    } catch (fallo) {
      estado.textContent = fallo.message || 'No se pudo enviar el mensaje.';
    } finally {
      enviandoMensaje = false;
      if (adjuntosPendientes.length) representarAdjuntosPendientes();
      establecerCompositorHabilitado(Boolean(activoIdentificador));
    }
  });
}

function escaparTexto(valor) {
  const elemento = document.createElement('span');
  elemento.textContent = String(valor ?? '');
  return elemento.innerHTML;
}

function configurarBotonesFavoritos() {
  document.querySelectorAll('.alojamiento-corazon, .lugar-accion-enlace.guardar').forEach(boton => {
    // Los botones de lugares viven dentro de .lugar-actions, que es hijo
    // directo de la tarjeta. Subir dos niveles seleccionaba .lugares-list
    // y terminaba guardando todas las tarjetas como si fueran Plaza Artigas.
    const tarjeta = boton.closest('.alojamiento-tarjeta, .lugar-tarjeta') || boton.parentElement;
    const titulo = tarjeta.querySelector('.alojamiento-nombre, h3, h4')?.textContent.trim() || boton.getAttribute('aria-label')?.replace(/^Guardar\s*/i, '').trim() || tarjeta.querySelector('img')?.alt?.trim() || 'Lugar turístico';
    const identificadorEntidad = boton.dataset.entityId || titulo.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    boton.dataset.entityId = identificadorEntidad;
    boton.setAttribute('aria-pressed', 'false');
    const sincronizar = async () => {
      try { const estado = await solicitarApiSigtur(`/api/likes/estado?entidad_tipo=place&entidad_id=${encodeURIComponent(identificadorEntidad)}`); boton.setAttribute('aria-pressed', String(Boolean(estado.saved))); boton.classList.toggle('me-gusta', Boolean(estado.saved)); }
      catch { boton.setAttribute('aria-pressed', 'false'); }
    };
    sincronizar();
    boton.addEventListener('click', async evento => {
      evento.preventDefault();
      if (!obtenerSesionSigtur()?.token) { window.location.assign('login.html'); return; }
      const activo = boton.getAttribute('aria-pressed') !== 'true'; boton.disabled = true;
      try {
        await solicitarApiSigtur('/api/guardados', { method: 'POST', body: JSON.stringify({ entidad_tipo: 'place', entidad_id: identificadorEntidad, activo: activo, metadata: { nombre: titulo } }) });
        boton.setAttribute('aria-pressed', String(activo)); boton.classList.toggle('me-gusta', activo);
        boton.setAttribute('aria-label', activo ? `Quitar ${titulo} de guardados` : `Guardar ${titulo}`);
      } catch (fallo) { window.alert(fallo.message || 'No se pudo actualizar guardados.'); }
      finally { boton.disabled = false; }
    });
  });
}

function configurarPlanificacionTuristica() {
  const tarjetas = document.querySelectorAll('.alojamientos-seccion .alojamiento-tarjeta');
  if (!tarjetas.length) return;
  const dialogo = document.createElement('dialog');
  dialogo.className = 'turismo-planificacion-dialogo';
  document.body.appendChild(dialogo);
  dialogo.addEventListener('click', evento => { if (evento.target === dialogo) dialogo.close('cancel'); });
  const abrir = tarjeta => {
    const nombre = tarjeta.querySelector('.alojamiento-nombre')?.textContent.trim() || 'Experiencia turística';
    const precio = tarjeta.querySelector('.alojamiento-precio')?.textContent.trim() || 'Consultar tarifa';
    const referenciaLugar = nombre.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    dialogo.innerHTML = `<form class="turismo-planificacion-widget"><header><div><p>Planificá tu visita</p><h2>${escaparTexto(nombre)}</h2></div><button type="button" data-planificacion-cerrar aria-label="Cerrar">×</button></header><div class="turismo-planificacion-cuadricula"><label>Fecha preferida<input name="date" type="date" min="${new Date().toISOString().slice(0, 10)}" required></label><label>Personas<select name="people"><option value="1">1 persona</option><option value="2">2 personas</option><option value="3">3 personas</option><option value="4">4 personas</option></select></label></div><fieldset><legend>Horario flexible</legend><div class="reserva-horarios"><label><input type="radio" name="schedule" value="Mañana · 09:00–12:00" checked><span>Mañana<small>09:00–12:00</small></span></label><label><input type="radio" name="schedule" value="Tarde · 14:00–18:00"><span>Tarde<small>14:00–18:00</small></span></label><label><input type="radio" name="schedule" value="Flexible · a coordinar"><span>Flexible<small>A coordinar</small></span></label></div></fieldset><div class="turismo-planificacion-resumen"><span>Desde</span><strong>${escaparTexto(precio)}</strong></div><footer><button type="button" data-planificacion-cerrar>Cancelar</button><button type="submit">Solicitar disponibilidad</button></footer><p class="turismo-planificacion-estado" aria-live="polite"></p></form>`;
    dialogo.querySelectorAll('[data-planificacion-cerrar]').forEach(boton => boton.addEventListener('click', () => dialogo.close('cancel')));
    dialogo.querySelector('form').addEventListener('submit', async evento => {
      evento.preventDefault();
      const formulario = evento.currentTarget, estado = formulario.querySelector('.turismo-planificacion-estado'), valores = new FormData(formulario);
      if (!obtenerSesionSigtur()?.token) { window.location.assign('login.html'); return; }
      const enviar = formulario.querySelector('[type="submit"]'); enviar.disabled = true; estado.textContent = 'Guardando planificación…';
      try { await solicitarApiSigtur('/api/reservas/planes', { method: 'POST', body: JSON.stringify({ place_ref: referenciaLugar, place_name: nombre, visit_date: valores.get('date'), people: Number(valores.get('people')), schedule: valores.get('schedule') }) }); estado.textContent = 'Plan guardado en tu perfil.'; window.setTimeout(() => dialogo.close('saved'), 700); }
      catch (fallo) { estado.textContent = fallo.message || 'No se pudo guardar el plan.'; enviar.disabled = false; }
    });
    dialogo.showModal();
  };
  tarjetas.forEach(tarjeta => {
    const informacion = tarjeta.querySelector('.alojamiento-informacion');
    if (!informacion) return;
    const boton = document.createElement('button');
    boton.className = 'turismo-planificacion-activador'; boton.type = 'button'; boton.textContent = 'Planificar visita';
    boton.addEventListener('click', () => abrir(tarjeta));
    informacion.appendChild(boton);
  });
}

function configurarCuriosidadesTuristicas() {
  const destino = document.getElementById('turismo-curiosidad-texto');
  if (!destino) return;
  const datosCuriosos = [
    'Las termas del Daymán son uno de los grandes atractivos de Salto: sus aguas cálidas invitan a descansar todo el año.',
    'Salto se asoma al río Uruguay y su costanera es uno de los lugares preferidos para caminar al atardecer.',
    'La naranja es parte de la identidad productiva local; en la ciudad se celebra con sabores, ferias y recetas regionales.',
    'El nombre de Salto remite a los antiguos saltos de agua del río Uruguay, que marcaron la historia de la zona.',
    'La ciudad combina patrimonio, termas, gastronomía y naturaleza en distancias cortas para recorrer sin apuro.'
  ];
  let anterior = Number(localStorage.getItem('sigtur-last-curiosity'));
  if (!Number.isInteger(anterior) || anterior < 0 || anterior >= datosCuriosos.length) anterior = -1;
  const disponible = datosCuriosos.map((_, indice) => indice).filter(indice => indice !== anterior);
  const siguiente = disponible[Math.floor(Math.random() * disponible.length)];
  localStorage.setItem('sigtur-last-curiosity', String(siguiente));
  destino.textContent = datosCuriosos[siguiente];
}

function configurarInformacionGastronomica() {
  const tarjetas = document.querySelectorAll('.pagina-inicio .comida-tarjeta');
  if (!tarjetas.length) return;
  const descripciones = {
    'Asado criollo': 'El asado criollo se cocina lentamente a las brasas. Es una tradición de encuentro: cortes de carne, fuego paciente y sobremesa compartida.',
    Empanadas: 'Las empanadas son masas rellenas y horneadas o fritas. En Salto suelen encontrarse con carne, queso, jamón, pollo o verduras, ideales para compartir.',
    'Cultura del mate': 'El mate es una infusión de yerba mate que se toma con bombilla. Más que una bebida, es una costumbre cotidiana para conversar y recorrer la ciudad.'
  };
  const dialogo = document.createElement('dialog');
  dialogo.className = 'comida-informacion-dialogo';
  dialogo.id = 'ficha-gastronomia';
  dialogo.setAttribute('aria-labelledby', 'ficha-gastronomia-titulo');
  document.body.appendChild(dialogo);
  let tarjetaActiva = null;
  tarjetas.forEach(tarjeta => {
    tarjeta.tabIndex = 0;
    tarjeta.setAttribute('role', 'button');
    tarjeta.setAttribute('aria-haspopup', 'dialog');
    tarjeta.setAttribute('aria-controls', dialogo.id);
    tarjeta.setAttribute('aria-expanded', 'false');
    const titulo = tarjeta.querySelector('.comida-tarjeta-boton')?.textContent.trim() || 'Gastronomía local';
    const abrir = () => {
      tarjetaActiva = tarjeta;
      const imagen = tarjeta.querySelector('.comida-tarjeta-imagen');
      const urlImagen = imagen?.getAttribute('src') || '';
      const textoAlternativo = imagen?.getAttribute('alt') || titulo;
      const descripcion = descripciones[titulo] || 'Una propuesta gastronómica para descubrir durante tu visita a Salto.';
      const imagenFicha = urlImagen
        ? `<img class="ficha-gastronomia-imagen" src="${escaparTexto(urlImagen)}" alt="${escaparTexto(textoAlternativo)}" decoding="async">`
        : '';
      dialogo.innerHTML = `<article class="ficha-gastronomia">${imagenFicha}<div class="ficha-gastronomia-contenido"><p>Sabores de Salto</p><h2 id="ficha-gastronomia-titulo">${escaparTexto(titulo)}</h2><div class="ficha-gastronomia-descripcion">${escaparTexto(descripcion)}</div></div><button class="ficha-gastronomia-cerrar" type="button" aria-label="Cerrar ficha">×</button></article>`;
      dialogo.querySelector('.ficha-gastronomia-cerrar').addEventListener('click', () => dialogo.close());
      dialogo.querySelector('.ficha-gastronomia-imagen')?.addEventListener('error', errorImagen => errorImagen.currentTarget.remove(), { once: true });
      tarjeta.setAttribute('aria-expanded', 'true');
      dialogo.showModal();
    };
    tarjeta.addEventListener('click', abrir);
    tarjeta.addEventListener('keydown', evento => { if (evento.key === 'Enter' || evento.key === ' ') { evento.preventDefault(); abrir(); } });
  });
  dialogo.addEventListener('click', evento => { if (evento.target === dialogo) dialogo.close(); });
  dialogo.addEventListener('close', () => {
    if (!tarjetaActiva) return;
    tarjetaActiva.setAttribute('aria-expanded', 'false');
    tarjetaActiva.focus({ preventScroll: true });
    tarjetaActiva = null;
  });
}

async function completarLugaresGuardados(lugaresGuardados = [], usuarioIdentificador) {
  let marcadoresAlmacenados = {};
  try { marcadoresAlmacenados = JSON.parse(localStorage.getItem(`sigtur-place-pins:${usuarioIdentificador}`) || '{}'); } catch { /* caché local inválida */ }
  let catalogo = [];
  try {
    const respuesta = await fetch(`${SIGTUR_URL_SERVIDOR}/mapa`);
    const datosEnviados = respuesta.ok ? await respuesta.json() : null;
    catalogo = Array.isArray(datosEnviados) ? datosEnviados : datosEnviados?.data || datosEnviados?.puntos || [];
  } catch { /* se usa la caché local si el catálogo no está disponible */ }
  const marcadoresCatalogo = Object.fromEntries(catalogo.map(elemento => {
    const identificador = String(elemento.id ?? '');
    return [identificador, {
      id: identificador,
      nombre: elemento.nombre || elemento.name || elemento.titulo || elemento.title || '',
      direccion: elemento.direccion || elemento.address || elemento.ubicacion || '',
      categorias: elemento.categorias || elemento.categories || elemento.category || [],
      imagen: elemento.imagen || elemento.imagen_url || elemento.image || elemento.image_url || '',
      enlace: elemento.enlace || elemento.url || elemento.link || '',
    }];
  }).filter(([identificador]) => identificador));
  const identificadoresRemotos = new Set(lugaresGuardados.filter(elemento => elemento.entidad_tipo === 'place').map(elemento => String(elemento.entidad_id)));
  const remoto = lugaresGuardados.map(elemento => elemento.entidad_tipo === 'place' && (marcadoresAlmacenados[String(elemento.entidad_id)] || marcadoresCatalogo[String(elemento.entidad_id)])
    ? { ...elemento, pin: marcadoresAlmacenados[String(elemento.entidad_id)] || marcadoresCatalogo[String(elemento.entidad_id)] }
    : elemento);
  return remoto.map(elemento => ({ ...elemento, pin: elemento.metadata || elemento.pin || marcadoresAlmacenados[String(elemento.entidad_id)] || marcadoresCatalogo[String(elemento.entidad_id)] || {} }))
    .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
}

function representarCuadriculaPerfil(lugaresGuardados = []) {
  const cuadricula = document.getElementById('contenido-cuadricula');
  if (!cuadricula) return;
  if (!lugaresGuardados.length) {
    cuadricula.innerHTML = '<p class="perfil-vacio">Todavía no guardaste ningún punto. Explorá el mapa para armar tu lista.</p>';
    return;
  }
  cuadricula.innerHTML = lugaresGuardados.map(elemento => {
    const marcador = elemento.pin || {};
    const tipo = elemento.entidad_tipo === 'event' ? 'Evento' : elemento.entidad_tipo === 'company' ? 'Gastronomía o servicio' : 'Lugar guardado';
    const titulo = marcador.nombre || `${tipo} · ${elemento.entidad_id}`;
    const enlace = elemento.entidad_tipo === 'event' ? 'eventos.html' : `mapa.html?focus=${encodeURIComponent(elemento.entidad_id)}`;
    const accion = elemento.entidad_tipo === 'event' ? 'Ver eventos' : 'Ver en el mapa';
    const etiquetas = Array.isArray(marcador.categorias) && marcador.categorias.length ? `<p class="perfil-tarjeta-etiquetas">${marcador.categorias.map(etiqueta => `<span>${escaparTexto(etiqueta)}</span>`).join('')}</p>` : '';
    const imagen = marcador.imagen ? `<img src="${escaparTexto(marcador.imagen)}" alt="" loading="lazy">` : '';
    return `<article class="perfil-tarjeta">${imagen}<div><small class="perfil-tarjeta-tipo">${tipo}</small><h3>${escaparTexto(titulo)}</h3>${marcador.direccion ? `<p>${escaparTexto(marcador.direccion)}</p>` : ''}${etiquetas}<p>Guardado el ${new Date(elemento.created_at).toLocaleDateString('es-UY')}</p><a href="${enlace}">${accion}</a> <button type="button" data-eliminar-guardado="${escaparTexto(elemento.entidad_id)}" data-guardado-tipo="${escaparTexto(elemento.entidad_tipo)}">Quitar de guardados</button></div></article>`;
  }).join('');
}

async function representarReservasPerfil(usuarioIdentificador) {
  const lista = document.getElementById('reservas-lista');
  if (!lista) return;
  lista.setAttribute('aria-busy', 'true');
  lista.innerHTML = '<p class="interfaz-lista-estado estado-cargando" role="status">Cargando reservas...</p>';
  let resultado;
  try { resultado = await solicitarApiSigtur('/api/reservas'); }
  catch (fallo) { lista.innerHTML = `<p class="interfaz-lista-estado estado-error" role="alert">${escaparTexto(fallo.message || 'No se pudieron cargar tus reservas.')}</p>`; lista.setAttribute('aria-busy', 'false'); return; }
  const entradas = [
    ...(resultado.events || []).map(elemento => ({ ...elemento, type: 'event', displayName: elemento.event_title, displayDate: elemento.created_at, quantity: elemento.quantity, id: elemento.id })),
    ...(resultado.plans || []).map(elemento => ({ ...elemento, type: 'place', displayName: elemento.place_name, displayDate: elemento.visit_date, created_at: elemento.created_at, people: elemento.people, date: elemento.visit_date, id: elemento.id })),
  ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  lista.innerHTML = entradas.length
    ? entradas.map(reserva => reserva.type === 'event'
      ? `<article class="reserva-tarjeta"><div><small>EVENTO</small><strong>${escaparTexto(reserva.displayName || 'Evento')}</strong><p>${reserva.quantity} ${Number(reserva.quantity) === 1 ? 'lugar reservado' : 'lugares reservados'} · ${escaparTexto(reserva.schedule)} · ${new Date(reserva.created_at).toLocaleDateString('es-UY')}</p></div><a href="eventos.html#${encodeURIComponent(reserva.event_ref)}">Ver evento</a><button type="button" data-cancel-reserva="${reserva.id}" data-reserva-tipo="eventos">Cancelar</button></article>`
      : `<article class="reserva-tarjeta"><div><small>VISITA / LUGAR</small><strong>${escaparTexto(reserva.displayName || 'Experiencia turística')}</strong><p>${escaparTexto(reserva.date)} · ${reserva.people} ${Number(reserva.people) === 1 ? 'persona' : 'personas'} · ${escaparTexto(reserva.schedule)}</p></div><a href="turismo.html">Ver turismo</a><button type="button" data-cancel-reserva="${reserva.id}" data-reserva-tipo="planes">Cancelar</button></article>`).join('')
    : '<p class="perfil-vacio">Todavía no tenés reservas ni visitas planificadas.</p>';
  lista.setAttribute('aria-busy', 'false');
  lista.onclick = async evento => {
    const cancelar = evento.target.closest('[data-cancel-reserva]');
    if (!cancelar || !window.confirm('¿Cancelar esta reserva o planificación?')) return;
    cancelar.disabled = true;
    try { await solicitarApiSigtur(`/api/reservas/${cancelar.dataset.reservaTipo}/${encodeURIComponent(cancelar.dataset.cancelReserva)}`, { method: 'DELETE' }); await representarReservasPerfil(usuarioIdentificador); }
    catch (fallo) { cancelar.disabled = false; window.alert(fallo.message || 'No se pudo cancelar.'); }
  };
}

function configurarAccesoRapidoEventosAdministracion() {
  if (obtenerSesionSigtur()?.usuario?.rol !== 'admin') return;
  const servidor = document.querySelector('.destacados-encabezado');
  if (!servidor || servidor.querySelector('[data-administracion-crear-evento]')) return;
  const enlace = document.createElement('a');
  enlace.href = 'admin.html#admin-event-form';
  enlace.className = 'administracion-crear-evento';
  enlace.dataset.administracionCrearEvento = 'true';
  enlace.textContent = '+ Crear evento';
  servidor.appendChild(enlace);
}

async function configurarInteraccionesEventos() {
  const listaEntradas = document.querySelector('.pagina-eventos .evento-entradas');
  if (!listaEntradas) return;
  const iconoEvento = (nombre) => {
    const rutas = {
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
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${rutas[nombre] || rutas.culture}</svg>`;
  };
  const iconoCategoria = valor => {
    const clave = String(valor || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const icono = clave.includes('mus') ? 'music' : clave.includes('deport') ? 'sports' : clave.includes('feria') ? 'fair' : clave.includes('gastr') ? 'food' : clave.includes('relig') ? 'faith' : clave.includes('infant') ? 'kids' : 'culture';
    return iconoEvento(icono);
  };
  try {
    const resultado = await solicitarApiSigtur('/api/eventos');
    const eventos = Array.isArray(resultado) ? resultado : resultado.data || [];
    const nombresMeses = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
    eventos.forEach(evento => {
      const fecha = new Date(`${evento.date_start}T00:00:00`);
      const categoria = String(evento.categories?.[0] || 'Cultura').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z]+/g, '');
      const fila = document.createElement('article');
      fila.className = 'entrada-fila entrada-fila-remoto';
      fila.dataset.categoriaEvento = categoria;
      fila.dataset.eventId = `event-${evento.id}`;
      const colorEvento = /^#[0-9a-f]{6}$/i.test(String(evento.color || '')) ? evento.color : '#16b3a3';
      const multimediaEvento = analizarMultimediaEvento(evento.image_url);
      const imagenEvento = multimediaEvento.tipo === 'imagen' ? multimediaEvento.url : '';
      const enlaceFichaEvento = obtenerEnlaceWebEvento(evento.link) || (multimediaEvento.tipo === 'enlace' ? multimediaEvento.url : '');
      fila.dataset.eventColor = colorEvento;
      fila.dataset.eventImage = imagenEvento;
      fila.dataset.eventMediaType = multimediaEvento.tipo;
      fila.dataset.eventMediaUrl = multimediaEvento.url;
      fila.dataset.eventLink = enlaceFichaEvento;
      fila.style.setProperty('--color-evento', colorEvento);
      const horaEvento = evento.event_time ? String(evento.event_time).slice(0, 5) : 'Horario a confirmar';
      const precioEvento = Number(evento.price) > 0 ? `$${escaparTexto(evento.price)}` : 'Gratis';
      fila.innerHTML = `
        <div class="entrada-fecha"><span class="dia">${Number.isNaN(fecha.getTime()) ? '--' : String(fecha.getDate()).padStart(2, '0')}</span><span class="mes">${Number.isNaN(fecha.getTime()) ? '---' : nombresMeses[fecha.getMonth()]}</span></div>
        <div class="entrada-separador"></div>
        <div class="entrada-informacion">
          <div class="entrada-encabezado"><span class="entrada-titulo">${escaparTexto(evento.title)}</span></div>
          <span class="entrada-subtitulo">${escaparTexto(evento.description || 'Una propuesta para disfrutar Salto.')}</span>
          <div class="entrada-ubicacion">${iconoEvento('location')}<span>${escaparTexto(evento.location || 'Ubicaci\u00f3n a confirmar')}</span></div>
        </div>
        <span class="entrada-insignia insignia-verde">${iconoCategoria(evento.categories?.[0])}<span>${escaparTexto(evento.categories?.[0] || 'Cultura')}</span></span>
        <span class="entrada-horario">${iconoEvento('time')}<span>${escaparTexto(horaEvento)}</span></span>
        <span class="entrada-hora entrada-precio">${iconoEvento('price')}<span>${precioEvento}</span></span>
        <button class="entrada-corazon" aria-label="Dar like" aria-pressed="false"><svg viewBox="0 0 79 79" fill="none" xmlns="http://www.w3.org/2000/svg"><path class="corazon-relleno" d="M39.5 65 C20 50 8 40 8 26 A14 14 0 0 1 39.5 22 A14 14 0 0 1 71 26 C71 40 59 50 39.5 65Z" fill="none" stroke="rgba(0,0,0,0.25)" stroke-width="3"/></svg></button>`;
      listaEntradas.prepend(fila);
    });
    listaEntradas.dispatchEvent(new Event('eventosactualizados'));
  } catch (fallo) {
    const estado = document.createElement('p');
    estado.className = 'formulario-help evento-api-estado';
    estado.textContent = fallo.message || 'No se pudieron cargar los eventos publicados.';
    listaEntradas.insertAdjacentElement('beforebegin', estado);
  }
  document.querySelectorAll('.pagina-eventos .entrada-fila:not(.entrada-fila-remoto)').forEach(fila => {
    const horaAnterior = fila.querySelector('.entrada-hora');
    if (horaAnterior && !fila.querySelector('.entrada-horario')) {
      horaAnterior.classList.add('entrada-horario');
      horaAnterior.innerHTML = `${iconoEvento('time')}<span>${escaparTexto(horaAnterior.textContent.trim())}</span>`;
      const precio = document.createElement('span');
      precio.className = 'entrada-hora entrada-precio';
      precio.innerHTML = `${iconoEvento('price')}<span>Consultar</span>`;
      horaAnterior.insertAdjacentElement('afterend', precio);
    }
    const insignia = fila.querySelector('.entrada-insignia');
    if (insignia && !insignia.querySelector('svg')) insignia.insertAdjacentHTML('afterbegin', iconoCategoria(insignia.textContent));
    const ubicacion = fila.querySelector('.entrada-ubicacion');
    if (ubicacion && !ubicacion.querySelector('svg')) ubicacion.insertAdjacentHTML('afterbegin', iconoEvento('location'));
  });
  const filas = document.querySelectorAll('.pagina-eventos .entrada-fila');
  if (!filas.length) return;

  const escaparHtml = (valor) => {
    const elemento = document.createElement('span');
    elemento.textContent = String(valor ?? '');
    return elemento.innerHTML;
  };
  const crearIdentificadorUrl = (valor) => String(valor ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const obtenerDatosEvento = (fila) => {
    const titulo = fila.querySelector('.entrada-titulo')?.textContent.trim() || 'Evento';
    const fecha = `${fila.querySelector('.dia')?.textContent.trim() || ''}-${fila.querySelector('.mes')?.textContent.trim() || ''}`;
    const ubicacion = fila.querySelector('.entrada-ubicacion')?.textContent.trim() || '';
    const categoria = fila.querySelector('.entrada-insignia')?.textContent.trim() || 'Evento';
    const hora = fila.querySelector('.entrada-horario')?.textContent.trim() || 'Horario a confirmar';
    const precio = fila.querySelector('.entrada-precio')?.textContent.trim() || 'Consultar';
    const descripcion = fila.querySelector('.entrada-subtitulo')?.textContent.trim() || 'Una propuesta para disfrutar Salto.';
    return { title: titulo, id: fila.dataset.eventId || `event-${crearIdentificadorUrl(`${titulo}-${fecha}-${ubicacion}`)}`, date: fecha, location: ubicacion, category: categoria, time: hora, price: precio, description: descripcion, image: fila.dataset.eventImage || '', mediaType: fila.dataset.eventMediaType || (fila.dataset.eventImage ? 'imagen' : 'ninguno'), mediaUrl: fila.dataset.eventMediaUrl || '', link: obtenerEnlaceWebEvento(fila.dataset.eventLink), color: /^#[0-9a-f]{6}$/i.test(fila.dataset.eventColor || '') ? fila.dataset.eventColor : '#087f72' };
  };
  const dialogoDetalle = document.createElement('dialog');
  dialogoDetalle.className = 'evento-detalle-dialogo';
  document.body.appendChild(dialogoDetalle);
  const abrirDetalleEvento = evento => {
    const medioEnFicha = evento.mediaType === 'video'
      ? `<video class="evento-detalle-video" controls playsinline preload="metadata"><source src="${escaparHtml(evento.mediaUrl)}">Tu navegador no puede reproducir este video.</video>`
      : ['youtube', 'vimeo'].includes(evento.mediaType)
        ? `<iframe class="evento-detalle-video" src="${escaparHtml(evento.mediaUrl)}" title="Video de ${escaparHtml(evento.title)}" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`
        : evento.image ? `<img class="evento-detalle-imagen" src="${escaparHtml(evento.image)}" alt="" decoding="async">` : '';
    const enlaceInformacion = evento.link
      ? `<a href="${escaparHtml(evento.link)}" target="_blank" rel="noopener noreferrer">Ver información oficial</a>`
      : '';
    dialogoDetalle.innerHTML = `<article class="evento-detalle-tarjeta"><div class="evento-detalle-portada evento-detalle-${crearIdentificadorUrl(evento.category)}" style="--acento-evento:${evento.color}">${medioEnFicha}<button class="evento-detalle-cerrar" type="button" aria-label="Cerrar detalle">\u00d7</button><div class="evento-detalle-rotulos"><span>${escaparHtml(evento.category)}</span><span>${escaparHtml(evento.date)}</span></div><div><p class="evento-detalle-antetitulo">Agenda SIGTUR \u00b7 Salto</p><h2>${escaparHtml(evento.title)}</h2><p>${escaparHtml(evento.description)}</p></div></div><div class="evento-detalle-contenido"><div class="evento-detalle-datos"><div><small>${iconoEvento('time')}Horario</small><strong>${escaparHtml(evento.time)}</strong></div><div><small>${iconoEvento('price')}Precio</small><strong>${escaparHtml(evento.price)}</strong></div><div><small>${iconoEvento('location')}D\u00f3nde</small><strong>${escaparHtml(evento.location)}</strong></div></div><p>Guard\u00e1 el evento, reserv\u00e1 tu lugar y compart\u00ed tu experiencia con la comunidad.</p><div class="evento-detalle-acciones"><button type="button" data-detalle-reserve>Reservar lugar</button><a href="mapa.html?focus=${encodeURIComponent(evento.id)}">Ver en mapa</a>${enlaceInformacion}</div></div></article>`;
    dialogoDetalle.showModal();
    dialogoDetalle.querySelector('.evento-detalle-cerrar').addEventListener('click', () => dialogoDetalle.close());
    dialogoDetalle.querySelector('[data-detalle-reserve]').addEventListener('click', () => { dialogoDetalle.close(); const tique = [...filas].find(fila => obtenerDatosEvento(fila).id === evento.id); tique?.querySelector('[data-evento-reserva]')?.click(); });
  };
  dialogoDetalle.addEventListener('click', clicEvento => { if (clicEvento.target === dialogoDetalle) dialogoDetalle.close(); });
  const nombreAutor = (comentario) => {
    const autor = comentario.autor || {};
    return [autor.nombre, autor.apellido].filter(Boolean).join(' ') || 'Explorador';
  };
  const avatarAutor = (comentario) => {
    const autor = comentario.autor || {};
    const iniciales = nombreAutor(comentario).split(/\s+/).slice(0, 2).map(parte => parte[0]).join('').toUpperCase() || '?';
    return `<span class="comentario-avatar">${autor.avatar_url ? `<img src="${escaparHtml(autor.avatar_url)}" alt="" onerror="this.remove()">` : ''}<span>${escaparHtml(iniciales)}</span></span>`;
  };
  const sincronizarBotonMeGusta = async (boton, identificadorEvento) => {
    try {
      const estado = await solicitarApiSigtur(`/api/likes/estado?entidad_tipo=event&entidad_id=${encodeURIComponent(identificadorEvento)}`);
      boton.setAttribute('aria-pressed', String(Boolean(estado.liked)));
      boton.classList.toggle('me-gusta', Boolean(estado.liked));
      boton.setAttribute('aria-label', estado.liked ? 'Quitar like' : 'Dar like');
      const icono = boton.querySelector('[aria-hidden="true"]');
      if (icono) icono.textContent = estado.liked ? '♥' : '♡';
    } catch {
      boton.setAttribute('aria-pressed', 'false');
    }
  };
  const representarComentarios = (panelActual, comentarios) => {
    const lista = panelActual.querySelector('[data-evento-comentario-lista]');
    if (!lista) return;
    const orden = panelActual.querySelector('[data-comentario-orden][aria-pressed="true"]')?.dataset.comentarioOrden || 'newest';
    const porPadre = new Map();
    comentarios.forEach(comentario => { const clave = comentario.parent_id || 'root'; porPadre.set(clave, [...(porPadre.get(clave) || []), comentario]); });
    const ordenar = entradas => [...entradas].sort((a, b) => {
      if (Boolean(a.fijado) !== Boolean(b.fijado)) return a.fijado ? -1 : 1;
      return orden === 'oldest' ? new Date(a.created_at) - new Date(b.created_at) : new Date(b.created_at) - new Date(a.created_at);
    });
    const representarComentario = comentario => {
      const respuestas = ordenar(porPadre.get(comentario.id) || []);
      const multimedia = window.sigturGenerarMultimediaComentario?.(comentario.media_urls) || '';
      const contenidoPrincipal = comentario.contenido ? `<p>${escaparHtml(comentario.contenido)}</p>` : '';
      const propio = obtenerSesionSigtur()?.usuario?.id === comentario.usuario_id;
      const estadoMeGusta = comentario.likeState || { liked: false, likes: 0 };
      return `<article class="evento-comentario ${comentario.fijado ? 'estado-fijado' : ''}" data-comentario-id="${escaparHtml(comentario.id)}" data-comentario-usuario="${escaparHtml(comentario.usuario_id)}"><div class="comentario-autor">${avatarAutor(comentario)}<span><strong>${escaparHtml(nombreAutor(comentario))}</strong><small>${comentario.autor?.rol === 'admin' ? 'Administrador' : 'Explorador'}${comentario.fijado ? ' · 📌 Fijado' : ''}</small></span><time>${new Date(comentario.created_at).toLocaleDateString('es-UY')}</time></div>${contenidoPrincipal}${multimedia}<div class="evento-comentario-acciones"><button type="button" data-comentario-me-gusta aria-pressed="${estadoMeGusta.liked}">${estadoMeGusta.liked ? '♥' : '♡'} Me gusta (${estadoMeGusta.likes})</button><button type="button" data-comentario-respuesta>↩ Responder</button><button type="button" data-comentario-mensaje>✉ Mensaje</button>${propio ? '<button type="button" data-editar-comentario>Editar</button><button type="button" data-eliminar-propio-comentario>Eliminar</button>' : ''}${obtenerSesionSigtur()?.usuario?.rol === 'admin' && !propio ? '<button type="button" data-administracion-eliminar-comentario>Eliminar</button>' : ''}</div><div class="evento-respuesta-formulario" hidden><textarea rows="2" maxlength="2000" placeholder="Responder a ${escaparHtml(nombreAutor(comentario))}..."></textarea><button type="button" data-enviar-respuesta>Publicar respuesta</button></div>${respuestas.length ? `<div class="evento-comentario-respuestas"><span>${respuestas.length} ${respuestas.length === 1 ? 'respuesta' : 'respuestas'}</span>${respuestas.map(representarComentario).join('')}</div>` : ''}</article>`;
    };
    const raices = ordenar(porPadre.get('root') || []);
    lista.innerHTML = raices.length
      ? raices.map(representarComentario).join('')
      : '<p class="evento-panel-estado">Todavía no hay comentarios.</p>';
  };
  const cargarComentarios = async (panelActual, identificadorEvento) => {
    if (panelActual._commentsLoading) {
      panelActual._commentsReload = true;
      return;
    }
    const estado = panelActual.querySelector('[data-evento-panel-estado]');
    if (!estado) return;
    panelActual._commentsLoading = true;
    try {
      estado.setAttribute('role', 'status');
      estado.setAttribute('aria-busy', 'true');
      estado.classList.add('interfaz-lista-estado', 'estado-cargando');
      estado.classList.remove('estado-error');
      estado.textContent = 'Cargando comentarios…';
      const resultado = await solicitarApiSigtur(`/api/comentarios?entidad_tipo=event&entidad_id=${encodeURIComponent(identificadorEvento)}`);
      panelActual._eventComments = await Promise.all((resultado.data || []).map(async comentario => {
        try { return { ...comentario, likeState: await solicitarApiSigtur(`/api/comentarios/${comentario.id}/likes`) }; }
        catch { return { ...comentario, likeState: { liked: false, likes: 0 } }; }
      }));
      representarComentarios(panelActual, panelActual._eventComments);
      estado.textContent = '';
      estado.setAttribute('aria-busy', 'false');
      estado.classList.remove('estado-cargando');
    } catch (fallo) {
      estado.setAttribute('role', 'alert');
      estado.setAttribute('aria-busy', 'false');
      estado.classList.remove('estado-cargando');
      estado.classList.add('interfaz-lista-estado', 'estado-error');
      estado.textContent = fallo.message || 'No se pudieron cargar los comentarios. Revisa database/README.md y aplica las migraciones pendientes con Supabase CLI.';
    } finally {
      panelActual._commentsLoading = false;
      if (panelActual._commentsReload) {
        panelActual._commentsReload = false;
        void cargarComentarios(panelActual, identificadorEvento);
      }
    }
  };
  const mostrarInicioSesion = () => { window.location.replace('login.html'); };
  const claveInteraccion = evento => `entidad_tipo=event&entidad_id=${encodeURIComponent(evento.id)}`;
  const sincronizarBotonGuardado = async (boton, evento) => {
    try {
      const estado = await solicitarApiSigtur(`/api/likes/estado?${claveInteraccion(evento)}`);
      boton.setAttribute('aria-pressed', String(Boolean(estado.saved)));
      boton.textContent = estado.saved ? '🔖 Guardado' : '🔖 Guardar';
    } catch { boton.textContent = '🔖 Guardar'; }
  };

  filas.forEach(fila => {
    const evento = obtenerDatosEvento(fila);
    const botonMeGusta = fila.querySelector('.entrada-corazon');
    if (botonMeGusta) {
      sincronizarBotonMeGusta(botonMeGusta, evento.id);
      botonMeGusta.addEventListener('click', async clicEvento => {
        clicEvento.preventDefault();
        clicEvento.stopPropagation();
        if (!obtenerSesionSigtur()?.token) { mostrarInicioSesion(); return; }
        const activo = botonMeGusta.getAttribute('aria-pressed') !== 'true';
        botonMeGusta.disabled = true;
        try {
          await solicitarApiSigtur('/api/likes', {
            method: 'POST',
            body: JSON.stringify({ entidad_tipo: 'event', entidad_id: evento.id, activo: activo }),
          });
          botonMeGusta.setAttribute('aria-pressed', String(activo));
          botonMeGusta.classList.toggle('me-gusta', activo);
          botonMeGusta.setAttribute('aria-label', activo ? 'Quitar like' : 'Dar like');
          const icono = botonMeGusta.querySelector('[aria-hidden="true"]');
          if (icono) icono.textContent = activo ? '♥' : '♡';
        } catch (fallo) {
          botonMeGusta.setAttribute('aria-label', fallo.message || 'No se pudo actualizar el like');
        } finally {
          botonMeGusta.disabled = false;
        }
      });
    }
    const controles = document.createElement('div');
    controles.className = 'evento-interaccion-herramientas';
    const idPanelInteraccion = `panel-interaccion-${crearIdentificadorUrl(evento.id) || 'evento'}`;
    controles.innerHTML = `<button class="evento-herramienta" type="button" data-evento-detalle title="Ver ficha del evento">${iconoEvento('culture')}<span>Ver ficha</span></button><button class="evento-herramienta" type="button" data-evento-comentarios aria-controls="${idPanelInteraccion}" aria-expanded="false" title="Ver comentarios">${iconoEvento('comment')}<span>Comentarios</span></button><button class="evento-herramienta" type="button" data-evento-guardar aria-pressed="false" title="Guardar evento">${iconoEvento('save')}<span>Guardar</span></button><button class="evento-herramienta" type="button" data-evento-reserva aria-controls="${idPanelInteraccion}" aria-expanded="false" title="Reservar lugar">${iconoEvento('reserve')}<span>Reservar</span></button>`;
    fila.appendChild(controles);

    const panelActual = document.createElement('div');
    panelActual.className = 'evento-interaccion-panel';
    panelActual.id = idPanelInteraccion;
    panelActual.setAttribute('aria-labelledby', `${idPanelInteraccion}-titulo`);
    panelActual.hidden = true;
    panelActual.innerHTML = `<div class="encabezado-panel-evento"><div class="titulo-panel-evento"><span class="evento-panel-contexto" data-panel-contexto>Foro del evento</span><strong id="${idPanelInteraccion}-titulo">${escaparHtml(evento.title)}</strong></div><button type="button" class="evento-panel-cerrar" data-evento-cerrar aria-label="Cerrar panel">×</button></div><div class="evento-comentarios-vista"><div class="evento-comentario-aviso">Compartí experiencias útiles y respetá a la comunidad SIGTUR.</div><div class="comentario-filtro" role="group" aria-label="Ordenar comentarios"><button type="button" data-comentario-orden="newest" aria-pressed="true">Recientes</button><button type="button" data-comentario-orden="oldest" aria-pressed="false">Antiguos</button></div><p class="evento-panel-estado" data-evento-panel-estado></p><div class="evento-comentario-lista" data-evento-comentario-lista></div><form data-evento-comentario-formulario data-comentario-multimedia-formulario><textarea name="contenido" rows="2" maxlength="2000" aria-label="Escribí un comentario" placeholder="Sumá un comentario o adjuntá una imagen..."></textarea><button class="evento-panel-enviar" type="submit">Publicar</button></form></div><div class="evento-reserva-vista" hidden><p class="evento-panel-estado" data-reserva-estado></p><div class="reserva-widget"><p class="reserva-widget-intro">Elegí la modalidad que mejor se adapte a tu día.</p><label>Cantidad de lugares<select data-reserva-quantity><option value="1">1 lugar</option><option value="2">2 lugares</option><option value="3">3 lugares</option><option value="4">4 lugares</option></select></label><fieldset><legend>Horario de llegada</legend><div class="reserva-horarios"><label><input type="radio" name="slot-${escaparHtml(evento.id)}" value="Temprano · 18:00" checked><span>Temprano<small>18:00</small></span></label><label><input type="radio" name="slot-${escaparHtml(evento.id)}" value="Central · 20:00"><span>Central<small>20:00</small></span></label><label><input type="radio" name="slot-${escaparHtml(evento.id)}" value="Flexible · a coordinar"><span>Flexible<small>A coordinar</small></span></label></div></fieldset></div><button class="evento-panel-enviar" type="button" data-reserve-confirm>Confirmar reserva</button></div>`;
    fila._panelInteraccion = panelActual;
    const contenedorPaneles = fila.closest('.evento-carrusel-marco')?.querySelector('.evento-interaccion-paneles');
    if (contenedorPaneles) contenedorPaneles.append(panelActual);
    else fila.insertAdjacentElement('afterend', panelActual);
    sincronizarBotonGuardado(controles.querySelector('[data-evento-guardar]'), evento);

    const cerrarPanel = () => {
      panelActual.setAttribute('hidden', '');
      fila.querySelectorAll('[data-evento-comentarios],[data-evento-reserva]').forEach(boton => boton.setAttribute('aria-expanded', 'false'));
    };
    panelActual.querySelector('[data-evento-cerrar]').addEventListener('click', cerrarEvento => {
      cerrarEvento.preventDefault();
      cerrarEvento.stopPropagation();
      cerrarPanel();
    });

    fila.addEventListener('click', async (clicEvento) => {
      const guardarBoton = clicEvento.target.closest('[data-evento-guardar]');
      if (guardarBoton) {
        clicEvento.stopPropagation();
        try {
          if (!obtenerSesionSigtur()?.token) { mostrarInicioSesion(); return; }
          guardarBoton.disabled = true;
          const activo = guardarBoton.getAttribute('aria-pressed') !== 'true';
          await solicitarApiSigtur('/api/guardados', { method: 'POST', body: JSON.stringify({ entidad_tipo: 'event', entidad_id: evento.id, activo: activo, metadata: { nombre: evento.title, direccion: evento.location, categorias: [evento.category] } }) });
          guardarBoton.setAttribute('aria-pressed', String(activo));
          guardarBoton.textContent = activo ? '🔖 Guardado' : '🔖 Guardar';
        } catch (fallo) { panelActual.querySelector('[data-evento-panel-estado]').textContent = fallo.message || 'No se pudo guardar el evento.'; }
        finally { guardarBoton.disabled = false; }
        return;
      }
      if (clicEvento.target.closest('[data-evento-detalle]')) { clicEvento.stopPropagation(); abrirDetalleEvento(evento); return; }
      const botonComentarios = clicEvento.target.closest('[data-evento-comentarios]');
      const reservaBoton = clicEvento.target.closest('[data-evento-reserva]');
      if (!botonComentarios && !reservaBoton) return;
      clicEvento.stopPropagation();
      const esReserva = Boolean(reservaBoton);
      const activoBoton = esReserva ? reservaBoton : botonComentarios;
      const estabaExpandido = activoBoton.getAttribute('aria-expanded') === 'true';
      if (!estabaExpandido) {
        contenedorPaneles?.querySelectorAll('.evento-interaccion-panel:not([hidden])').forEach(panelAbierto => {
          if (panelAbierto === panelActual) return;
          panelAbierto.hidden = true;
          document.querySelectorAll(`[aria-controls="${panelAbierto.id}"]`).forEach(boton => boton.setAttribute('aria-expanded', 'false'));
        });
      }
      panelActual.hidden = false;
      panelActual.querySelector('.evento-comentarios-vista').hidden = esReserva;
      panelActual.querySelector('.evento-reserva-vista').hidden = !esReserva;
      panelActual.querySelector('[data-panel-contexto]').textContent = esReserva ? 'Reserva del evento' : 'Foro del evento';
      fila.querySelectorAll('[data-evento-comentarios],[data-evento-reserva]').forEach(boton => boton.setAttribute('aria-expanded', 'false'));
      activoBoton.setAttribute('aria-expanded', String(!estabaExpandido));
      panelActual.hidden = estabaExpandido;
      if (!estabaExpandido) {
        const movimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
        requestAnimationFrame(() => panelActual.scrollIntoView({ behavior: movimiento, block: 'nearest' }));
        if (!esReserva) await cargarComentarios(panelActual, evento.id);
      }
    });

    panelActual.addEventListener('click', async (clicEvento) => {
      const botonFiltro = clicEvento.target.closest('[data-comentario-orden]');
      if (botonFiltro) {
        panelActual.querySelectorAll('[data-comentario-orden]').forEach(boton => boton.setAttribute('aria-pressed', String(boton === botonFiltro)));
        representarComentarios(panelActual, panelActual._eventComments || []);
        return;
      }
      if (clicEvento.target.closest('[data-evento-cerrar]')) {
        cerrarPanel();
        return;
      }
      const reservarBoton = clicEvento.target.closest('[data-reserve-confirm]');
      if (!reservarBoton) return;
      const estado = panelActual.querySelector('[data-reserva-estado]');
      try {
        if (!obtenerSesionSigtur()?.token) { mostrarInicioSesion(); return; }
        reservarBoton.disabled = true;
        const cantidad = Number(panelActual.querySelector('[data-reserva-quantity]').value);
        const horario = panelActual.querySelector(`input[name="slot-${CSS.escape(evento.id)}"]:checked`)?.value || 'Flexible · a coordinar';
        await solicitarApiSigtur('/api/reservas/eventos', { method: 'POST', body: JSON.stringify({ event_ref: evento.id, event_title: evento.title, quantity: cantidad, schedule: horario }) });
        estado.textContent = `Reserva registrada: ${cantidad} ${cantidad === 1 ? 'lugar' : 'lugares'} · ${horario}.`;
      } catch (fallo) {
        estado.textContent = fallo.message || 'No se pudo completar la reserva.';
      } finally { reservarBoton.disabled = false; }
    });

    panelActual.addEventListener('click', async (clicEvento) => {
      const comentario = clicEvento.target.closest('[data-comentario-id]');
      if (!comentario) return;
      try {
        if (!obtenerSesionSigtur()?.token) { mostrarInicioSesion(); return; }
        if (clicEvento.target.closest('[data-administracion-eliminar-comentario]')) {
          if (obtenerSesionSigtur()?.usuario?.rol !== 'admin' || !window.confirm('¿Eliminar este comentario?')) return;
          await solicitarApiSigtur(`/api/admin/comentarios/${comentario.dataset.comentarioId}`, { method: 'DELETE' });
          await cargarComentarios(panelActual, evento.id);
          return;
        }
        if (clicEvento.target.closest('[data-eliminar-propio-comentario]')) {
          if (!window.confirm('¿Eliminar este comentario y sus respuestas?')) return;
          await solicitarApiSigtur(`/api/comentarios/${comentario.dataset.comentarioId}`, { method: 'DELETE' });
          await cargarComentarios(panelActual, evento.id); return;
        }
        if (clicEvento.target.closest('[data-editar-comentario]')) {
          const existente = panelActual._eventComments.find(elemento => elemento.id === comentario.dataset.comentarioId)?.contenido || '';
          const contenido = window.prompt('Editá tu comentario:', existente);
          if (contenido === null || !contenido.trim()) return;
          await solicitarApiSigtur(`/api/comentarios/${comentario.dataset.comentarioId}`, { method: 'PATCH', body: JSON.stringify({ contenido }) });
          await cargarComentarios(panelActual, evento.id); return;
        }
        if (clicEvento.target.closest('[data-comentario-respuesta]')) {
          const formularioRespuesta = comentario.querySelector('.evento-respuesta-formulario');
          const nombreDestinatario = comentario.querySelector('.comentario-autor strong')?.textContent || 'este usuario';
          formularioRespuesta.hidden = false;
          formularioRespuesta.querySelector('textarea')?.setAttribute('aria-label', `Responder a ${nombreDestinatario}`);
          formularioRespuesta.querySelector('textarea')?.focus();
        }
        if (clicEvento.target.closest('[data-enviar-respuesta]')) {
          const contenido = comentario.querySelector('textarea').value;
          await solicitarApiSigtur(`/api/comentarios/${comentario.dataset.comentarioId}/respuestas`, { method: 'POST', body: JSON.stringify({ contenido }) });
          await cargarComentarios(panelActual, evento.id);
        }
        if (clicEvento.target.closest('[data-comentario-me-gusta]')) {
          const boton = clicEvento.target.closest('[data-comentario-me-gusta]');
          const estado = await solicitarApiSigtur(`/api/comentarios/${comentario.dataset.comentarioId}/likes`);
          await solicitarApiSigtur(`/api/comentarios/${comentario.dataset.comentarioId}/likes`, { method: 'POST', body: JSON.stringify({ activo: !estado.liked }) });
          await cargarComentarios(panelActual, evento.id);
        }
        if (clicEvento.target.closest('[data-comentario-mensaje]')) {
          const destinatario = comentario.dataset.comentarioUsuario;
          const contenido = window.prompt('Mensaje para este usuario:');
          if (contenido?.trim()) await solicitarApiSigtur('/api/mensajes', { method: 'POST', body: JSON.stringify({ destinatario_id: destinatario, contenido }) });
        }
      } catch (fallo) {
        panelActual.querySelector('[data-evento-panel-estado]').textContent = fallo.message || 'No se pudo completar la acción.';
      }
    });

    panelActual.querySelector('[data-evento-comentario-formulario]').addEventListener('submit', async (enviarEvento) => {
      enviarEvento.preventDefault();
      const formulario = enviarEvento.currentTarget;
      const estado = panelActual.querySelector('[data-evento-panel-estado]');
      try {
        if (!obtenerSesionSigtur()?.token) { mostrarInicioSesion(); return; }
        const contenido = new FormData(formulario).get('contenido');
        const rutasMultimedia = await window.sigturPrepararMultimediaComentario(formulario);
        if (!String(contenido || '').trim() && !rutasMultimedia.length) throw new Error('Escribí un comentario o adjuntá una imagen.');
        await solicitarApiSigtur('/api/comentarios', { method: 'POST', body: JSON.stringify({ entidad_tipo: 'event', entidad_id: evento.id, contenido, media_paths: rutasMultimedia }) });
        formulario.reset();
        window.sigturLimpiarMultimediaComentario(formulario);
        await cargarComentarios(panelActual, evento.id);
      } catch (fallo) { estado.textContent = fallo.message || 'No se pudo publicar el comentario.'; }
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
// El panel solo aparece despues de validar el rol de administrador.
// ============================================================================
async function configurarPaginaAdministracion() {
  const formulario = document.getElementById('administracion-ajustes-formulario');
  if (!formulario) return;

  const sesion = obtenerSesionSigtur();
  if (!sesion?.token) {
    const extension = window.location.pathname.toLowerCase().endsWith('.php') ? 'php' : 'html';
    window.location.replace(`login.${extension}`);
    return;
  }

  formulario.closest('.utilidad-cuadricula')?.setAttribute('hidden', '');
  try {
    await solicitarApiSigtur('/api/auth/es-admin');
  } catch (fallo) {
    console.error('No se pudo validar el acceso de administrador:', fallo);
    if (fallo.status === 401) {
      limpiarSesionSigtur();
      const extension = window.location.pathname.toLowerCase().endsWith('.php') ? 'php' : 'html';
      window.location.replace(`login.${extension}`);
    } else {
      if (fallo.status === 403) {
        const extension = window.location.pathname.toLowerCase().endsWith('.php') ? 'php' : 'html';
        window.location.replace(`index.${extension}`);
      } else {
        const mensaje = document.createElement('p');
        mensaje.className = 'cuenta-estado';
        mensaje.setAttribute('role', 'status');
        mensaje.textContent = 'No se pudo validar el acceso. Intentá nuevamente.';
        formulario.closest('.utilidad-cuadricula')?.before(mensaje);
      }
    }
    return;
  }
  formulario.closest('.utilidad-cuadricula')?.removeAttribute('hidden');

  const estado = document.getElementById('administracion-guardar-estado');
  const actividad = document.getElementById('administracion-actividad');
  const formularioAviso = document.getElementById('administracion-anuncio-formulario');
  const vistaPrevia = document.getElementById('administracion-anuncio-vista-previa');
  const botonLimpiarAviso = document.getElementById('administracion-limpiar-anuncio');
  const botonExportar = document.getElementById('administracion-exportar');

  const valoresPredeterminados = {
    featuredEvents: true,
    reviewPlaces: true,
    showSupport: true,
    maintenanceMode: false
  };

  const registro = async (mensaje) => { try { await solicitarApiSigtur('/api/admin/actividad', { method: 'POST', body: JSON.stringify({ action: 'admin.action', details: { message: mensaje } }) }); const filas = await solicitarApiSigtur('/api/admin/actividad?page=1&pageSize=8'); if (actividad) actividad.innerHTML = (filas.data || []).map(fila => `<p>${escaparTexto(new Date(fila.created_at).toLocaleString('es-UY'))} · ${escaparTexto(fila.details?.message || fila.action)}</p>`).join(''); } catch { if (actividad) actividad.textContent = 'No se pudo guardar la actividad.'; } };

  const establecerEstado = (mensaje) => {
    if (!estado) return;
    estado.textContent = mensaje;
    clearTimeout(establecerEstado.timer);
    establecerEstado.timer = setTimeout(() => { estado.textContent = 'Listo'; }, 1800);
  };

  const aplicarConfiguracion = (configuracion) => {
    Object.entries({ ...valoresPredeterminados, ...configuracion }).forEach(([clave, valor]) => {
      const entrada = formulario.elements[clave];
      if (entrada) entrada.checked = Boolean(valor);
    });
  };

  const recopilarConfiguracion = () => Array.from(formulario.querySelectorAll('input[type="checkbox"]')).reduce((acumulador, entrada) => {
    acumulador[entrada.name] = entrada.checked;
    return acumulador;
  }, {});

  const actualizarVistaPrevia = () => {
    const guardado = avisoGuardado;
    if (!vistaPrevia) return;
    vistaPrevia.textContent = guardado?.title ? `${guardado.title}: ${guardado.body || 'Sin descripcion'}` : 'Sin aviso publicado.';
  };

  let avisoGuardado = null;
  try {
    const [configuracion, avisoAdministracion, metricas] = await Promise.all([solicitarApiSigtur('/api/admin/configuracion'), solicitarApiSigtur('/api/admin/aviso'), solicitarApiSigtur('/api/admin/metricas')]);
    aplicarConfiguracion({ ...valoresPredeterminados, ...configuracion });
    avisoGuardado = avisoAdministracion.data || null;
    if (avisoGuardado && formularioAviso) { formularioAviso.elements.title.value = avisoGuardado.title || ''; formularioAviso.elements.body.value = avisoGuardado.body || ''; }
    Object.entries(metricas).forEach(([clave, valor]) => { const metrica = document.querySelector(`[data-administracion-metrica="${clave}"]`); if (metrica) metrica.textContent = String(valor); });
  } catch (fallo) { establecerEstado(fallo.message || 'No se pudo cargar la configuración.'); }
  actualizarVistaPrevia();
  try { const filas = await solicitarApiSigtur('/api/admin/actividad?page=1&pageSize=8'); if (actividad) actividad.innerHTML = (filas.data || []).map(fila => `<p>${escaparTexto(new Date(fila.created_at).toLocaleString('es-UY'))} · ${escaparTexto(fila.action.replaceAll('.', ' '))}</p>`).join('') || '<p>Sin actividad registrada.</p>'; } catch { if (actividad) actividad.textContent = 'No se pudo cargar la actividad.'; }

  formulario.addEventListener('change', async (evento) => {
    const configuracion = recopilarConfiguracion();
    try { await solicitarApiSigtur('/api/admin/configuracion', { method: 'PATCH', body: JSON.stringify(configuracion) }); establecerEstado('Cambios guardados en el servidor'); await cargarConfiguracionPublica(); }
    catch (fallo) { evento.target.checked = !evento.target.checked; establecerEstado(fallo.message || 'No se pudieron guardar los ajustes.'); return; }
    const etiqueta = evento.target?.closest('.ajustes-elemento')?.querySelector('strong')?.textContent || 'Ajuste';
    void etiqueta;
  });

  formularioAviso?.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    const datos = new FormData(formularioAviso);
    const aviso = {
      title: String(datos.get('title') || '').trim(),
      body: String(datos.get('body') || '').trim(),
      updatedAt: new Date().toISOString()
    };
    try { const respuesta = await solicitarApiSigtur('/api/admin/aviso', { method: 'PUT', body: JSON.stringify(aviso) }); avisoGuardado = respuesta.data; await cargarConfiguracionPublica(); }
    catch (fallo) { establecerEstado(fallo.message || 'No se pudo guardar el aviso.'); return; }
    actualizarVistaPrevia();
    establecerEstado('Aviso guardado');

  });

  botonLimpiarAviso?.addEventListener('click', async () => {
    try { await solicitarApiSigtur('/api/admin/aviso', { method: 'DELETE' }); avisoGuardado = null; await cargarConfiguracionPublica(); }
    catch (fallo) { establecerEstado(fallo.message || 'No se pudo eliminar el aviso.'); return; }
    formularioAviso?.reset();
    actualizarVistaPrevia();
    establecerEstado('Aviso limpiado');
  });

  // gonza: el export copia el estado actual del admin al portapapeles como JSON.
  // clipboard.writeText también es async porque acceder al portapapeles
  // puede requerir permiso del browser en algunos casos
  botonExportar?.addEventListener('click', async () => {
    const datosEnviados = {
      settings: recopilarConfiguracion(),
      announcement: avisoGuardado,
      exportedAt: new Date().toISOString()
    };
    const texto = JSON.stringify(datosEnviados, null, 2);
    try {
      await navigator.clipboard.writeText(texto);
      establecerEstado('Estado copiado');
      registro('Estado copiado al portapapeles');
    } catch {
      establecerEstado('Export listo en consola');
      console.info('SIGTUR admin export', datosEnviados);
      registro('Estado enviado a consola');
    }
  });

  const formularioEvento = document.getElementById('administracion-evento-formulario');
  const listaEventos = document.getElementById('administracion-eventos-lista');
  const tituloFormularioEvento = document.getElementById('administracion-evento-formulario-titulo');
  const enviarEvento = document.getElementById('administracion-evento-enviar');
  const cancelarEvento = document.getElementById('administracion-evento-cancel');
  const entradaImagenEvento = document.getElementById('administracion-evento-imagen');
  const vistaPreviaImagenEvento = document.getElementById('administracion-evento-imagen-vista-previa');
  const imagenVistaPreviaEvento = vistaPreviaImagenEvento?.querySelector('img');
  const elementoMapaEvento = document.getElementById('administracion-evento-mapa');
  const latitudEvento = document.getElementById('administracion-evento-latitude');
  const longitudEvento = document.getElementById('administracion-evento-longitude');
  const simbolosCategoriaEvento = {
    cultura: '🎭', musica: '♫', deportes: '⚽', feria: '▦',
    gastronomia: '♨', religiosos: '✦', infantiles: '★'
  };
  const simboloCategoriaEvento = (categorias) => {
    const categoria = Array.isArray(categorias) ? categorias[0] : categorias;
    return simbolosCategoriaEvento[String(categoria || '').toLowerCase()] || '◉';
  };
  const registrosEventosAdministracion = new Map();
  const representarEventosAdministracion = (eventos) => {
    if (!listaEventos) return;
    registrosEventosAdministracion.clear();
    listaEventos.innerHTML = eventos.map(evento => {
      registrosEventosAdministracion.set(String(evento.id), evento);
      const categoria = Array.isArray(evento.categories) ? evento.categories[0] : '';
      const fechaEvento = evento.date_start ? new Date(`${evento.date_start}T00:00:00`).toLocaleDateString('es-UY') : 'Fecha pendiente';
      const colorEvento = /^#[0-9a-f]{6}$/i.test(String(evento.color || '')) ? evento.color : '#16b3a3';
      const horaEvento = evento.event_time ? ` · ${String(evento.event_time).slice(0, 5)}` : '';
      const multimedia = analizarMultimediaEvento(evento.image_url);
      const imagen = multimedia.tipo === 'imagen'
        ? `<img src="${escaparTexto(multimedia.url)}" alt="" loading="lazy"><span class="administracion-evento-alternativa" aria-hidden="true">${simboloCategoriaEvento(evento.categories)}</span>`
        : `<span class="administracion-evento-alternativa" aria-hidden="true">${simboloCategoriaEvento(evento.categories)}</span>`;
      return `<li class="administracion-evento-elemento" style="--color-evento-administracion:${colorEvento}"><div class="administracion-evento-miniatura">${imagen}</div><div class="administracion-evento-resumen"><strong>${escaparTexto(evento.title || 'Evento sin t\u00edtulo')}</strong><span>${simboloCategoriaEvento(evento.categories)} ${escaparTexto(categoria || 'Evento')} | ${fechaEvento}${horaEvento}</span><small>${escaparTexto(evento.location || 'Lugar sin especificar')} | ${Number(evento.price) > 0 ? `$${escaparTexto(evento.price)}` : 'Gratis'}</small></div><div class="administracion-evento-acciones"><button type="button" class="administracion-evento-editar" data-editar-evento="${escaparTexto(evento.id)}" aria-label="Editar evento">Editar</button><button type="button" class="administracion-evento-eliminar" data-eliminar-evento="${escaparTexto(evento.id)}" aria-label="Eliminar evento" title="Eliminar evento">Eliminar</button></div></li>`;
    }).join('') || '<li class="administracion-evento-vacio interfaz-lista-estado">Todavía no hay eventos publicados.</li>';
    listaEventos.querySelectorAll('.administracion-evento-miniatura img').forEach(imagen => imagen.addEventListener('error', () => imagen.remove(), { once: true }));
  };
  let paginaEventos = 1;
  const cargarAdministracionEventos = async () => {
    if (!listaEventos) return;
    listaEventos.setAttribute('aria-busy', 'true'); listaEventos.innerHTML = '<li class="administracion-evento-vacio interfaz-lista-estado estado-cargando" role="status">Cargando eventos?</li>;'
    try {
      const consulta = new URLSearchParams({ page: paginaEventos, pageSize: 10, q: document.getElementById('administracion-eventos-busqueda')?.value || '' });
      const respuesta = await solicitarApiSigtur(`/api/admin/eventos?${consulta}`);
      representarEventosAdministracion(respuesta.data || []); listaEventos.setAttribute('aria-busy', 'false');
      const etiqueta = document.getElementById('administracion-eventos-pagina'); if (etiqueta) etiqueta.textContent = `Página ${paginaEventos} · ${respuesta.total} eventos`;
    } catch (fallo) {
      listaEventos.innerHTML = `<li class="administracion-evento-vacio interfaz-lista-estado estado-error" role="alert">${escaparTexto(fallo.message || 'No se pudieron cargar los eventos.')}</li>`; listaEventos.setAttribute('aria-busy', 'false');
    }
  };
  const actualizarVistaPreviaImagenEvento = () => {
    const urlImagen = String(entradaImagenEvento?.value || '').trim();
    if (!vistaPreviaImagenEvento || !imagenVistaPreviaEvento) return;
    if (!urlImagen) {
      vistaPreviaImagenEvento.hidden = true;
      imagenVistaPreviaEvento.removeAttribute('src');
      return;
    }
    const multimedia = analizarMultimediaEvento(urlImagen);
    const textoPrevia = vistaPreviaImagenEvento.querySelector('span');
    if (multimedia.tipo !== 'imagen') {
      imagenVistaPreviaEvento.hidden = true;
      imagenVistaPreviaEvento.removeAttribute('src');
      vistaPreviaImagenEvento.hidden = false;
      if (textoPrevia) textoPrevia.textContent = ['video', 'youtube', 'vimeo'].includes(multimedia.tipo)
        ? 'Video: se verá dentro de la ficha'
        : 'Es una página web: agregala en el enlace oficial';
      return;
    }
    imagenVistaPreviaEvento.hidden = false;
    if (textoPrevia) textoPrevia.textContent = 'Vista previa de portada';
    imagenVistaPreviaEvento.onload = () => { vistaPreviaImagenEvento.hidden = false; };
    imagenVistaPreviaEvento.onerror = () => { vistaPreviaImagenEvento.hidden = true; };
    imagenVistaPreviaEvento.src = multimedia.url;
  };
  entradaImagenEvento?.addEventListener('input', actualizarVistaPreviaImagenEvento);
  entradaImagenEvento?.addEventListener('change', actualizarVistaPreviaImagenEvento);
  cargarAdministracionEventos();
  document.querySelectorAll('[data-administracion-pagina="events"]').forEach(boton => boton.addEventListener('click', () => { paginaEventos = Math.max(1, paginaEventos + Number(boton.dataset.direction)); cargarAdministracionEventos(); }));
  document.getElementById('administracion-eventos-busqueda')?.addEventListener('input', () => { paginaEventos = 1; clearTimeout(window.adminEventsSearchTimer); window.adminEventsSearchTimer = setTimeout(cargarAdministracionEventos, 250); });
  let establecerPuntoEventoAdministracion = null;
  let limpiarMarcadorEventoAdministracion = () => {};
  if (elementoMapaEvento && latitudEvento && longitudEvento && window.L) {
    // El clic en el mapa completa las coordenadas que viajan al backend.
    const mapaEvento = L.map(elementoMapaEvento).setView([-31.383, -57.964], 13);
    L.tileLayer(window.SIGTUR_MAP_TILE_URL || 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', { maxZoom: 19, attribution: window.SIGTUR_MAP_TILE_ATTRIBUTION || '© OpenStreetMap contributors, © CARTO' }).addTo(mapaEvento);
    let marcadorEvento;
    const establecerPuntoEvento = (latitud, longitud) => {
      latitudEvento.value = latitud.toFixed(6);
      longitudEvento.value = longitud.toFixed(6);
      if (marcadorEvento) marcadorEvento.setLatLng([latitud, longitud]);
      else marcadorEvento = L.marker([latitud, longitud]).addTo(mapaEvento);
    };
    establecerPuntoEventoAdministracion = (latitud, longitud) => { establecerPuntoEvento(latitud, longitud); mapaEvento.setView([latitud, longitud], Math.max(mapaEvento.getZoom(), 15)); };
    limpiarMarcadorEventoAdministracion = () => { if (marcadorEvento) mapaEvento.removeLayer(marcadorEvento); marcadorEvento = null; };
    mapaEvento.on('click', clicEvento => establecerPuntoEvento(clicEvento.latlng.lat, clicEvento.latlng.lng));
    // Tambien permite pegar coordenadas manuales para ajustar el punto.
    [latitudEvento, longitudEvento].forEach(entrada => entrada.addEventListener('change', () => {
      if (!latitudEvento.value.trim() || !longitudEvento.value.trim()) return;
      const latitud = Number(latitudEvento.value);
      const longitud = Number(longitudEvento.value);
      if (Number.isFinite(latitud) && Number.isFinite(longitud)) {
        establecerPuntoEvento(latitud, longitud);
        mapaEvento.setView([latitud, longitud], Math.max(mapaEvento.getZoom(), 15));
      }
    }));
    const recalcularTamanoMapa = () => mapaEvento.invalidateSize({ pan: false });
    window.requestAnimationFrame(() => window.requestAnimationFrame(recalcularTamanoMapa));
    window.setTimeout(recalcularTamanoMapa, 250);
    if ('ResizeObserver' in window) new ResizeObserver(recalcularTamanoMapa).observe(elementoMapaEvento);
  }
  const usuariosLista = document.getElementById('administracion-usuarios-lista');
  const listaComentarios = document.getElementById('administracion-comentarios-lista');
  const administracionEstado = document.getElementById('administracion-recurso-estado');
  const mostrarEstadoRecurso = (mensaje) => { if (administracionEstado) administracionEstado.textContent = mensaje; };
  const normalizarResultadoPaginado = resultado => {
    let paginaAnidada = resultado;
    let total = resultado?.total;
    while (!Array.isArray(paginaAnidada) && paginaAnidada && typeof paginaAnidada === 'object') {
      total = paginaAnidada.total ?? total;
      paginaAnidada = paginaAnidada.data;
    }
    const filas = paginaAnidada;
    if (!Array.isArray(filas)) throw new Error('El servidor devolvió un formato inválido para esta lista.');
    return { data: filas, total: Number(total ?? filas.length) };
  };
  const representarUsuarios = (usuarios) => {
    if (!usuariosLista) return;
    usuariosLista.innerHTML = usuarios.map(usuario => `<li><span>${escaparTexto(usuario.nombre || 'Usuario')} · ${escaparTexto(usuario.correo)}</span><button type="button" data-ban-usuario="${usuario.id}" data-banned="${Boolean(usuario.banned)}">${usuario.banned ? 'Desbanear' : 'Banear 24 h'}</button></li>`).join('') || '<li>No hay usuarios.</li>';
  };
  const paginas = { users: 1, comments: 1, support: 1 };
  const cargarUsuarios = async () => {
    if (usuariosLista) { usuariosLista.setAttribute('aria-busy', 'true'); usuariosLista.innerHTML = '<li class="interfaz-lista-estado estado-cargando" role="status">Cargando usuarios…</li>'; }
    try {
      const consulta = new URLSearchParams({ page: paginas.users, pageSize: 10, q: document.getElementById('administracion-usuarios-busqueda')?.value || '' });
      const resultado = normalizarResultadoPaginado(await solicitarApiSigtur(`/api/admin/usuarios?${consulta}`));
      representarUsuarios(resultado.data || []);
      const etiqueta = document.getElementById('administracion-usuarios-pagina'); if (etiqueta) etiqueta.textContent = `Página ${paginas.users} · ${resultado.total} usuarios`;
    } catch (fallo) {
      if (usuariosLista) usuariosLista.innerHTML = `<li class="interfaz-lista-estado estado-error" role="alert">${escaparTexto(fallo.message || 'No se pudieron cargar los usuarios.')}</li>`;
      mostrarEstadoRecurso(fallo.message); throw fallo;
    } finally { usuariosLista?.setAttribute('aria-busy', 'false'); }
  };
  const cargarComentarios = async () => {
    if (listaComentarios) { listaComentarios.setAttribute('aria-busy', 'true'); listaComentarios.innerHTML = '<li class="interfaz-lista-estado estado-cargando" role="status">Cargando comentarios…</li>'; }
    try {
      const consulta = new URLSearchParams({ page: paginas.comments, pageSize: 10, q: document.getElementById('administracion-comentarios-busqueda')?.value || '' });
      const resultado = normalizarResultadoPaginado(await solicitarApiSigtur(`/api/admin/comentarios?${consulta}`));
      if (listaComentarios) listaComentarios.innerHTML = resultado.data.map(comentario => `<li><span>${comentario.fijado ? 'Fijado \u00b7 ' : ''}${escaparTexto(String(comentario.contenido || '').slice(0, 120))}</span><span><button type="button" data-pin-comentario="${comentario.id}" data-fijado="${Boolean(comentario.fijado)}">${comentario.fijado ? 'Desfijar' : 'Fijar'}</button><button type="button" data-eliminar-comentario="${comentario.id}">Borrar</button></span></li>`).join('') || '<li class="interfaz-lista-estado">No hay comentarios.</li>';
      const etiqueta = document.getElementById('administracion-comentarios-pagina'); if (etiqueta) etiqueta.textContent = `Página ${paginas.comments} · ${resultado.total} comentarios`;
    } catch (fallo) {
      if (listaComentarios) listaComentarios.innerHTML = `<li class="interfaz-lista-estado estado-error" role="alert">${escaparTexto(fallo.message || 'No se pudieron cargar los comentarios.')}</li>`;
      mostrarEstadoRecurso(fallo.message); throw fallo;
    } finally { listaComentarios?.setAttribute('aria-busy', 'false'); }
  };
  const cargarSoporte = async () => {
    const lista = document.getElementById('administracion-soporte-lista');
    if (lista) { lista.setAttribute('aria-busy', 'true'); lista.innerHTML = '<li class="interfaz-lista-estado estado-cargando" role="status">Cargando consultas?</li>'; }
    try {
      const consulta = new URLSearchParams({ page: paginas.support, pageSize: 10, status: document.getElementById('administracion-soporte-estado')?.value || '', type: document.getElementById('administracion-soporte-tipo')?.value || '' });
      const resultado = normalizarResultadoPaginado(await solicitarApiSigtur(`/api/admin/soporte?${consulta}`));
      if (lista) lista.innerHTML = resultado.data.map(tique => {
        const verificacion = tique.ticket_type === 'business_verification', detalles = tique.details || {};
        const tiposOrganizacion = { company: 'Empresa o comercio', nonprofit: 'Organización o asociación', tourism_service: 'Servicio turístico', independent_professional: 'Profesional independiente' };
        const filas = [
          ['Tipo de cuenta', tiposOrganizacion[detalles.organization_type] || detalles.organization_type],
          ['Nombre legal', detalles.legal_name], ['Nombre público', detalles.public_name],
          ['RUT o registro', detalles.registration_number], ['Teléfono', detalles.phone],
          ['Dirección', detalles.address], ['Localidad', detalles.locality],
          ['Web o red social', detalles.website], ['Enlace de referencia', detalles.evidence_url],
          ['ID de cuenta', tique.user_id],
        ].filter(([, valor]) => valor);
        const marcadoDetalles = verificacion ? `<details class="administracion-verificacion-datos"><summary>Ver datos de verificación</summary><dl>${filas.map(([etiqueta, valor]) => `<div><dt>${escaparTexto(etiqueta)}</dt><dd>${escaparTexto(valor)}</dd></div>`).join('')}</dl></details>` : '';
        return `<li class="administracion-soporte-entrada ${verificacion ? 'estado-verificacion' : ''}"><div class="administracion-soporte-entrada-contenido"><span><strong>${verificacion ? 'Verificación de cuenta' : escaparTexto(tique.topic)}</strong> · ${escaparTexto(tique.name)} (${escaparTexto(tique.email)})</span><p>${escaparTexto(tique.message.slice(0, 500))}</p>${marcadoDetalles}<small>${escaparTexto(tique.created_at ? new Date(tique.created_at).toLocaleString('es-UY') : '')}</small></div><select data-entrada-estado="${escaparTexto(tique.id)}" aria-label="Estado del ticket"><option value="open" ${tique.status === 'open' ? 'selected' : ''}>Abierta</option><option value="in_progress" ${tique.status === 'in_progress' ? 'selected' : ''}>En curso</option><option value="resolved" ${tique.status === 'resolved' ? 'selected' : ''}>Resuelta</option></select></li>`;
      }).join('') || '<li class="interfaz-lista-estado">No hay consultas.</li>';
      const etiqueta = document.getElementById('administracion-soporte-pagina'); if (etiqueta) etiqueta.textContent = `Página ${paginas.support} · ${resultado.total} consultas`;
    } catch (fallo) {
      if (lista) lista.innerHTML = `<li class="interfaz-lista-estado estado-error" role="alert">${escaparTexto(fallo.message || 'No se pudieron cargar las consultas.')}</li>`;
      mostrarEstadoRecurso(fallo.message); throw fallo;
    } finally { lista?.setAttribute('aria-busy', 'false'); }
  };
  try { await Promise.all([cargarUsuarios(), cargarComentarios(), cargarSoporte()]); } catch (fallo) { mostrarEstadoRecurso(fallo.message); }
  document.querySelectorAll('[data-administracion-pagina]').forEach(boton => boton.addEventListener('click', async () => { const clave = boton.dataset.administracionPagina; paginas[clave] = Math.max(1, paginas[clave] + Number(boton.dataset.direction)); try { await ({ users: cargarUsuarios, comments: cargarComentarios, support: cargarSoporte })[clave](); } catch (fallo) { mostrarEstadoRecurso(fallo.message); } }));
  [['admin-users-search','users',cargarUsuarios],['admin-comments-search','comments',cargarComentarios]].forEach(([identificador,clave,cargador]) => document.getElementById(identificador)?.addEventListener('input', () => { paginas[clave] = 1; clearTimeout(window.adminSearchTimer); window.adminSearchTimer = setTimeout(() => cargador().catch(fallo => mostrarEstadoRecurso(fallo.message)), 250); }));
  document.getElementById('administracion-soporte-estado')?.addEventListener('change', () => { paginas.support = 1; cargarSoporte().catch(fallo => mostrarEstadoRecurso(fallo.message)); });
  document.getElementById('administracion-soporte-tipo')?.addEventListener('change', () => { paginas.support = 1; cargarSoporte().catch(fallo => mostrarEstadoRecurso(fallo.message)); });
  document.getElementById('administracion-soporte-lista')?.addEventListener('change', async evento => { const seleccionar = evento.target.closest('[data-entrada-estado]'); if (!seleccionar) return; try { await solicitarApiSigtur(`/api/admin/soporte/${seleccionar.dataset.entradaEstado}`, { method: 'PATCH', body: JSON.stringify({ status: seleccionar.value }) }); await cargarSoporte(); } catch (fallo) { mostrarEstadoRecurso(fallo.message); } });
  const restablecerEditorEvento = () => {
    formularioEvento?.reset();
    if (formularioEvento) delete formularioEvento.dataset.editingId;
    if (tituloFormularioEvento) tituloFormularioEvento.textContent = 'Crear evento';
    if (enviarEvento) enviarEvento.textContent = 'Publicar evento';
    if (cancelarEvento) cancelarEvento.hidden = true;
    limpiarMarcadorEventoAdministracion();
    actualizarVistaPreviaImagenEvento();
  };
  const iniciarEdicionEvento = (registroEvento) => {
    if (!formularioEvento || !registroEvento) return;
    const multimediaExistente = analizarMultimediaEvento(registroEvento.image_url);
    const enlaceExistente = obtenerEnlaceWebEvento(registroEvento.link) || (multimediaExistente.tipo === 'enlace' ? multimediaExistente.url : '');
    const campos = {
      title: registroEvento.title,
      description: registroEvento.description,
      location: registroEvento.location,
      latitude: registroEvento.latitude,
      longitude: registroEvento.longitude,
      date_start: registroEvento.date_start,
      date_end: registroEvento.date_end,
      event_time: registroEvento.event_time,
      price: registroEvento.price ?? 0,
      color: registroEvento.color || '#16b3a3',
      image_url: multimediaExistente.tipo === 'enlace' ? '' : registroEvento.image_url,
      link: enlaceExistente,
    };
    Object.entries(campos).forEach(([nombre, valor]) => {
      const entrada = formularioEvento.elements.namedItem(nombre);
      if (entrada) entrada.value = valor ?? '';
    });
    const categoria = (Array.isArray(registroEvento.categories) ? registroEvento.categories[0] : '') || 'cultura';
    const claveCategoria = String(categoria).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    formularioEvento.elements.namedItem('category').value = claveCategoria;
    formularioEvento.dataset.editingId = registroEvento.id;
    if (registroEvento.latitude != null && registroEvento.longitude != null) {
      const latitud = Number(registroEvento.latitude), longitud = Number(registroEvento.longitude);
      if (Number.isFinite(latitud) && Number.isFinite(longitud)) establecerPuntoEventoAdministracion?.(latitud, longitud);
    }
    if (tituloFormularioEvento) tituloFormularioEvento.textContent = 'Editar evento';
    if (enviarEvento) enviarEvento.textContent = 'Guardar cambios';
    if (cancelarEvento) cancelarEvento.hidden = false;
    actualizarVistaPreviaImagenEvento();
    mostrarEstadoRecurso(`Editando: ${registroEvento.title || 'evento'}.`);
    formularioEvento.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  cancelarEvento?.addEventListener('click', restablecerEditorEvento);
  formularioEvento?.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    const datos = new FormData(formularioEvento);
    const identificadorEnEdicion = formularioEvento.dataset.editingId;
    const metodo = identificadorEnEdicion ? 'PATCH' : 'POST';
    const urlMultimedia = String(datos.get('image_url') || '').trim();
    const multimediaEvento = analizarMultimediaEvento(urlMultimedia);
    const urlInformacion = obtenerEnlaceWebEvento(datos.get('link')) || (multimediaEvento.tipo === 'enlace' ? multimediaEvento.url : '');
    const urlImagenFicha = multimediaEvento.tipo === 'enlace' ? '' : urlMultimedia;
    const url = identificadorEnEdicion ? `/api/admin/eventos/${encodeURIComponent(identificadorEnEdicion)}` : '/api/admin/eventos';
    if (enviarEvento) { enviarEvento.disabled = true; enviarEvento.textContent = 'Guardando?'; }
    try {
      await solicitarApiSigtur(url, { method: metodo, body: JSON.stringify({ title: datos.get('title'), description: datos.get('description'), date_start: datos.get('date_start'), date_end: datos.get('date_end'), event_time: datos.get('event_time'), location: datos.get('location'), latitude: datos.get('latitude'), longitude: datos.get('longitude'), price: datos.get('price'), color: datos.get('color'), image_url: urlImagenFicha, link: urlInformacion, categories: [datos.get('category')] }) });
      restablecerEditorEvento();
      mostrarEstadoRecurso(identificadorEnEdicion ? 'Evento actualizado correctamente.' : 'Evento creado correctamente.');
      await cargarAdministracionEventos();
    } catch (fallo) {
      mostrarEstadoRecurso(fallo.message);
    } finally {
      if (enviarEvento) { enviarEvento.disabled = false; enviarEvento.textContent = formularioEvento.dataset.editingId ? 'Guardar cambios' : 'Publicar evento'; }
    }
  });
  listaEventos?.addEventListener('click', async (evento) => {
    const botonEditar = evento.target.closest('[data-editar-evento]');
    if (botonEditar) {
      const grabacion = registrosEventosAdministracion.get(String(botonEditar.dataset.editarEvento));
      if (grabacion) iniciarEdicionEvento(grabacion);
      else mostrarEstadoRecurso('No se pudo encontrar ese evento. Actualiza la lista e intenta nuevamente.');
      return;
    }
    const boton = evento.target.closest('[data-eliminar-evento]');
    if (!boton || !window.confirm('Eliminar este evento? Esta accion no se puede deshacer.')) return;
    boton.disabled = true;
    try {
      await solicitarApiSigtur(`/api/admin/eventos/${encodeURIComponent(boton.dataset.eliminarEvento)}`, { method: 'DELETE' });
      if (formularioEvento?.dataset.editingId === boton.dataset.eliminarEvento) restablecerEditorEvento();
      mostrarEstadoRecurso('Evento eliminado.');
      await cargarAdministracionEventos();
    } catch (fallo) {
      boton.disabled = false;
      mostrarEstadoRecurso(fallo.message || 'No se pudo eliminar el evento.');
    }
  });
  usuariosLista?.addEventListener('click', async (evento) => {
    const boton = evento.target.closest('[data-ban-usuario]');
    if (!boton) return;
    try {
      const duracion = boton.dataset.banned === 'true' ? 'none' : '24h';
      await solicitarApiSigtur(`/api/admin/usuarios/${boton.dataset.banUsuario}/baneo`, { method: 'PATCH', body: JSON.stringify({ duration: duracion }) });
      boton.dataset.banned = duracion === 'none' ? 'false' : 'true';
      boton.textContent = duracion === 'none' ? 'Banear 24 h' : 'Desbanear';
      mostrarEstadoRecurso(duracion === 'none' ? 'Usuario desbaneado.' : 'Usuario baneado por 24 horas.');
    } catch (fallo) { mostrarEstadoRecurso(fallo.message); }
  });
  listaComentarios?.addEventListener('click', async evento => {
    const botonMarcador = evento.target.closest('[data-pin-comentario]');
    if (botonMarcador) {
      try {
        const fijado = botonMarcador.dataset.fijado !== 'true';
        await solicitarApiSigtur(`/api/admin/comentarios/${botonMarcador.dataset.pinComentario}/fijado`, { method: 'PATCH', body: JSON.stringify({ fijado: fijado }) });
        botonMarcador.dataset.fijado = String(fijado);
        botonMarcador.textContent = fijado ? 'Desfijar' : 'Fijar';
        const texto = botonMarcador.closest('li')?.querySelector('span');
        if (texto) texto.innerHTML = `${fijado ? '📌 ' : ''}${texto.textContent.replace(/^📌\s*/, '')}`;
        mostrarEstadoRecurso(fijado ? 'Comentario fijado.' : 'Comentario desfijado.');
      } catch (fallo) { mostrarEstadoRecurso(fallo.message); }
      return;
    }
    const boton = evento.target.closest('[data-eliminar-comentario]');
    if (!boton || !window.confirm('¿Borrar este comentario?')) return;
    try {
      await solicitarApiSigtur(`/api/admin/comentarios/${boton.dataset.eliminarComentario}`, { method: 'DELETE' });
      boton.closest('li')?.remove();
      mostrarEstadoRecurso('Comentario borrado.');
    } catch (fallo) { mostrarEstadoRecurso(fallo.message); }
  });
}

// ============================================================================
// setupSupportPage() — envía las consultas al backend y carga el historial
// del usuario autenticado desde la API de soporte.
// ============================================================================
async function cargarConfiguracionPublica() {
  try {
    const sitio = await solicitarApiSigtur('/api/public/site');
    let cartel = document.getElementById('sitio-anuncio');
    if (sitio.announcement?.title && !cartel) { cartel = document.createElement('aside'); cartel.id = 'sitio-anuncio'; cartel.className = 'sitio-anuncio'; document.body.prepend(cartel); }
    if (cartel) { cartel.hidden = !sitio.announcement?.title; cartel.textContent = sitio.announcement?.title ? `${sitio.announcement.title}: ${sitio.announcement.body}` : ''; }
    if (sitio.settings?.showSupport === false) document.querySelectorAll('a[href*="soporte.html"]').forEach(enlace => { enlace.hidden = true; });
    let mantenimiento = document.getElementById('sitio-maintenance-aviso');
    if (sitio.settings?.maintenanceMode && !mantenimiento) { mantenimiento = document.createElement('aside'); mantenimiento.id = 'sitio-maintenance-aviso'; mantenimiento.className = 'sitio-anuncio'; mantenimiento.textContent = 'Estamos realizando tareas de mantenimiento. Algunas funciones pueden cambiar temporalmente.'; document.body.prepend(mantenimiento); }
    if (mantenimiento) mantenimiento.hidden = !sitio.settings?.maintenanceMode;
  } catch { /* el sitio sigue disponible si el backend temporalmente no responde */ }
}

function configurarPaginaSoporte() {
  const formulario = document.getElementById('soporte-formulario');
  if (!formulario) return;

  const lista = document.getElementById('soporte-entrada-lista');
  const estado = document.getElementById('soporte-estado');
  const tema = formulario.elements.namedItem('topic');
  const camposVerificacion = document.getElementById('soporte-negocio-fields');
  const etiquetaMensaje = document.getElementById('soporte-mensaje-rotulo');
  const campoMensaje = formulario.elements.namedItem('message');
  const actualizarCamposVerificacion = () => {
    const verificacion = tema?.value === 'business_verification';
    if (camposVerificacion) { camposVerificacion.hidden = !verificacion; camposVerificacion.disabled = !verificacion; }
    if (etiquetaMensaje) etiquetaMensaje.textContent = verificacion ? 'Actividad y motivo de la solicitud' : 'Mensaje';
    if (campoMensaje) campoMensaje.placeholder = verificacion
      ? 'Contanos qué servicios ofrecen y por qué solicitan la verificación.'
      : 'Contanos qué necesitás revisar.';
    if (verificacion && !obtenerSesionSigtur()?.token && estado)
      estado.textContent = 'Iniciá sesión con la cuenta que querés verificar para enviar esta solicitud.';
    else if (estado && estado.textContent.startsWith('Iniciá sesión')) estado.textContent = 'Listo';
  };
  tema?.addEventListener('change', actualizarCamposVerificacion);
  formulario.addEventListener('reset', () => window.setTimeout(actualizarCamposVerificacion, 0));
  actualizarCamposVerificacion();

  const representar = entradas => {
    if (!lista) return;
    lista.innerHTML = entradas.length ? entradas.map(tique => `<article class="soporte-entrada"><div><strong>${escaparTexto(tique.topic)}</strong><span>${escaparTexto(tique.name)} · ${escaparTexto(tique.email)}</span></div><p>${escaparTexto(tique.message)}</p><small>${escaparTexto(new Date(tique.created_at).toLocaleString('es-UY'))} · ${escaparTexto(tique.status)}</small></article>`).join('') : '<p class="vacio-estado">Todavía no hay tickets.</p>';
  };
  const cargarPropios = async () => {
    if (!obtenerSesionSigtur()?.token || !lista) return;
    lista.textContent = 'Cargando tus consultas…';
    try { const resultado = await solicitarApiSigtur('/api/soporte/mios?page=1&pageSize=5'); representar(resultado.data || []); }
    catch { lista.textContent = 'No se pudieron cargar tus consultas.'; }
  };
  cargarPropios();
  formulario.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    const datos = new FormData(formulario);
    const verificacion = datos.get('topic') === 'business_verification';
    const tique = {
      // crypto.randomUUID genera un id único, el fallback es Date.now() para browsers viejos
      name: String(datos.get('name') || '').trim(),
      email: String(datos.get('email') || '').trim(),
      topic: String(tema?.selectedOptions?.[0]?.textContent || 'General').trim(),
      message: String(datos.get('message') || '').trim(),
      ticket_type: verificacion ? 'business_verification' : 'general',
      details: verificacion ? {
        organization_type: datos.get('organization_type'),
        legal_name: datos.get('legal_name'),
        public_name: datos.get('public_name'),
        registration_number: datos.get('registration_number'),
        phone: datos.get('phone'),
        website: datos.get('website'),
        evidence_url: datos.get('evidence_url'),
        address: datos.get('address'),
        locality: datos.get('locality'),
        authorization: datos.get('authorization') === 'on'
      } : {}
    };
    if (!tique.name || !tique.email || !tique.message) {
      if (estado) estado.textContent = 'Completa los campos requeridos';
      return;
    }
    if (verificacion && !obtenerSesionSigtur()?.token) {
      if (estado) estado.textContent = 'Iniciá sesión con la cuenta que querés verificar para enviar esta solicitud.';
      return;
    }
    if (estado) estado.textContent = 'Enviando consulta…';
    try { const resultado = await solicitarApiSigtur('/api/soporte', { method: 'POST', body: JSON.stringify(tique) }); formulario.reset(); actualizarCamposVerificacion(); if (estado) estado.textContent = `Consulta recibida (${resultado.data.id.slice(0, 8)}).`; await cargarPropios(); }
    catch (fallo) { if (estado) estado.textContent = fallo.message || 'No se pudo enviar la consulta. Intentá nuevamente.'; }
  });
}
