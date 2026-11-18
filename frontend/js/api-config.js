(() => {
  // En producción usa el mismo origen; en local se conecta al backend Express.
  const publicBackendUrl = window.location.protocol === 'https:'
    ? window.location.origin
    : '';
  const localHosts = ['localhost', '127.0.0.1'];
  const isLocalDevelopment = localHosts.includes(window.location.hostname);
  const backendUrl = publicBackendUrl || (isLocalDevelopment ? 'http://localhost:3000' : '');

  window.SIGTUR_BACKEND_URL = backendUrl.replace(/\/+$/, '');
})();