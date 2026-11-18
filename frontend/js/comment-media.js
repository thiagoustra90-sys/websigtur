(() => {
  const ARCHIVOS_MAXIMOS = 3;
  const BYTES_MAXIMOS = 5 * 1024 * 1024;
  const TIPOS_ACEPTADOS = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

  const escaparHtml = valor => String(valor ?? '').replace(/[&<>"']/g, caracter => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[caracter]);

  async function subirArchivo(archivo) {
    const solicitud = window.sigturApiFetch || window.sigturInteractionFetch;
    if (typeof solicitud === 'function') {
      return solicitud('/api/comentarios/medios', {
        method: 'POST',
        headers: { 'Content-Type': archivo.type },
        body: archivo,
      });
    }

    const baseApi = window.SIGTUR_BACKEND_URL || '';
    let sesion = null;
    try { sesion = JSON.parse(localStorage.getItem('sigtur-session') || 'null'); } catch { /* no hay sesión local */ }
    const enviar = async () => {
      const respuesta = await fetch(`${baseApi}/api/comentarios/medios`, {
        method: 'POST',
        headers: { 'Content-Type': archivo.type, ...(sesion?.token ? { Authorization: `Bearer ${sesion.token}` } : {}) },
        body: archivo,
      });
      const resultado = await respuesta.json().catch(() => null);
      if (!respuesta.ok) throw Object.assign(new Error(resultado?.error || 'No se pudo subir la imagen.'), { status: respuesta.status });
      return resultado;
    };

    try {
      return await enviar();
    } catch (fallo) {
      if (fallo.status !== 401 || !sesion?.refreshToken) throw fallo;
      const actualizar = await fetch(`${baseApi}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: sesion.refreshToken }),
      });
      const renovado = await actualizar.json().catch(() => null);
      if (!actualizar.ok || !renovado?.token) throw fallo;
      sesion = { ...sesion, ...renovado, usuario: renovado.usuario || sesion.usuario };
      localStorage.setItem('sigtur-session', JSON.stringify(sesion));
      return enviar();
    }
  }

  window.sigturCommentMediaMarkup = urlsMultimedia => {
    if (!Array.isArray(urlsMultimedia)) return '';
    const adjuntos = urlsMultimedia.map((urlOriginal, indice) => {
      try {
        const url = new URL(urlOriginal, window.location.href);
        if (!['http:', 'https:'].includes(url.protocol)) return '';
        const urlSegura = escaparHtml(url.href);
        return `<figure class="comment-attachment"><a href="${urlSegura}" target="_blank" rel="noopener noreferrer"><img src="${urlSegura}" alt="Imagen adjunta al comentario ${indice + 1}" loading="lazy"></a></figure>`;
      } catch {
        return '';
      }
    }).join('');
    return adjuntos ? `<div class="comment-attachments">${adjuntos}</div>` : '';
  };

  function mejorarFormulario(formulario) {
    if (formulario.dataset.mediaReady) return;
    formulario.dataset.mediaReady = 'true';
    formulario._commentMediaFiles = [];

    const selector = document.createElement('div');
    selector.className = 'comment-media-controls';
    const entrada = document.createElement('input');
    entrada.type = 'file';
    entrada.accept = [...TIPOS_ACEPTADOS].join(',');
    entrada.multiple = true;
    entrada.hidden = true;
    entrada.className = 'comment-media-input';

    const boton = document.createElement('button');
    boton.type = 'button';
    boton.className = 'comment-media-picker';
    boton.textContent = '＋ Adjuntar imágenes o GIF';
    boton.addEventListener('click', () => entrada.click());

    const estado = document.createElement('span');
    estado.className = 'comment-media-status';
    estado.setAttribute('aria-live', 'polite');
    estado.textContent = 'Hasta 3 archivos · 5 MB cada uno';

    const vistaPrevia = document.createElement('div');
    vistaPrevia.className = 'comment-media-preview';
    selector.append(entrada, boton, estado, vistaPrevia);

    const enviar = formulario.querySelector('[type="submit"]');
    if (enviar) formulario.insertBefore(selector, enviar);
    else formulario.appendChild(selector);

    const dibujarVistaPrevia = () => {
      (formulario._commentPreviewUrls || []).forEach(URL.revokeObjectURL);
      formulario._commentPreviewUrls = [];
      vistaPrevia.replaceChildren();
      formulario._commentMediaFiles.forEach((archivo, indice) => {
        const tarjeta = document.createElement('span');
        tarjeta.className = 'comment-media-preview-item';
        const imagen = document.createElement('img');
        imagen.src = URL.createObjectURL(archivo);
        formulario._commentPreviewUrls.push(imagen.src);
        imagen.alt = `Vista previa: ${archivo.name}`;
        const quitar = document.createElement('button');
        quitar.type = 'button';
        quitar.className = 'comment-media-remove';
        quitar.setAttribute('aria-label', `Quitar ${archivo.name}`);
        quitar.textContent = '×';
        quitar.addEventListener('click', () => {
          formulario._commentMediaFiles.splice(indice, 1);
          dibujarVistaPrevia();
        });
        tarjeta.append(imagen, quitar);
        vistaPrevia.appendChild(tarjeta);
      });
      estado.textContent = formulario._commentMediaFiles.length
        ? `${formulario._commentMediaFiles.length} de ${ARCHIVOS_MAXIMOS} archivos seleccionados`
        : 'Hasta 3 archivos · 5 MB cada uno';
    };

    entrada.addEventListener('change', () => {
      const restante = ARCHIVOS_MAXIMOS - formulario._commentMediaFiles.length;
      const elegido = [...entrada.files];
      const valido = elegido.filter(archivo => TIPOS_ACEPTADOS.has(archivo.type) && archivo.size <= BYTES_MAXIMOS);
      const aceptado = valido.slice(0, Math.max(restante, 0));
      formulario._commentMediaFiles.push(...aceptado);
      entrada.value = '';
      dibujarVistaPrevia();
      if (elegido.some(archivo => !TIPOS_ACEPTADOS.has(archivo.type) || archivo.size > BYTES_MAXIMOS)) {
        estado.textContent = 'Formato no admitido o archivo mayor a 5 MB.';
      } else if (aceptado.length < elegido.length) {
        estado.textContent = `Podés adjuntar hasta ${ARCHIVOS_MAXIMOS} archivos.`;
      }
    });
  }

  const observador = new MutationObserver(registros => {
    registros.forEach(grabacion => grabacion.addedNodes.forEach(nodo => {
      if (!(nodo instanceof Element)) return;
      if (nodo.matches('form[data-comment-media-form]')) mejorarFormulario(nodo);
      nodo.querySelectorAll?.('form[data-comment-media-form]').forEach(mejorarFormulario);
    }));
  });
  observador.observe(document.documentElement, { childList: true, subtree: true });
  document.querySelectorAll('form[data-comment-media-form]').forEach(mejorarFormulario);

  window.sigturPrepareCommentMedia = async formulario => {
    const archivos = formulario?._commentMediaFiles || [];
    if (!archivos.length) return [];
    if (archivos.length > ARCHIVOS_MAXIMOS) throw new Error(`Podés adjuntar hasta ${ARCHIVOS_MAXIMOS} imágenes.`);

    const rutas = [];
    for (let indice = 0; indice < archivos.length; indice += 1) {
      const archivo = archivos[indice];
      if (!TIPOS_ACEPTADOS.has(archivo.type) || archivo.size > BYTES_MAXIMOS) throw new Error('Adjuntá JPG, PNG, WebP o GIF de hasta 5 MB.');
      const estado = formulario.querySelector('.comment-media-status');
      if (estado) estado.textContent = `Subiendo imagen ${indice + 1} de ${archivos.length}…`;
      const resultado = await subirArchivo(archivo);
      if (!resultado?.path) throw new Error('No se pudo completar la carga de la imagen.');
      rutas.push(resultado.path);
    }
    return rutas;
  };

  window.sigturClearCommentMedia = formulario => {
    if (!formulario) return;
    formulario._commentMediaFiles = [];
    (formulario._commentPreviewUrls || []).forEach(URL.revokeObjectURL);
    formulario._commentPreviewUrls = [];
    const entrada = formulario.querySelector('.comment-media-input');
    if (entrada) entrada.value = '';
    const vistaPrevia = formulario.querySelector('.comment-media-preview');
    if (vistaPrevia) vistaPrevia.replaceChildren();
    const estado = formulario.querySelector('.comment-media-status');
    if (estado) estado.textContent = 'Hasta 3 archivos · 5 MB cada uno';
  };
})();
