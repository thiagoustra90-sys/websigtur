(() => {
  // Completar con la URL HTTPS pública del servicio backend en Render.
  const publicBackendUrl = 'https://websigtur.onrender.com';
  const localHosts = ['localhost', '127.0.0.1'];
  const isLocalDevelopment = localHosts.includes(window.location.hostname);
  const backendUrl = publicBackendUrl || (isLocalDevelopment ? 'http://localhost:3000' : '');

  window.SIGTUR_BACKEND_URL = backendUrl.replace(/\/+$/, '');
})();