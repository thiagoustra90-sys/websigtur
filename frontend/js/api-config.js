(() => {
  // En producción usa el mismo origen; en local se conecta al backend Express.
  const urlPublicaServidor = window.location.protocol === 'https:'
    ? window.location.origin
    : '';
  const servidoresLocales = ['localhost', '127.0.0.1'];
  const esDesarrolloLocal = servidoresLocales.includes(window.location.hostname);
  const urlServidor = urlPublicaServidor || (esDesarrolloLocal ? 'http://localhost:3000' : '');

  window.SIGTUR_BACKEND_URL = urlServidor.replace(/\/+$/, '');
  // Los mosaicos de CARTO requieren una clave propia para el uso desplegado.
  // Es una clave pública del navegador: restrínjala por dominio en CARTO.
  window.SIGTUR_MAP_TILE_KEY = window.SIGTUR_MAP_TILE_KEY || 'cb1_5bx4_1_e5f67b9d149ae8a7c51753ee';
  const plantillaMosaicos = window.SIGTUR_MAP_TILE_URL || 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
  window.SIGTUR_MAP_TILE_URL = window.SIGTUR_MAP_TILE_KEY
    ? `${plantillaMosaicos}?key=${encodeURIComponent(window.SIGTUR_MAP_TILE_KEY)}`
    : plantillaMosaicos;
  window.SIGTUR_MAP_TILE_ATTRIBUTION = '© OpenStreetMap contributors, © CARTO';
})();
