(() => {
  const MAX_FILES = 3;
  const MAX_BYTES = 5 * 1024 * 1024;
  const ACCEPTED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[char]);

  async function uploadFile(file) {
    const request = window.sigturApiFetch || window.sigturInteractionFetch;
    if (typeof request === 'function') {
      return request('/api/comentarios/medios', {
        method: 'POST',
        headers: { 'Content-Type': file.type },
        body: file,
      });
    }

    const apiBase = window.SIGTUR_BACKEND_URL || '';
    let session = null;
    try { session = JSON.parse(localStorage.getItem('sigtur-session') || 'null'); } catch { /* no hay sesión local */ }
    const send = async () => {
      const response = await fetch(`${apiBase}/api/comentarios/medios`, {
        method: 'POST',
        headers: { 'Content-Type': file.type, ...(session?.token ? { Authorization: `Bearer ${session.token}` } : {}) },
        body: file,
      });
      const result = await response.json().catch(() => null);
      if (!response.ok) throw Object.assign(new Error(result?.error || 'No se pudo subir la imagen.'), { status: response.status });
      return result;
    };

    try {
      return await send();
    } catch (error) {
      if (error.status !== 401 || !session?.refreshToken) throw error;
      const refresh = await fetch(`${apiBase}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: session.refreshToken }),
      });
      const renewed = await refresh.json().catch(() => null);
      if (!refresh.ok || !renewed?.token) throw error;
      session = { ...session, ...renewed, usuario: renewed.usuario || session.usuario };
      localStorage.setItem('sigtur-session', JSON.stringify(session));
      return send();
    }
  }

  window.sigturCommentMediaMarkup = mediaUrls => {
    if (!Array.isArray(mediaUrls)) return '';
    const attachments = mediaUrls.map((rawUrl, index) => {
      try {
        const url = new URL(rawUrl, window.location.href);
        if (!['http:', 'https:'].includes(url.protocol)) return '';
        const safeUrl = escapeHtml(url.href);
        return `<figure class="comment-attachment"><a href="${safeUrl}" target="_blank" rel="noopener noreferrer"><img src="${safeUrl}" alt="Imagen adjunta al comentario ${index + 1}" loading="lazy"></a></figure>`;
      } catch {
        return '';
      }
    }).join('');
    return attachments ? `<div class="comment-attachments">${attachments}</div>` : '';
  };

  function enhance(form) {
    if (form.dataset.mediaReady) return;
    form.dataset.mediaReady = 'true';
    form._commentMediaFiles = [];

    const picker = document.createElement('div');
    picker.className = 'comment-media-controls';
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = [...ACCEPTED_TYPES].join(',');
    input.multiple = true;
    input.hidden = true;
    input.className = 'comment-media-input';

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'comment-media-picker';
    button.textContent = '＋ Adjuntar imágenes o GIF';
    button.addEventListener('click', () => input.click());

    const status = document.createElement('span');
    status.className = 'comment-media-status';
    status.setAttribute('aria-live', 'polite');
    status.textContent = 'Hasta 3 archivos · 5 MB cada uno';

    const preview = document.createElement('div');
    preview.className = 'comment-media-preview';
    picker.append(input, button, status, preview);

    const submit = form.querySelector('[type="submit"]');
    if (submit) form.insertBefore(picker, submit);
    else form.appendChild(picker);

    const drawPreview = () => {
      (form._commentPreviewUrls || []).forEach(URL.revokeObjectURL);
      form._commentPreviewUrls = [];
      preview.replaceChildren();
      form._commentMediaFiles.forEach((file, index) => {
        const card = document.createElement('span');
        card.className = 'comment-media-preview-item';
        const image = document.createElement('img');
        image.src = URL.createObjectURL(file);
        form._commentPreviewUrls.push(image.src);
        image.alt = `Vista previa: ${file.name}`;
        const remove = document.createElement('button');
        remove.type = 'button';
        remove.className = 'comment-media-remove';
        remove.setAttribute('aria-label', `Quitar ${file.name}`);
        remove.textContent = '×';
        remove.addEventListener('click', () => {
          form._commentMediaFiles.splice(index, 1);
          drawPreview();
        });
        card.append(image, remove);
        preview.appendChild(card);
      });
      status.textContent = form._commentMediaFiles.length
        ? `${form._commentMediaFiles.length} de ${MAX_FILES} archivos seleccionados`
        : 'Hasta 3 archivos · 5 MB cada uno';
    };

    input.addEventListener('change', () => {
      const remaining = MAX_FILES - form._commentMediaFiles.length;
      const chosen = [...input.files];
      const valid = chosen.filter(file => ACCEPTED_TYPES.has(file.type) && file.size <= MAX_BYTES);
      const accepted = valid.slice(0, Math.max(remaining, 0));
      form._commentMediaFiles.push(...accepted);
      input.value = '';
      drawPreview();
      if (chosen.some(file => !ACCEPTED_TYPES.has(file.type) || file.size > MAX_BYTES)) {
        status.textContent = 'Formato no admitido o archivo mayor a 5 MB.';
      } else if (accepted.length < chosen.length) {
        status.textContent = `Podés adjuntar hasta ${MAX_FILES} archivos.`;
      }
    });
  }

  const observer = new MutationObserver(records => {
    records.forEach(record => record.addedNodes.forEach(node => {
      if (!(node instanceof Element)) return;
      if (node.matches('form[data-comment-media-form]')) enhance(node);
      node.querySelectorAll?.('form[data-comment-media-form]').forEach(enhance);
    }));
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
  document.querySelectorAll('form[data-comment-media-form]').forEach(enhance);

  window.sigturPrepareCommentMedia = async form => {
    const files = form?._commentMediaFiles || [];
    if (!files.length) return [];
    if (files.length > MAX_FILES) throw new Error(`Podés adjuntar hasta ${MAX_FILES} imágenes.`);

    const paths = [];
    for (let index = 0; index < files.length; index += 1) {
      const file = files[index];
      if (!ACCEPTED_TYPES.has(file.type) || file.size > MAX_BYTES) throw new Error('Adjuntá JPG, PNG, WebP o GIF de hasta 5 MB.');
      const status = form.querySelector('.comment-media-status');
      if (status) status.textContent = `Subiendo imagen ${index + 1} de ${files.length}…`;
      const result = await uploadFile(file);
      if (!result?.path) throw new Error('No se pudo completar la carga de la imagen.');
      paths.push(result.path);
    }
    return paths;
  };

  window.sigturClearCommentMedia = form => {
    if (!form) return;
    form._commentMediaFiles = [];
    (form._commentPreviewUrls || []).forEach(URL.revokeObjectURL);
    form._commentPreviewUrls = [];
    const input = form.querySelector('.comment-media-input');
    if (input) input.value = '';
    const preview = form.querySelector('.comment-media-preview');
    if (preview) preview.replaceChildren();
    const status = form.querySelector('.comment-media-status');
    if (status) status.textContent = 'Hasta 3 archivos · 5 MB cada uno';
  };
})();
