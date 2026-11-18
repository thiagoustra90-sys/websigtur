(() => {
  // En producción usa el mismo origen; en local se conecta al backend Express.
  const urlPublicaServidor = window.location.protocol === 'https:'
    ? window.location.origin
    : '';
  const servidoresLocales = ['localhost', '127.0.0.1'];
  const esDesarrolloLocal = servidoresLocales.includes(window.location.hostname);
  const urlServidor = urlPublicaServidor || (esDesarrolloLocal ? 'http://localhost:3000' : '');

  window.SIGTUR_BACKEND_URL = urlServidor.replace(/\/+$/, '');
})();