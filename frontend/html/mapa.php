<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Mapa SIGTUR · Salto</title>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css">
  <link rel="stylesheet" href="../css/font.css">
  <link rel="stylesheet" href="../css/comment-media.css">
  <style>
    :root{--tinta:#16312d;--atenuado:#60746f;--linea:#d7e4e0;--papel:#fff;--marca:#087f72;--suave:#eff8f6;--patrimonio:#7752b5;--ocio:#17805a}
    body.tema-oscuro{--tinta:#edf5f8;--atenuado:#a9bdc8;--linea:#294554;--papel:#0d1b27;--marca:#38c6b4;--suave:#07131d;background:#07131d}.tema-alternar{border:1px solid var(--linea);border-radius:999px;background:var(--papel);color:var(--tinta);padding:8px 12px;font-weight:750;cursor:pointer}.tema-alternar:hover{border-color:var(--marca);color:var(--marca)}
    *{box-sizing:border-box} body{margin:0;background:var(--suave);color:var(--tinta);font:15px/1.5 system-ui,-apple-system,"Segoe UI",sans-serif} button,input{font:inherit}
    .pagina{width:min(1440px,calc(100% - 32px));margin:24px auto}.encabezado{display:flex;justify-content:space-between;gap:18px;align-items:center;margin-bottom:14px}.encabezado h1{font-size:clamp(1.6rem,3vw,2.25rem);letter-spacing:-.045em;margin:0}.encabezado p{margin:3px 0 0;color:var(--atenuado)}.volver{color:var(--marca);font-weight:750;text-decoration:none;white-space:nowrap}
    .explorador{display:grid;grid-template-columns:350px minmax(0,1fr);height:min(76vh,780px);min-height:560px;background:var(--papel);border:1px solid var(--linea);border-radius:22px;overflow:hidden;box-shadow:0 18px 50px #16473d16}.barra-lateral{display:flex;flex-direction:column;min-height:0;border-right:1px solid var(--linea);background:#fbfefd}.busqueda-contenedor{padding:16px 16px 12px;border-bottom:1px solid var(--linea)}.busqueda{width:100%;padding:12px 14px;border:1px solid #c7dbd6;border-radius:12px;background:#fff;outline:none}.busqueda:focus{border-color:var(--marca);box-shadow:0 0 0 3px #087f721f}.fichas{display:flex;gap:7px;flex-wrap:wrap;margin-top:10px}.ficha{border:1px solid #cfe0dc;border-radius:999px;background:#fff;padding:6px 9px;color:#3e5953;font-size:.78rem;font-weight:700;cursor:pointer}.ficha[aria-pressed="true"]{background:var(--marca);border-color:var(--marca);color:white}.resultados{overflow:auto;padding:10px}.resultados-estado{padding:2px 5px 8px;color:var(--atenuado);font-size:.82rem}.resultado{display:grid;grid-template-columns:62px 1fr;gap:10px;width:100%;padding:9px;border:0;border-radius:12px;background:transparent;text-align:left;color:inherit;cursor:pointer}.resultado:hover,.resultado.activo{background:#eaf6f3}.result-media{width:62px;height:62px;border-radius:9px;object-fit:cover;background:#dbece8}.result-placeholder{display:grid;place-items:center;color:#fff;font-weight:800;background:linear-gradient(135deg,#087f72,#58a89c)}.resultado h3{margin:0;font-size:.94rem;line-height:1.25}.resultado p{margin:3px 0 0;color:var(--atenuado);font-size:.79rem}.rotulos{display:flex;gap:5px;flex-wrap:wrap;margin-top:5px}.rotulo{display:inline-flex;padding:2px 6px;border-radius:999px;background:#e5f3f0;color:#087064;font-size:.68rem;font-weight:750}.tag-historico{background:#eee8ff;color:#6541a8}.tag-cultural{background:#f2e8ff;color:#7a3fa3}.tag-religioso{background:#fff1d9;color:#9b5a10}.tag-infantil{background:#fff0f5;color:#b03669}.tag-imperdible{background:#e4f8f3;color:#087064}.tag-deportes{background:#e1f1ff;color:#1767a5}.tag-gastronomia{background:#fff0e1;color:#a45417}.tag-musica{background:#f8e6f1;color:#9b2f6f}.tag-feria{background:#f3f1d8;color:#6f6917}.mapa-zona{position:relative;min-width:0}#mapa{height:100%;width:100%}.detalle{position:absolute;z-index:800;left:18px;bottom:18px;width:min(340px,calc(100% - 36px));max-height:calc(100% - 36px);overflow:auto;background:#fff;border:1px solid #d8e6e2;border-radius:17px;box-shadow:0 16px 40px #183d3550}.detalle[hidden]{display:none}.detail-media{display:block;width:100%;height:152px;object-fit:cover;background:#e7f3f0}.detail-placeholder{display:grid;place-items:center;color:#fff;background:linear-gradient(135deg,#087f72,#58a89c);font-size:2rem;font-weight:800}.detalle-cuerpo{padding:14px}.detalle-cerrar{float:right;border:0;background:#edf5f3;color:var(--tinta);border-radius:50%;width:30px;height:30px;cursor:pointer}.detalle h2{margin:0 35px 6px 0;font-size:1.18rem;line-height:1.25}.detalle-resumen{margin:10px 0;color:#405d56}.detalle-mas{margin:0;color:#405d56}.detalle-acciones{display:flex;gap:8px;flex-wrap:wrap;margin-top:13px}.accion{border:1px solid #bcd9d3;border-radius:10px;padding:8px 10px;background:#fff;color:#087064;font-weight:750;text-decoration:none;cursor:pointer}.accion.principal{background:var(--marca);border-color:var(--marca);color:#fff}.marcador{width:29px;height:29px;display:grid;place-items:center;border:3px solid #fff;border-radius:50% 50% 50% 0;color:#fff;font-size:13px;transform:rotate(-45deg);box-shadow:0 3px 9px #0004}.marcador span{transform:rotate(45deg)}.marcador-etiquetas{display:flex;flex-wrap:wrap;gap:3px;max-width:140px;margin:-7px 0 0 17px}.marcador-etiqueta{display:block;max-width:86px;overflow:hidden;padding:3px 6px;border:1px solid #d5e4e0;border-radius:999px;background:#fff;color:#184d46;font-size:10px;font-weight:800;line-height:1.1;text-overflow:ellipsis;white-space:nowrap;box-shadow:0 2px 7px #173b3440}.leaflet-control-attribution{font-size:10px}
    .barra-herramientas{display:flex;gap:7px;flex-wrap:wrap;margin-top:10px}.herramienta-boton{border:1px solid #cfe0dc;border-radius:999px;background:#fff;padding:6px 10px;color:#087064;font-size:.78rem;font-weight:750;cursor:pointer}.herramienta-boton:hover{background:#eaf6f3}.herramienta-boton[aria-pressed="true"]{background:var(--marca);border-color:var(--marca);color:#fff}.ruta-panel{margin-top:12px;padding:12px;border:1px solid #cfe0dc;border-radius:12px;background:#f4fbf9}.ruta-panel h2{margin:0 0 8px;font-size:.9rem}.ruta-panel label{display:block;margin-top:7px;color:var(--atenuado);font-size:.72rem;font-weight:700}.ruta-panel select{width:100%;margin-top:3px;padding:7px;border:1px solid #cfe0dc;border-radius:8px;background:#fff;color:var(--tinta)}.ruta-opciones{display:flex;gap:10px;flex-wrap:wrap;margin-top:9px;color:var(--atenuado);font-size:.75rem}.ruta-opciones label{display:flex;align-items:center;gap:4px;margin:0;font-weight:600}.ruta-acciones{display:flex;gap:7px;margin-top:9px}.ruta-resumen{margin:9px 0 0;color:var(--marca);font-size:.78rem;font-weight:750}.ruta-pasos{max-height:150px;overflow:auto;margin:8px 0 0;padding-left:20px;color:var(--atenuado);font-size:.73rem}.guia-enlaces{margin-top:12px;padding:12px;border-top:1px solid var(--linea)}.guia-enlaces h2{margin:0 0 7px;font-size:.85rem}.guia-enlaces a{display:block;padding:4px 0;color:var(--marca);font-size:.78rem;font-weight:700;text-decoration:none}.guia-enlaces a:hover{text-decoration:underline}
    .mapa-estado{position:absolute;z-index:900;left:18px;top:18px;background:#fff;border:1px solid var(--linea);border-radius:12px;padding:8px 13px;font-size:.82rem;color:var(--atenuado);box-shadow:0 8px 22px #16473d16}.mapa-estado[data-tipo="error"]{color:#b5432f;border-color:#f2cfc4}
    .usuario-marcador{width:18px;height:18px;border-radius:50%;background:#2563eb;border:3px solid #fff;box-shadow:0 0 0 5px #2563eb33}
    .resultado-distancia{color:var(--marca);font-weight:750}
    .result-media-placeholder,.detail-media-placeholder{display:grid;place-items:center;color:#fff;font-weight:800;background:linear-gradient(135deg,#087f72,#58a89c)}.interaccion-caja{margin-top:14px;padding-top:12px;border-top:1px solid var(--linea)}.interaccion-acciones{display:flex;gap:7px;flex-wrap:wrap}.interaccion-boton{border:1px solid #cfe0dc;border-radius:10px;background:#fff;padding:7px 10px;color:var(--marca);font-weight:750;cursor:pointer}.interaccion-boton.activo{background:var(--marca);color:#fff}.comentario-formulario{display:flex;gap:7px;margin-top:10px}.comentario-formulario textarea{min-width:0;flex:1;resize:vertical;border:1px solid #cfe0dc;border-radius:9px;padding:8px}.comentario-lista{display:grid;gap:8px;margin-top:10px}.comentario-elemento{padding:8px;border-radius:9px;background:#f4fbf9;font-size:.78rem}.comentario-elemento p{margin:0}.comentario-metadatos{display:flex;justify-content:space-between;color:var(--atenuado);font-size:.68rem;margin-bottom:3px}.comentario-estado{margin:7px 0 0;color:var(--atenuado);font-size:.75rem}
    .comentario-filtro{display:flex;gap:5px;margin-top:10px}.comentario-filtro button{border:1px solid #cfe0dc;border-radius:999px;background:#fff;padding:4px 8px;color:var(--marca);font-size:.72rem;font-weight:750;cursor:pointer}.comentario-filtro button[aria-pressed="true"]{background:var(--marca);color:#fff}.comentario-autor{display:flex;align-items:center;gap:6px}.comentario-avatar{display:grid;place-items:center;position:relative;width:27px;height:27px;overflow:hidden;border-radius:50%;background:#087f72;color:#fff;font-size:.62rem;font-weight:800}.comentario-avatar img{position:absolute;width:100%;height:100%;object-fit:cover}.comentario-autor small{display:block;color:var(--atenuado);font-size:.61rem}.comentario-metadatos time{margin-left:auto}
    .comentario-acciones{display:flex;gap:6px;flex-wrap:wrap;margin-top:7px}.comentario-acciones button{border:0;background:transparent;color:var(--marca);padding:2px 0;font-size:.7rem;font-weight:800;cursor:pointer}.comentario-respuesta-formulario{display:flex;gap:6px;margin-top:7px}.comentario-respuesta-formulario textarea{min-width:0;flex:1;border:1px solid #cfe0dc;border-radius:8px;padding:6px;resize:vertical}.comentario-respuestas{display:grid;gap:7px;margin:8px 0 0 16px;padding:8px 0 0 10px;border-left:2px solid #9fd7ce}.comentario-respuestas>span{color:var(--marca);font-size:.68rem;font-weight:800}.comentario-elemento.estado-fijado{border:1px solid #75cabb;background:#e1f5f0}
    button.rotulo{border:0;cursor:pointer;font:inherit}.map-marker-icon{background:transparent;border:0}.map-marker-icon .marcador-etiqueta{pointer-events:none}
    body.tema-oscuro .barra-lateral{background:#0c1b27}body.tema-oscuro .busqueda,body.tema-oscuro .ficha,body.tema-oscuro .herramienta-boton,body.tema-oscuro .ruta-panel,body.tema-oscuro .ruta-panel select,body.tema-oscuro .detalle,body.tema-oscuro .accion,body.tema-oscuro .mapa-estado,body.tema-oscuro .interaccion-boton,body.tema-oscuro .comentario-filtro button,body.tema-oscuro .comentario-formulario textarea,body.tema-oscuro .comentario-respuesta-formulario textarea{border-color:#365564;background:#102735;color:var(--tinta)}body.tema-oscuro .resultado:hover,body.tema-oscuro .resultado.activo,body.tema-oscuro .ruta-panel,body.tema-oscuro .comentario-elemento{background:#142e3d}body.tema-oscuro .resultado p,body.tema-oscuro .detalle-resumen,body.tema-oscuro .detalle-mas{color:var(--atenuado)}body.tema-oscuro .rotulo{background:#173c45;color:#8de0d4}body.tema-oscuro .detalle-cerrar{background:#1b3948;color:var(--tinta)}body.tema-oscuro .mapa-estado{box-shadow:0 8px 22px #0008}body.tema-oscuro .comentario-respuestas{border-color:#3d7b78}body.tema-oscuro .comentario-elemento.estado-fijado{border-color:#4faaa0;background:#183941}body.tema-oscuro .leaflet-tile{filter:brightness(.62) saturate(.72) hue-rotate(145deg)}body.tema-oscuro .leaflet-control-zoom a{background:#102735;color:#edf5f8;border-color:#365564}body.tema-oscuro .marcador-etiqueta{border-color:#365564;background:#102735;color:#d7f5ef}
    @media(max-width:820px){.pagina{width:min(100% - 18px,1440px);margin:12px auto}.encabezado{align-items:flex-start}.encabezado p{display:none}.explorador{grid-template-columns:1fr;height:auto;min-height:0}.barra-lateral{border-right:0;border-bottom:1px solid var(--linea);max-height:330px}.mapa-zona{height:min(42svh,380px);min-height:280px}.detalle{left:10px;bottom:10px;width:calc(100% - 20px);max-height:calc(100% - 20px)}}@media(max-width:420px){.mapa-zona{height:35svh;min-height:250px}.barra-lateral .busqueda-contenedor{padding:12px}.resultados{max-height:220px}}
    .busqueda-contenedor{flex:0 0 auto;max-height:64%;overflow-y:auto}
    .resultados{flex:1;min-height:0;overflow-y:auto}
    .ruta-pasos{max-height:220px;overflow-y:auto;padding-right:8px;scrollbar-width:thin}
    @media(max-width:820px){.barra-lateral{max-height:none}.busqueda-contenedor{max-height:420px}.resultados{max-height:280px}}
    body{font-family:'Montserrat-Regular','Montserrat',sans-serif}
    .busqueda,.ficha,.herramienta-boton,.accion,.interaccion-boton,.comentario-filtro button,.detalle-cerrar{min-height:44px}
    .busqueda,.ruta-panel select,.comentario-formulario textarea,.comentario-respuesta-formulario textarea{font-size:16px}
    .herramienta-boton,.ficha,.accion,.interaccion-boton{display:inline-flex;align-items:center;justify-content:center}
    .detalle-cerrar{width:44px;height:44px}
  </style>
  <link rel="stylesheet" href="../css/mapa.css?v=20261119-guia-rutas">
</head>
<body>
  <main class="pagina">
    <header class="encabezado"><div><h1>Explorá Salto</h1><p>Elegí un punto para conocerlo sin perder su ubicación en el mapa.</p></div><div><button id="alternar-tema" class="tema-alternar" type="button" aria-pressed="false">Modo oscuro</button> <a class="volver" href="index.php">← Volver al inicio</a></div></header>
    <section class="explorador" aria-label="Mapa de lugares y patrimonio">
      <aside class="barra-lateral">
        <div class="busqueda-contenedor">
          <input id="busqueda" class="busqueda" type="search" placeholder="Buscar lugares, patrimonio o categorías" aria-label="Buscar en el mapa">
          <div id="fichas" class="fichas" aria-label="Categorías"></div>
          <div class="barra-herramientas">
            <button id="ubicar" class="herramienta-boton" type="button">📍 Usar mi ubicación</button>
            <button id="limpiar-filtros" class="herramienta-boton" type="button" hidden>Limpiar filtros</button>
          </div>
          <section class="ruta-panel" aria-labelledby="ruta-titulo">
            <h2 id="ruta-titulo">Cómo llegar</h2>
            <label for="ruta-origen">Desde</label>
            <select id="ruta-origen"><option value="user">Mi ubicación</option></select>
            <label for="ruta-destino">Hasta</label>
            <select id="ruta-destino"><option value="">Elegí un punto</option></select>
            <label for="ruta-modo">Medio de transporte</label>
            <select id="ruta-modo">
              <option value="car">🚗 Auto</option>
              <option value="bike">🚲 Bicicleta</option>
              <option value="foot">🚶 A pie</option>
            </select>
            <div class="ruta-opciones">
              <label><input id="evitar-peajes" type="checkbox"> Evitar peajes</label>
              <label><input id="evitar-autopistas" type="checkbox"> Evitar autopistas</label>
            </div>
            <div class="ruta-acciones">
              <button id="ruta-calcular" class="herramienta-boton" type="button">Calcular ruta</button>
              <button id="ruta-limpiar" class="herramienta-boton" type="button">Limpiar</button>
            </div>
            <p id="ruta-resumen" class="ruta-resumen" aria-live="polite"></p>
            <ol id="ruta-pasos" class="ruta-pasos" hidden></ol>
          </section>
          <section class="guia-enlaces" aria-labelledby="guia-titulo">
            <h2 id="guia-titulo">Guías SIGTUR</h2>
            <a href="index.php#lugares">Lugares recomendados</a>
            <a href="lugares.php#plaza-artigas">Guía: Plaza Artigas</a>
            <a href="lugares.php#costanera-norte">Guía: Costanera Norte</a>
            <a href="lugares.php#parque-solari">Guía: Parque Solari</a>
            <a href="lugares.php#plaza-33">Guía: Plaza Treinta y Tres</a>
          </section>
        </div>
        <div id="resultados" class="resultados" aria-live="polite"></div>
      </aside>
      <div class="mapa-zona">
        <div id="mapa" aria-label="Mapa interactivo de Salto"></div>
        <button id="mostrar-ayuda-ruta" class="mapa-ruta-ayuda" type="button" aria-haspopup="dialog" aria-controls="dialogo-ayuda-ruta">
          <span aria-hidden="true">ⓘ</span> ¿Cómo se calcula?
        </button>
        <div id="mapa-estado" class="mapa-estado" hidden></div>
        <article id="detalle" class="detalle" hidden></article>
        <dialog id="dialogo-ayuda-ruta" class="dialogo-ayuda-ruta" aria-labelledby="dialogo-ayuda-ruta-titulo">
          <header class="dialogo-ayuda-ruta-cabecera">
            <div>
              <p class="dialogo-ayuda-ruta-etiqueta">CÓMO FUNCIONA</p>
              <h2 id="dialogo-ayuda-ruta-titulo">¿Cómo se calcula una ruta?</h2>
            </div>
            <form method="dialog">
              <button class="dialogo-ayuda-ruta-cerrar" type="submit" aria-label="Cerrar explicación">×</button>
            </form>
          </header>
          <p class="dialogo-ayuda-ruta-intro">SIGTUR envía las coordenadas del origen y el destino a un motor de rutas. El motor busca un recorrido por calles; Leaflet dibuja la geometría que recibe.</p>
          <section class="dialogo-ayuda-ruta-bloque">
            <h3>1. Puntos de partida y llegada</h3>
            <p>Se usan latitud y longitud. Si elegís “Mi ubicación”, el navegador solicita permiso para obtener la geolocalización del dispositivo.</p>
          </section>
          <section class="dialogo-ayuda-ruta-bloque">
            <h3>2. Red de calles y transporte</h3>
            <p>El servicio de ruteo busca un camino según el modo seleccionado. Auto sin restricciones y los modos bicicleta/a pie usan servicios compatibles con la API de OSRM. Si en auto elegís evitar peajes o autopistas, SIGTUR consulta Valhalla para aplicar esas preferencias.</p>
          </section>
          <section class="dialogo-ayuda-ruta-bloque">
            <h3>3. Distancia en línea recta: Haversine</h3>
            <p>Esta fórmula considera la curvatura de la Tierra. En SIGTUR se usa para ordenar los puntos por cercanía, no para calcular la distancia del recorrido por calles.</p>
            <code class="dialogo-ayuda-ruta-formula">a = sin²(Δφ / 2) + cos(φ₁) · cos(φ₂) · sin²(Δλ / 2)<br>d = 2R · asin(√a), con R = 6.371 km</code>
          </section>
          <section class="dialogo-ayuda-ruta-bloque">
            <h3>4. Distancia y duración del recorrido</h3>
            <p>El motor suma los tramos de la red vial y devuelve distancia y duración según el transporte y sus datos de calles. En forma simplificada:</p>
            <code class="dialogo-ayuda-ruta-formula">D<sub>ruta</sub> = Σ ℓᵢ &nbsp; · &nbsp; T<sub>ruta</sub> = Σ τᵢ</code>
            <p class="dialogo-ayuda-ruta-nota">SIGTUR convierte metros a kilómetros y segundos a minutos; no estima el tiempo con una velocidad fija.</p>
          </section>
          <p class="dialogo-ayuda-ruta-pie">CARTO aporta el mapa de fondo por defecto; el servicio de ruteo calcula el trayecto y Leaflet lo representa.</p>
        </dialog>
      </div>
    </section>
  </main>
  <script src="../js/api-config.js"></script>
  <script src="../js/comment-media.js?v=20261119-nombres-espanol"></script>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script type="module">
    const CENTRO=[-31.383,-57.964], ZOOM_INICIAL=13;
    const CATEGORIAS=['Imperdible','Histórico','Cultura','Religioso','Infantil','Deportes','Gastronomía','Música','Feria'];
    const tipos={place:{color:'#17805a',symbol:'●',label:'Lugar'},cultural:{color:'#7752b5',symbol:'◆',label:'Patrimonio'},event:{color:'#d97706',symbol:'★',label:'Evento'},company:{color:'#2563eb',symbol:'●',label:'Servicio'}};
    const destacados=[
      {id:'plaza-artigas',nombre:'Plaza Artigas',tipo:'place',categorias:['Histórico','Imperdible','Infantil'],lat:-31.388763,lng:-57.960618,imagen:'../imagenes/turismo/plaza_artigas_01.jpg.webp',direccion:'Manzana de Uruguay, Artigas, 25 de Agosto y 18 de Julio',resumen:'El corazón cívico de Salto, con monumento ecuestre a José Gervasio Artigas y edificios históricos a su alrededor.',descripcion:'Ideal para iniciar una recorrida por el centro. Sus veredas arboladas, bancos y monumentos la convierten en una parada tranquila entre comercios, cafés y edificios patrimoniales; también funciona para una pausa familiar.',enlace:'lugares.php#plaza-artigas'},
      {id:'costanera-norte',nombre:'Costanera Norte',tipo:'place',categorias:['Deportes','Imperdible','Infantil'],lat:-31.36945,lng:-57.97070,imagen:'../imagenes/eventos/whatsapp-image-2025-03-17-92805-am-1.jpeg',direccion:'Rambla Costanera Norte, Río Uruguay',resumen:'Paseo costero de 2,5 km para caminar, pedalear y mirar el atardecer sobre el Río Uruguay.',descripcion:'El circuito comienza junto al Club Remeros y recorre el Parque Indígena Vaimaca Pirú y la zona del Ayuí. Es una buena opción para actividades al aire libre, fotografía y salidas en familia.',enlace:'lugares.php#costanera-norte'},
      {id:'parque-solari',nombre:'Parque Benito Solari',tipo:'place',categorias:['Histórico','Cultura','Infantil','Deportes'],lat:-31.379470,lng:-57.948920,imagen:'../imagenes/turismo/solari.jpg',direccion:'Av. Blandengues y Enrique Amorim, Salto',resumen:'Gran espacio verde histórico con lago, esculturas, arbolado y áreas para disfrutar al aire libre.',descripcion:'Inaugurado en 1924, este parque de 17 hectáreas combina jardines de inspiración francesa, lago artificial y rincones para pasear. Es apropiado para una visita familiar y para descansar del movimiento del centro.',enlace:'lugares.php#parque-solari'},
      {id:'plaza-33',nombre:'Plaza Treinta y Tres',tipo:'place',categorias:['Histórico','Imperdible','Religioso','Infantil'],lat:-31.387490,lng:-57.970060,imagen:'../imagenes/turismo/plaza.png',direccion:'Uruguay, Artigas, Florencio Sánchez y Juan Carlos Gómez',resumen:'La plaza más antigua de Salto, junto a la iglesia Nuestra Señora del Carmen.',descripcion:'Conocida históricamente como Plaza Vieja, es una parada clave para entender el trazado original de la ciudad. Combina patrimonio, vida barrial y una caminata corta por el centro, apta para recorrer en familia.',enlace:'lugares.php#plaza-33'},
      {id:'hotel-dayman',nombre:'Hotel Daymán',tipo:'place',categorias:['Hospedaje','Imperdible'],lat:-31.43070,lng:-57.92530,direccion:'Avda. Paysandú y Rambla de Circunvalación S/N, Termas del Daymán',resumen:'Alojamiento en la zona de Termas del Daymán.',descripcion:'Punto de referencia para encontrar el alojamiento desde el mapa.',enlace:'turismo.php#alojamientos'},
      {id:'hotel-los-cedros',nombre:'Hotel Los Cedros',tipo:'place',categorias:['Hospedaje','Imperdible'],lat:-31.38520,lng:-57.96010,direccion:'Uruguay 657, 50000 Salto, Departamento de Salto',resumen:'Alojamiento céntrico en la ciudad de Salto.',descripcion:'Punto de referencia para encontrar el alojamiento desde el mapa.',enlace:'turismo.php#alojamientos'},
      {id:'gran-hotel',nombre:'Gran Hotel',tipo:'place',categorias:['Hospedaje','Imperdible'],lat:-31.38390,lng:-57.96320,direccion:'Brasil 891, 50000 Salto, Departamento de Salto',resumen:'Alojamiento en el centro de Salto.',descripcion:'Punto de referencia para encontrar el alojamiento desde el mapa.',enlace:'turismo.php#alojamientos'}
    ];
    const BASE_API=window.SIGTUR_BACKEND_URL||'',API_MAPA_LOCAL='api/mapa.php',SERVICIOS_ENRUTAMIENTO={car:'https://router.project-osrm.org/route/v1/driving/',bike:'https://routing.openstreetmap.de/routed-bike/route/v1/driving/',foot:'https://routing.openstreetmap.de/routed-foot/route/v1/driving/'};
    const alternarTema=document.getElementById('alternar-tema');const aplicarTema=oscuro=>{document.body.classList.toggle('tema-oscuro',oscuro);alternarTema.setAttribute('aria-pressed',String(oscuro));alternarTema.textContent=oscuro?'Modo claro':'Modo oscuro'};aplicarTema(localStorage.getItem('sigtur-theme')==='dark');alternarTema.addEventListener('click',()=>{const oscuro=!document.body.classList.contains('tema-oscuro');aplicarTema(oscuro);localStorage.setItem('sigtur-theme',oscuro?'dark':'light')});
    const mapa=L.map('mapa').setView(CENTRO,ZOOM_INICIAL);L.tileLayer(window.SIGTUR_MAP_TILE_URL||'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',{maxZoom:19,attribution:window.SIGTUR_MAP_TILE_ATTRIBUTION||'© OpenStreetMap contributors, © CARTO'}).addTo(mapa);const layer=L.layerGroup().addTo(mapa);
    const busqueda=document.getElementById('busqueda'),fichas=document.getElementById('fichas'),resultados=document.getElementById('resultados'),detalle=document.getElementById('detalle'),estadoMapa=document.getElementById('mapa-estado'),botonUbicar=document.getElementById('ubicar'),botonLimpiarFiltros=document.getElementById('limpiar-filtros'),origenRuta=document.getElementById('ruta-origen'),destinoRuta=document.getElementById('ruta-destino'),modoRuta=document.getElementById('ruta-modo'),evitarPeajes=document.getElementById('evitar-peajes'),evitarAutopistas=document.getElementById('evitar-autopistas'),botonCalcularRuta=document.getElementById('ruta-calcular'),botonLimpiarRuta=document.getElementById('ruta-limpiar'),resumenRuta=document.getElementById('ruta-resumen'),pasosRuta=document.getElementById('ruta-pasos'),parametros=new URLSearchParams(location.search);
    let elementos=[],identificadorSeleccionado=null,categoriaActiva=parametros.get('categoria')||parametros.get('category')||'',marcadores=new Map(),posicionUsuario=null,marcadorUsuario=null,capaRuta=null,errorCarga=false,cargando=true;
    function esperarPausa(fn,esperar){let temporizador;return(...argumentos)=>{clearTimeout(temporizador);temporizador=setTimeout(()=>fn(...argumentos),esperar)}}
    function distanciaKm(a,b){const radioTierraKm=6371,dLat=(b.lat-a.lat)*Math.PI/180,dLng=(b.lng-a.lng)*Math.PI/180,s=Math.sin(dLat/2)**2+Math.cos(a.lat*Math.PI/180)*Math.cos(b.lat*Math.PI/180)*Math.sin(dLng/2)**2;return radioTierraKm*2*Math.asin(Math.sqrt(s))}
    function establecerEstadoMapa(mensaje,tipo){if(!estadoMapa)return;if(!mensaje){estadoMapa.hidden=true;return}estadoMapa.hidden=false;estadoMapa.dataset.tipo=tipo||'info';estadoMapa.textContent=mensaje}
    function sincronizarUrl(){const siguiente=new URLSearchParams(location.search);categoriaActiva?siguiente.set('categoria',categoriaActiva):siguiente.delete('categoria');busqueda.value?siguiente.set('q',busqueda.value):siguiente.delete('q');history.replaceState(null,'',siguiente.toString()?`?${siguiente.toString()}`:location.pathname)}
    const escaparHtml=valor=>{const elementoDom=document.createElement('span');elementoDom.textContent=String(valor??'');return elementoDom.innerHTML};
    const identificadorUrl=valor=>String(valor??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
    const claveEtiqueta=valor=>({historicos:'historico',religiosos:'religioso',infantiles:'infantil',imperdibles:'imperdible'})[identificadorUrl(valor)]||identificadorUrl(valor);
    const etiquetaCanonica=valor=>({historico:'Histórico',cultura:'Cultura',religioso:'Religioso',infantil:'Infantil',imperdible:'Imperdible',deportes:'Deportes',gastronomia:'Gastronomía',musica:'Música',feria:'Feria'})[claveEtiqueta(valor)]||limpiarTexto(valor);
    const urlSegura=valor=>/^(https?:|\/|\.\.?\/)/.test(String(valor||'').trim())?String(valor).trim():'';
    const limpiarTexto=valor=>new DOMParser().parseFromString(String(valor||''),'text/html').body.textContent.replace(/\s+/g,' ').trim();
    const resumirTexto=valor=>{const texto=limpiarTexto(valor);return texto.length>155?`${texto.slice(0,155)}…`:texto};
    function normalizarTipo(valor){const clave=identificadorUrl(valor);if(['patrimonio','cultural','heritage'].includes(clave))return'cultural';if(['evento','event'].includes(clave))return'event';if(['empresa','servicio','company'].includes(clave))return'company';return'place'}
    function obtenerMultimedia(crudo){const primero=Array.isArray(crudo.media)?crudo.media.find(m=>m?.url||m?.src||typeof m==='string'):crudo.media;const candidato=crudo.imagen||crudo.imagen_url||crudo.image||crudo.image_url||crudo.google_image||crudo.googleImage||crudo.google_photo_url||crudo.googlePhotoUrl||crudo.foto||crudo.thumbnail||primero;const url=typeof candidato==='object'?candidato.url||candidato.src:candidato;return urlSegura(url)}
    function normalizar(crudo){const nombre=limpiarTexto(crudo.nombre||crudo.name||crudo.titulo||crudo.title)||'Punto de interés';const categoriasOrigen=crudo.categorias||crudo.categories||crudo.category||crudo.categoria||[];const categorias=[...new Set((Array.isArray(categoriasOrigen)?categoriasOrigen:String(categoriasOrigen).split(',')).map(etiquetaCanonica).filter(Boolean))];const lat=crudo.lat??crudo.latitude??crudo.latitud,lng=crudo.lng??crudo.lon??crudo.longitude??crudo.longitud;return{...crudo,id:crudo.id||identificadorUrl(nombre),nombre,tipo:normalizarTipo(crudo.tipo||crudo.type),categorias:categorias.length?categorias:['Cultura'],lat:lat==null||String(lat).trim()===''?NaN:Number(lat),lng:lng==null||String(lng).trim()===''?NaN:Number(lng),imagen:obtenerMultimedia(crudo),direccion:limpiarTexto(crudo.direccion||crudo.address||crudo.ubicacion),resumen:resumirTexto(crudo.resumen||crudo.descripcion||crudo.description)||'Información turística en preparación.',descripcion:limpiarTexto(crudo.descripcion||crudo.description||crudo.resumen)||'Información turística en preparación.',enlace:urlSegura(crudo.enlace||crudo.url||crudo.link)}}
    function esDuplicado(candidato,coleccion){return coleccion.some(actual=>identificadorUrl(actual.nombre)===identificadorUrl(candidato.nombre)||Math.hypot(actual.lat-candidato.lat,actual.lng-candidato.lng)<.00012)}
    const coloresEtiquetas={historico:'#7752b5',cultura:'#9a53c9',religioso:'#d68a27',infantil:'#df5b91',imperdible:'#087f72',deportes:'#2378bd',gastronomia:'#d36825',musica:'#b33b80',feria:'#979126'};
    function colorMarcador(elemento){const colores=[...new Set(elemento.categorias.map(etiqueta=>coloresEtiquetas[claveEtiqueta(etiqueta)]).filter(Boolean))].slice(0,4);if(!colores.length)return(tipos[elemento.tipo]||tipos.place).color;if(colores.length===1)return colores[0];const paso=100/colores.length;return`conic-gradient(${colores.map((color,indice)=>`${color} ${indice*paso}% ${(indice+1)*paso}%`).join(',')})`}
    function icono(elemento){const conf=tipos[elemento.tipo]||tipos.place;const etiquetas=elemento.categorias.slice(0,3),extra=elemento.categorias.length-etiquetas.length;return L.divIcon({className:'map-marker-icon',html:`<span class="marcador" style="background:${colorMarcador(elemento)}"><span>${conf.symbol}</span></span><span class="marcador-etiquetas" title="${escaparHtml(elemento.nombre)} · ${escaparHtml(elemento.categorias.join(', '))}">${etiquetas.map(etiqueta=>`<span class="marcador-etiqueta etiqueta-${claveEtiqueta(etiqueta)}">${escaparHtml(etiqueta)}</span>`).join('')}${extra?`<span class="marcador-etiqueta">+${extra}</span>`:''}</span>`,iconSize:[160,58],iconAnchor:[14,29]})}
    function filtrado(){const consulta=identificadorUrl(busqueda.value);let lista=elementos.filter(elemento=>(!categoriaActiva||elemento.categorias.some(categoria=>claveEtiqueta(categoria)===claveEtiqueta(categoriaActiva)))&&(!consulta||identificadorUrl([elemento.nombre,elemento.resumen,elemento.direccion,...elemento.categorias].join(' ')).includes(consulta)));if(posicionUsuario)lista=[...lista].sort((a,b)=>distanciaKm(posicionUsuario,a)-distanciaKm(posicionUsuario,b));return lista}
    function multimedia(elemento,clase){return elemento.imagen?`<img class="${clase}" src="${escaparHtml(elemento.imagen)}" alt="${escaparHtml(elemento.nombre)}" loading="lazy" onerror="this.remove()">`:`<div class="${clase} ${clase}-marcador-posicion" aria-hidden="true">${escaparHtml(elemento.nombre[0])}</div>`}
    function etiquetaDistancia(elemento){if(!posicionUsuario||!Number.isFinite(elemento.lat)||!Number.isFinite(elemento.lng))return'';const km=distanciaKm(posicionUsuario,elemento);return`<span class="resultado-distancia">${km<1?`${Math.round(km*1000)} m`:`${km.toFixed(1)} km`}</span>`}
    function representarEtiquetas(){const detectado=[...new Set(elementos.flatMap(elemento=>elemento.categorias))],categorias=[...CATEGORIAS.filter(categoria=>detectado.some(valor=>claveEtiqueta(valor)===claveEtiqueta(categoria))),...detectado.filter(categoria=>!CATEGORIAS.some(valor=>claveEtiqueta(valor)===claveEtiqueta(categoria)))];fichas.innerHTML=[['','Todo'],...categorias.map(categoria=>[categoria,categoria])].map(([categoria,rotulo])=>`<button class="ficha etiqueta-${claveEtiqueta(categoria)}" type="button" data-categoria="${escaparHtml(categoria)}" aria-pressed="${claveEtiqueta(categoria)===claveEtiqueta(categoriaActiva)}">${escaparHtml(rotulo)}</button>`).join('')}
    function representarDestinosRuta(){const puntos=elementos.filter(elemento=>Number.isFinite(elemento.lat)&&Number.isFinite(elemento.lng)),origenActual=origenRuta.value,destinoActual=destinoRuta.value;origenRuta.innerHTML='<option value="user">Mi ubicación</option>'+puntos.map(elemento=>`<option value="${escaparHtml(elemento.id)}">${escaparHtml(elemento.nombre)}</option>`).join('');destinoRuta.innerHTML='<option value="">Elegí un punto</option>'+puntos.map(elemento=>`<option value="${escaparHtml(elemento.id)}">${escaparHtml(elemento.nombre)}</option>`).join('');if(origenActual==='user'||puntos.some(elemento=>elemento.id===origenActual))origenRuta.value=origenActual;if(puntos.some(elemento=>elemento.id===destinoActual))destinoRuta.value=destinoActual}
    function puntoOrigenRuta(){if(origenRuta.value==='user'&&posicionUsuario)return posicionUsuario;const elemento=elementos.find(valor=>valor.id===origenRuta.value);return elemento?{lat:elemento.lat,lng:elemento.lng}:null}
    function instruccion(paso){const maniobra=paso.maneuver||{},tipo=maniobra.type||'continue',modificador=maniobra.modifier?` hacia ${maniobra.modifier}`:'';const nombres=paso.name?` por ${paso.name}`:'';const rotulos={depart:'Salí',arrive:'Llegaste',turn:'Girá',new_name:'Continuá',continue:'Continuá',merge:'Incorporate',on_ramp:'Tomá la entrada',off_ramp:'Tomá la salida',fork:'Mantenete',roundabout:'En la rotonda',end_of_road:'Al final de la calle'};return`${rotulos[tipo]||'Continuá'}${modificador}${nombres}`}
    function decodificarPolilinea6(codificado){let indice=0,lat=0,lng=0;const leerValor=()=>{let resultado=0,desplazamiento=0,byte;do{if(indice>=codificado.length)throw new Error('Geometría de ruta inválida.');byte=codificado.charCodeAt(indice++)-63;if(byte<0||byte>63||desplazamiento>30)throw new Error('Geometría de ruta inválida.');resultado|=(byte&0x1f)<<desplazamiento;desplazamiento+=5}while(byte>=0x20);return resultado&1?~(resultado>>1):resultado>>1};const puntos=[];while(indice<codificado.length){lat+=leerValor();lng+=leerValor();puntos.push([lng/1e6,lat/1e6])}if(puntos.length<2)throw new Error('La ruta no tiene suficientes puntos.');return puntos}
    async function calcularRuta(){
      const origen=puntoOrigenRuta(),destino=elementos.find(elemento=>elemento.id===destinoRuta.value),modo=modoRuta.value;
      if(!origen&&origenRuta.value==='user'){ubicarme();resumenRuta.textContent='Buscando tu ubicación. Volvé a calcular la ruta cuando se active.';return}
      if(!origen||!destino){establecerEstadoMapa('Elegí un origen y un destino para calcular la ruta.','error');return}
      botonCalcularRuta.disabled=true;resumenRuta.textContent='Calculando recorrido…';pasosRuta.hidden=true;
      if(capaRuta){mapa.removeLayer(capaRuta);capaRuta=null}
      try{
        let ruta;
        if(modo==='car'&&(evitarPeajes.checked||evitarAutopistas.checked)){
          const opcionesCosto={};
          if(evitarPeajes.checked)opcionesCosto.use_tolls=0;
          if(evitarAutopistas.checked)opcionesCosto.use_highways=0;
          const solicitud={locations:[{lat:origen.lat,lon:origen.lng},{lat:destino.lat,lon:destino.lng}],costing:'auto',costing_options:{auto:opcionesCosto},shape_format:'polyline6',directions_options:{units:'kilometers',language:'es-ES'}};
          const respuesta=await fetch(`https://valhalla1.openstreetmap.de/route?${new URLSearchParams({json:JSON.stringify(solicitud)})}`);
          if(!respuesta.ok)throw new Error(`El servicio de rutas respondió ${respuesta.status}.`);
          const datos=await respuesta.json(),recorrido=datos.trip,resumen=recorrido?.summary;
          if(!recorrido?.legs?.length||!resumen)throw new Error('El servicio no devolvió una ruta válida.');
          const coordenadas=recorrido.legs.flatMap(tramo=>decodificarPolilinea6(tramo.shape)).filter((punto,indice,arreglo)=>indice===0||punto[0]!==arreglo[indice-1][0]||punto[1]!==arreglo[indice-1][1]);
          ruta={geometry:{type:'LineString',coordinates: coordenadas},distance:resumen.length*1000,duration:resumen.time,hasToll:resumen.has_toll,hasHighway:resumen.has_highway,legs:recorrido.legs.map(tramo=>({steps:(tramo.maneuvers||[]).map(maniobra=>({instruction:maniobra.instruction}))}))};
        }else{
          const parametros=new URLSearchParams({overview:'full',geometries:'geojson',steps:'true'});
          const respuesta=await fetch(`${SERVICIOS_ENRUTAMIENTO[modo]}${origen.lng},${origen.lat};${destino.lng},${destino.lat}?${parametros}`);
          if(!respuesta.ok)throw new Error(`El servicio de rutas respondió ${respuesta.status}.`);
          const datos=await respuesta.json();ruta=datos.routes?.[0];
          if(!ruta)throw new Error('El servicio no devolvió una ruta válida.');
        }
        capaRuta=L.geoJSON(ruta.geometry,{style:{color:modo==='foot'?'#17805a':modo==='bike'?'#7752b5':'#087f72',weight:6,opacity:.85,dashArray:modo==='foot'?'8 7':modo==='bike'?'3 7':null}}).addTo(mapa);
        mapa.fitBounds(capaRuta.getBounds(),{padding:[35,35]});
        const km=(ruta.distance/1000).toFixed(1),minutos=Math.max(1,Math.round(ruta.duration/60)),rotulo={car:'auto',bike:'bicicleta',foot:'a pie'}[modo],notas=[];
        if(modo==='car'&&evitarPeajes.checked)notas.push(ruta.hasToll?'incluye peaje (no se pudo evitar)':'sin peajes');
        if(modo==='car'&&evitarAutopistas.checked)notas.push(ruta.hasHighway?'incluye autopista (no se pudo evitar)':'sin autopistas');
        resumenRuta.textContent=`${km} km · ${minutos} min en ${rotulo}${notas.length?` · ${notas.join(' · ')}`:''}`;
        const pasos=(ruta.legs||[]).flatMap(tramo=>tramo.steps||[]).map(paso=>paso.instruction||instruccion(paso)).filter(Boolean);
        pasosRuta.innerHTML=pasos.map((paso,indice)=>`<li>${indice+1}. ${escaparHtml(paso)}</li>`).join('');pasosRuta.hidden=!pasos.length;
        const omitidoPreferencia=(evitarPeajes.checked&&ruta.hasToll)||(evitarAutopistas.checked&&ruta.hasHighway);
        establecerEstadoMapa(omitidoPreferencia?'Ruta calculada, pero no se pudieron evitar todas las opciones seleccionadas.':'Ruta calculada sobre calles reales.',omitidoPreferencia?'error':'info');
      }catch(error){
        console.error('No se pudo calcular la ruta:',error);
        resumenRuta.textContent='No se pudo calcular la ruta con esas opciones.';
        establecerEstadoMapa('El servicio de rutas no respondió o no pudo encontrar un recorrido. Probá otra opción.','error');
      }finally{botonCalcularRuta.disabled=false}
    }
    function limpiarRuta(){if(capaRuta){mapa.removeLayer(capaRuta);capaRuta=null}resumenRuta.textContent='';pasosRuta.innerHTML='';pasosRuta.hidden=true}
    function reemplazarAccionRutaExterna(){const enlace=detalle.querySelector('a[href^="https://www.google.com/maps/dir"]');if(!enlace)return;const boton=document.createElement('button');boton.type='button';boton.className='accion';boton.textContent='Cómo llegar';boton.addEventListener('click',()=>{destinoRuta.value=identificadorSeleccionado;destinoRuta.closest('.ruta-panel')?.scrollIntoView({behavior:'smooth',block:'nearest'});resumenRuta.textContent='Destino seleccionado. Elegí el medio y calculá la ruta.';destinoRuta.focus()});enlace.replaceWith(boton)}
    const observadorDetalle=new MutationObserver(reemplazarAccionRutaExterna);
    observadorDetalle.observe(detalle,{childList:true,subtree:true});
    const observadorEtiquetasDetalle=new MutationObserver(()=>{detalle.querySelectorAll('.rotulos .rotulo:not(button)').forEach(rotulo=>{const boton=document.createElement('button');boton.type='button';boton.className='rotulo';boton.dataset.mapaCategoria=rotulo.textContent.trim();boton.textContent=rotulo.textContent;boton.title=`Filtrar por ${rotulo.textContent.trim()}`;rotulo.replaceWith(boton)})});
    observadorEtiquetasDetalle.observe(detalle,{childList:true,subtree:true});
    function representarResultados(visible){if(cargando){resultados.innerHTML='<div class="resultados-estado">Cargando puntos del mapa…</div>';return}const lineaEstado=errorCarga?'No se pudieron cargar los datos en vivo; se muestran lugares destacados.':`${visible.length} ${visible.length===1?'resultado':'resultados'}${posicionUsuario?' · ordenado por cercanía':''}`;resultados.innerHTML=`<div class="resultados-estado">${lineaEstado}</div>${visible.length?visible.map(elemento=>`<button class="resultado ${elemento.id===identificadorSeleccionado?'activo':''}" type="button" data-id="${escaparHtml(elemento.id)}">${multimedia(elemento,'result-media')}<span><h3>${escaparHtml(elemento.nombre)}</h3><p>${escaparHtml(elemento.resumen)} ${etiquetaDistancia(elemento)}</p><span class="rotulos">${elemento.categorias.map(categoria=>`<span class="rotulo etiqueta-${claveEtiqueta(categoria)}">${escaparHtml(categoria)}</span>`).join('')}</span></span></button>`).join(''):'<p class="resultados-estado">Nada coincide con tu búsqueda. Probá otro término o categoría.</p>'}`}
    function representarMapa(visible){layer.clearLayers();marcadores=new Map();visible.forEach(elemento=>{if(!Number.isFinite(elemento.lat)||!Number.isFinite(elemento.lng))return;const conf=tipos[elemento.tipo]||tipos.place;const marcador=L.marker([elemento.lat,elemento.lng],{icon:icono(elemento),title:`${conf.label}: ${elemento.nombre}`}).addTo(layer).on('click',()=>seleccionar(elemento.id,true));marcadores.set(elemento.id,marcador)})}
    function ajustarMapaAVisibles(visible){const puntos=visible.filter(elemento=>Number.isFinite(elemento.lat)&&Number.isFinite(elemento.lng)).map(elemento=>[elemento.lat,elemento.lng]);if(posicionUsuario)puntos.push([posicionUsuario.lat,posicionUsuario.lng]);if(puntos.length>1)mapa.fitBounds(puntos,{padding:[40,40],maxZoom:15})}
    function actualizar(ajustar=true){const visible=filtrado();representarEtiquetas();representarResultados(visible);representarMapa(visible);botonLimpiarFiltros.hidden=!categoriaActiva&&!busqueda.value&&!posicionUsuario;if(identificadorSeleccionado&&!visible.some(elemento=>elemento.id===identificadorSeleccionado))cerrarDetalle();if(ajustar&&!identificadorSeleccionado)ajustarMapaAVisibles(visible);sincronizarUrl();}
    let tokenSesionValidado=null;
    const sesionAlmacenada=()=>{try{return JSON.parse(localStorage.getItem('sigtur-session'))||null}catch{return null}};
    const obtenerSesion=()=>{const actual=sesionAlmacenada(),fechaVencimiento=Number(actual?.expiresAt||0),valido=actual?.token===tokenSesionValidado&&(!fechaVencimiento||fechaVencimiento>Math.floor(Date.now()/1000));return valido?actual:actual?{...actual,usuario:null}:null};
    const lugarPinsClave=()=>`sigtur-place-pins:${obtenerSesion()?.usuario?.id||'guest'}`;
    function guardarLugarFijado(elemento,activo){try{const pins=JSON.parse(localStorage.getItem(lugarPinsClave())||'{}');if(activo)pins[String(elemento.id)]={id:String(elemento.id),nombre:elemento.nombre,direccion:elemento.direccion,categorias:elemento.categorias,imagen:elemento.imagen,enlace:elemento.enlace,createdAt:new Date().toISOString()};else delete pins[String(elemento.id)];localStorage.setItem(lugarPinsClave(),JSON.stringify(pins))}catch{/* el guardado remoto sigue siendo la fuente principal */}}
    const tipoInteraccion=elemento=>elemento.tipo==='event'?'event':elemento.tipo==='company'?'company':'place';
    const enlaceAcceso=()=>{const url=new URL('login.php',window.location.href);url.searchParams.set('returnTo',`${location.pathname}${location.search}`);return url.href};
    async function actualizarSesionInteraccion(){const actual=sesionAlmacenada();if(!actual?.refreshToken)return null;try{const respuesta=await fetch(`${BASE_API}/api/auth/refresh`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({refreshToken:actual.refreshToken})});const renewed=await respuesta.json().catch(()=>null);if(!respuesta.ok||!renewed?.token||!renewed?.usuario?.id){if(respuesta.status===401){localStorage.removeItem('sigtur-session');tokenSesionValidado=null}return null}tokenSesionValidado=renewed.token;localStorage.setItem('sigtur-session',JSON.stringify({...actual,...renewed,profileValidated:true}));return renewed}catch{return null}}
    async function validarSesionMapa(){let actual=sesionAlmacenada();if(!actual?.token)return;try{let respuesta=await fetch(`${BASE_API}/api/auth/me`,{headers:{Authorization:`Bearer ${actual.token}`}});if(respuesta.status===401&&actual.refreshToken){const renewed=await actualizarSesionInteraccion();if(renewed){actual=sesionAlmacenada();respuesta=await fetch(`${BASE_API}/api/auth/me`,{headers:{Authorization:`Bearer ${actual.token}`}})}}const cargautil=await respuesta.json().catch(()=>null);if(!respuesta.ok||!cargautil?.usuario?.id||!cargautil.usuario.nombre||!cargautil.usuario.correo){if(respuesta.status===401){localStorage.removeItem('sigtur-session');tokenSesionValidado=null}return}tokenSesionValidado=actual.token;localStorage.setItem('sigtur-session',JSON.stringify({...actual,usuario:cargautil.usuario,profileValidated:true}))}catch{/* Keep cached profile hidden until the server validates it. */}}
    window.addEventListener('storage',evento=>{if(evento.key!=='sigtur-session')return;tokenSesionValidado=null;const actualizar=()=>{const seleccionado=elementos.find(elemento=>elemento.id===identificadorSeleccionado);if(seleccionado)cargarInteracciones(seleccionado)};if(!evento.newValue){actualizar();return}validarSesionMapa().finally(actualizar)});
    async function solicitarInteraccion(ruta,opciones={},reintentado=false){let actual=sesionAlmacenada();if(actual?.expiresAt&&Number(actual.expiresAt)<=Math.floor(Date.now()/1000)+30){const renewed=await actualizarSesionInteraccion();if(renewed)actual=sesionAlmacenada()}const ficha=actual?.token,encabezados={'Content-Type':'application/json',...(opciones.headers||{})};if(ficha)encabezados.Authorization=`Bearer ${ficha}`;let respuesta;try{respuesta=await fetch(`${BASE_API}${ruta}`,{...opciones,headers: encabezados})}catch{throw new Error('No se pudo conectar al servidor. Intentá nuevamente.')}const cargautil=await respuesta.json().catch(()=>null);if(respuesta.status===401&&!reintentado&&actual?.refreshToken){const renewed=await actualizarSesionInteraccion();if(renewed)return solicitarInteraccion(ruta,opciones,true)}if(!respuesta.ok){if(respuesta.status===401){localStorage.removeItem('sigtur-session');tokenSesionValidado=null}throw Object.assign(new Error(cargautil?.error||'No se pudo completar la operacion.'),{status:respuesta.status})}return cargautil}
    window.sigturSolicitarInteraccion=solicitarInteraccion;
    function claveInteraccion(elemento){return new URLSearchParams({entidad_tipo:tipoInteraccion(elemento),entidad_id:String(elemento.id)}).toString()}
    async function cargarInteracciones(elemento){
      const estado=detalle.querySelector('[data-interaccion-estado]');
      if(!estado)return;
      estado.textContent='Cargando actividad…';
      try{
        const [estado,resultadoComentarios]=await Promise.all([
          solicitarInteraccion(`/api/likes/estado?${claveInteraccion(elemento)}`),
          solicitarInteraccion(`/api/comentarios?${claveInteraccion(elemento)}`),
        ]);
        const comentarios=await Promise.all((resultadoComentarios.data||[]).map(async comentario=>{
          try{return{...comentario,likeState:await solicitarInteraccion(`/api/comentarios/${comentario.id}/likes`)}}
          catch{return{...comentario,likeState:{liked:false,likes:0}}}
        }));
        const botonMeGusta=detalle.querySelector('[data-me-gusta]'),botonGuardar=detalle.querySelector('[data-guardar]'),avisoAcceso=detalle.querySelector('[data-acceso-requerido]');
        if(avisoAcceso)avisoAcceso.hidden=Boolean(obtenerSesion()?.token);
        if(botonMeGusta){botonMeGusta.classList.toggle('activo',Boolean(estado.liked));botonMeGusta.setAttribute('aria-pressed',String(Boolean(estado.liked)));botonMeGusta.textContent=`${estado.liked?'♥':'♡'} Me gusta (${estado.likes})`}
        if(botonGuardar){botonGuardar.classList.toggle('activo',Boolean(estado.saved));botonGuardar.setAttribute('aria-pressed',String(Boolean(estado.saved)));botonGuardar.textContent=estado.saved?'🔖 Guardado':'🔖 Guardar'}
        detalle._mapComments=comentarios;
        representarComentariosMapa(comentarios);
        estado.textContent='';
      }catch(error){estado.textContent=error.message||'No se pudo cargar la actividad.'}
    }
    function comentarioAutor(comentario){return[comentario.autor?.nombre,comentario.autor?.apellido].filter(Boolean).join(' ')||'Explorador'}
    function comentarioAvatar(comentario){const nombre=comentarioAutor(comentario),iniciales=nombre.split(/\s+/).slice(0,2).map(part=>part[0]).join('').toUpperCase()||'?';return`<span class="comentario-avatar">${comentario.autor?.avatar_url?`<img src="${escaparHtml(comentario.autor.avatar_url)}" alt="" onerror="this.remove()" loading="lazy" decoding="async">`:''}<span>${escaparHtml(iniciales)}</span></span>`}
    function representarComentariosMapa(comentarios) {
      const lista = detalle.querySelector('[data-comentario-lista]');
      if (!lista) return;
      const orden = detalle.querySelector('[data-comentario-orden][aria-pressed="true"]')?.dataset.comentarioOrden || 'newest';
      const porPadre = new Map();
      comentarios.forEach(comentario => {
        const clave = comentario.parent_id || 'root';
        porPadre.set(clave, [...(porPadre.get(clave) || []), comentario]);
      });
      const ordenar = entradas => [...entradas].sort((a, b) => {
        if (Boolean(a.fijado) !== Boolean(b.fijado)) return a.fijado ? -1 : 1;
        return orden === 'oldest'
          ? new Date(a.created_at) - new Date(b.created_at)
          : new Date(b.created_at) - new Date(a.created_at);
      });
      const representarComentario = comentario => {
        const respuestas = ordenar(porPadre.get(comentario.id) || []);
        const contenido = comentario.contenido ? `<p>${escaparHtml(comentario.contenido)}</p>` : '';
        const multimedia = window.sigturGenerarMultimediaComentario?.(comentario.media_urls) || '';
        const esAdministrador = obtenerSesion()?.usuario?.rol === 'admin', propio = obtenerSesion()?.usuario?.id === comentario.usuario_id, meGusta=comentario.likeState||{liked:false,likes:0};
        return `<article class="comentario-elemento ${comentario.fijado ? 'estado-fijado' : ''}" data-comentario-id="${escaparHtml(comentario.id)}" data-comentario-usuario="${escaparHtml(comentario.usuario_id)}"><div class="comentario-metadatos"><span class="comentario-autor">${comentarioAvatar(comentario)}<span><strong>${escaparHtml(comentarioAutor(comentario))}</strong><small>${comentario.autor?.rol === 'admin' ? 'Administrador' : 'Explorador'}${comentario.fijado ? ' · 📌 Fijado' : ''}</small></span></span><time>${new Date(comentario.created_at).toLocaleDateString('es-UY')}</time></div>${contenido}${multimedia}<div class="comentario-acciones"><button type="button" data-comentario-me-gusta aria-pressed="${meGusta.liked}">${meGusta.liked?'♥':'♡'} Me gusta (${meGusta.likes})</button><button type="button" data-comentario-respuesta>↩ Responder</button><button type="button" data-comentario-mensaje>✉ Mensaje</button><button type="button" data-reportar>Reportar</button>${propio?'<button type="button" data-editar-comentario>Editar</button><button type="button" data-eliminar-propio>Eliminar</button>':''}${esAdministrador&&!propio?'<button type="button" data-administracion-eliminar>Eliminar</button>':''}</div><div class="comentario-respuesta-formulario" hidden><textarea rows="2" maxlength="2000" placeholder="Responder a ${escaparHtml(comentarioAutor(comentario))}..."></textarea><button class="interaccion-boton" type="button" data-enviar-respuesta>Publicar</button></div>${respuestas.length ? `<div class="comentario-respuestas"><span>${respuestas.length} ${respuestas.length === 1 ? 'respuesta' : 'respuestas'}</span>${respuestas.map(representarComentario).join('')}</div>` : ''}</article>`;
      };
      const raices = ordenar(porPadre.get('root') || []);
      lista.innerHTML = raices.length ? raices.map(representarComentario).join('') : '<p class="comentario-estado">Todavía no hay comentarios.</p>';
    }
    function representarInteracciones() {
      return `<section class="interaccion-caja" data-interacciones><div class="interaccion-acciones"><button class="interaccion-boton" type="button" data-me-gusta>♥ Me gusta</button><button class="interaccion-boton" type="button" data-guardar>🔖 Guardar</button></div><div class="comentario-filtro" role="group" aria-label="Ordenar comentarios"><button type="button" data-comentario-orden="newest" aria-pressed="true">Recientes</button><button type="button" data-comentario-orden="oldest" aria-pressed="false">Antiguos</button></div><p class="comentario-estado" data-interaccion-estado>Consultando actividad…</p><div class="comentario-lista" data-comentario-lista></div><form class="comentario-formulario" data-comentario-formulario data-comentario-multimedia-formulario><textarea name="contenido" rows="2" maxlength="2000" placeholder="Compartí tu experiencia o adjuntá una imagen..."></textarea><button class="interaccion-boton" type="submit">Publicar</button></form><p class="comentario-acceso-nota" data-acceso-requerido hidden>Para comentar, <a href="${escaparHtml(enlaceAcceso())}">inicia sesion</a>.</p></section>`
    }
    function seleccionar(id,mover=false){const elemento=elementos.find(valor=>valor.id===id);if(!elemento)return;identificadorSeleccionado=elemento.id;const marcador=marcadores.get(elemento.id);if(mover)mapa.flyTo([elemento.lat,elemento.lng],16,{duration:.65});establecerEstadoMapa('');const urlMapa=`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${elemento.lat},${elemento.lng}`)}`;detalle.innerHTML=`${multimedia(elemento,'detail-media')}<div class="detalle-cuerpo"><button class="detalle-cerrar" type="button" aria-label="Cerrar ficha">×</button><h2>${escaparHtml(elemento.nombre)}</h2><div class="rotulos">${elemento.categorias.map(categoria=>`<button type="button" class="rotulo etiqueta-${claveEtiqueta(categoria)}" data-mapa-categoria="${escaparHtml(categoria)}" title="Filtrar por ${escaparHtml(categoria)}">${escaparHtml(categoria)}</button>`).join('')}</div><p class="detalle-resumen">${escaparHtml(elemento.resumen)}</p><p class="detalle-mas" hidden>${escaparHtml(elemento.descripcion)}</p>${elemento.direccion?`<p class="detalle-resumen">📍 ${escaparHtml(elemento.direccion)}</p>`:''}<div class="detalle-acciones"><button class="accion principal" type="button" data-mas>Mostrar más</button><a class="accion" href="${urlMapa}" target="_blank" rel="noopener">Cómo llegar</a>${elemento.enlace?`<a class="accion" href="${escaparHtml(elemento.enlace)}">Ver ficha</a>`:''}</div>${representarInteracciones()}</div>`;detalle.hidden=false;representarResultados(filtrado());if(marcador)marcador.setZIndexOffset(1000);cargarInteracciones(elemento)}
    function cerrarDetalle(){identificadorSeleccionado=null;detalle.hidden=true;representarResultados(filtrado())}
    async function cultural(){try{const respuesta=await fetch('../kml/mapa_bienes_culturales_salto_uruguay.kml');if(!respuesta.ok)throw Error();const xml=new DOMParser().parseFromString(await respuesta.text(),'application/xml');return[...xml.querySelectorAll('Placemark')].map(marca=>{const coords=marca.querySelector('Point coordinates')?.textContent?.trim().split(/\s+/)[0].split(',')||[];const carpeta=marca.parentElement?.querySelector(':scope > name')?.textContent||'Patrimonio cultural';return normalizar({nombre:marca.querySelector('name')?.textContent,descripcion:`Bien de ${carpeta} incluido en el mapa cultural de Salto.`,categoria:['Histórico','Cultura'],tipo:'patrimonio',lng:coords[0],lat:coords[1]})}).filter(elemento=>Number.isFinite(elemento.lat)&&Number.isFinite(elemento.lng))}catch{return[]}}
    async function load(){let api=[];cargando=true;representarResultados([]);try{const respuesta=await fetch(`${BASE_API}/mapa`);if(!respuesta.ok)throw new Error('La solicitud del mapa no se pudo completar.');const cargautil=await respuesta.json();const registros=Array.isArray(cargautil)?cargautil:cargautil.data||cargautil.puntos||[];api=registros.map(normalizar).filter(elemento=>Number.isFinite(elemento.lat)&&Number.isFinite(elemento.lng));errorCarga=false}catch{try{const respuesta=await fetch(API_MAPA_LOCAL);if(!respuesta.ok)throw new Error('La solicitud del mapa no se pudo completar.');const cargautil=await respuesta.json();const registros=Array.isArray(cargautil)?cargautil:cargautil.data||cargautil.puntos||[];api=registros.map(normalizar).filter(elemento=>Number.isFinite(elemento.lat)&&Number.isFinite(elemento.lng));errorCarga=false}catch{errorCarga=true}}
      elementos=[...destacados.map(normalizar)];api.forEach(elemento=>{if(!esDuplicado(elemento,elementos))elementos.push(elemento)});(await cultural()).forEach(elemento=>{if(!esDuplicado(elemento,elementos))elementos.push(elemento)});
      cargando=false;
      const foco=identificadorUrl(parametros.get('focus'));const inicialConsulta=parametros.get('q');if(inicialConsulta)busqueda.value=inicialConsulta;
      const objetivo=elementos.find(elemento=>identificadorUrl(elemento.id)===foco||identificadorUrl(elemento.nombre)===foco);
      representarDestinosRuta();actualizar(!objetivo);
      if(objetivo)seleccionar(objetivo.id,true);
      if(errorCarga)establecerEstadoMapa('No se pudo conectar con el servidor de datos. Mostrando lugares destacados y patrimonio local.','error');
    }
    function ubicarme(){
      if(!navigator.geolocation){establecerEstadoMapa('Tu navegador no soporta geolocalización.','error');return}
      botonUbicar.disabled=true;botonUbicar.textContent='Buscando ubicación…';
      navigator.geolocation.getCurrentPosition(posicion=>{
        posicionUsuario={lat:posicion.coords.latitude,lng:posicion.coords.longitude};
        if(!marcadorUsuario){marcadorUsuario=L.marker([posicionUsuario.lat,posicionUsuario.lng],{icon:L.divIcon({className:'',html:'<span class="usuario-marcador"></span>',iconSize:[18,18],iconAnchor:[9,9]}),title:'Tu ubicación',zIndexOffset:2000}).addTo(mapa)}
        else marcadorUsuario.setLatLng([posicionUsuario.lat,posicionUsuario.lng]);
        botonUbicar.disabled=false;botonUbicar.textContent='📍 Ubicación activa';botonUbicar.setAttribute('aria-pressed','true');
        establecerEstadoMapa('Ordenando resultados por cercanía a tu ubicación.','info');
        actualizar();
      },()=>{
        botonUbicar.disabled=false;botonUbicar.textContent='📍 Usar mi ubicación';
        establecerEstadoMapa('No pudimos acceder a tu ubicación. Revisá los permisos del navegador.','error');
      },{enableHighAccuracy:true,timeout:8000});
    }
    function limpiarTodo(){
      busqueda.value='';categoriaActiva='';
      if(posicionUsuario){posicionUsuario=null;botonUbicar.textContent='📍 Usar mi ubicación';botonUbicar.removeAttribute('aria-pressed');if(marcadorUsuario){mapa.removeLayer(marcadorUsuario);marcadorUsuario=null}}
      cerrarDetalle();actualizar();
    }
    busqueda.addEventListener('input',esperarPausa(()=>actualizar(),250));
    fichas.addEventListener('click',evento=>{const boton=evento.target.closest('[data-categoria]');if(!boton)return;categoriaActiva=boton.dataset.categoria;actualizar()});
    resultados.addEventListener('click',evento=>{const boton=evento.target.closest('[data-id]');if(boton)seleccionar(boton.dataset.id,true)});
    detalle.addEventListener('click',async evento=>{if(evento.target.closest('.detalle-cerrar'))cerrarDetalle();if(evento.target.closest('[data-mas]')){const mas=detalle.querySelector('.detalle-mas'),boton=evento.target.closest('[data-mas]');mas.hidden=!mas.hidden;boton.textContent=mas.hidden?'Mostrar más':'Mostrar menos'}const elemento=elementos.find(valor=>valor.id===identificadorSeleccionado);if(!elemento)return;if(evento.target.closest('[data-administracion-eliminar]')){const comentario=evento.target.closest('[data-comentario-id]');if(!confirm('¿Eliminar este comentario?'))return;try{await solicitarInteraccion(`/api/admin/comentarios/${comentario.dataset.comentarioId}`,{method:'DELETE'});await cargarInteracciones(elemento)}catch(error){detalle.querySelector('[data-interaccion-estado]').textContent=error.message}return}if(evento.target.closest('[data-me-gusta],[data-guardar]')){if(!obtenerSesion()?.token){window.location.href=enlaceAcceso();return}const boton=evento.target.closest('[data-me-gusta],[data-guardar]'),guardado=boton.hasAttribute('data-guardar'),activo=!boton.classList.contains('activo');try{await solicitarInteraccion(`/api/${guardado?'guardados':'likes'}`,{method:'POST',body:JSON.stringify({entidad_tipo:tipoInteraccion(elemento),entidad_id:String(elemento.id),activo:activo})});if(guardado)guardarLugarFijado(elemento,activo);await cargarInteracciones(elemento)}catch(error){detalle.querySelector('[data-interaccion-estado]').textContent=error.message}}if(evento.target.closest('[data-reportar]')){if(!obtenerSesion()?.token){window.location.href=enlaceAcceso();return}const comentario=evento.target.closest('[data-comentario-id]'),motivo=prompt('Motivo del reporte:');if(!motivo)return;try{await solicitarInteraccion(`/api/comentarios/${comentario.dataset.comentarioId}/reportar`,{method:'POST',body:JSON.stringify({motivo})});comentario.querySelector('[data-reportar]').textContent='Reportado'}catch(error){detalle.querySelector('[data-interaccion-estado]').textContent=error.message}}});
    detalle.addEventListener('submit', async evento => {
      if (!evento.target.matches('[data-comentario-formulario]')) return;
      evento.preventDefault();
      if (!obtenerSesion()?.token) { window.location.href = enlaceAcceso(); return; }
      const formulario = evento.target;
      const elemento = elementos.find(valor => valor.id === identificadorSeleccionado);
      if (!elemento) return;
      const enviar = formulario.querySelector('[type="submit"]');
      const contenido = new FormData(formulario).get('contenido');
      try {
        if (enviar) { enviar.disabled = true; enviar.textContent = 'Publicando…'; }
        detalle.querySelector('[data-interaccion-estado]').textContent = 'Publicando tu comentario…';
        const rutasMultimedia = await window.sigturPrepararMultimediaComentario(formulario);
        if (!String(contenido || '').trim() && !rutasMultimedia.length) throw Error('Escribí un comentario o adjuntá una imagen.');
        await solicitarInteraccion('/api/comentarios', {
          method: 'POST',
          body: JSON.stringify({ entidad_tipo: tipoInteraccion(elemento), entidad_id: String(elemento.id), contenido, media_paths: rutasMultimedia }),
        });
        formulario.reset();
        window.sigturLimpiarMultimediaComentario(formulario);
        await cargarInteracciones(elemento);
      } catch (error) {
        detalle.querySelector('[data-interaccion-estado]').textContent = error.message;
      } finally {
        if (enviar) { enviar.disabled = false; enviar.textContent = 'Publicar'; }
      }
    });
    detalle.addEventListener('click', async evento => {
      const elemento = elementos.find(valor => valor.id === identificadorSeleccionado);
      if (!elemento) return;
      const categoria = evento.target.closest('[data-mapa-categoria]');
      if (categoria) { categoriaActiva = categoria.dataset.mapaCategoria; busqueda.value = ''; cerrarDetalle(); actualizar(); return; }
      const botonOrden = evento.target.closest('[data-comentario-orden]');
      if (botonOrden) {
        detalle.querySelectorAll('[data-comentario-orden]').forEach(boton => boton.setAttribute('aria-pressed', String(boton === botonOrden)));
        representarComentariosMapa(detalle._mapComments || []);
        return;
      }
      const comentario = evento.target.closest('[data-comentario-id]');
      if (!comentario) return;
      if (evento.target.closest('[data-reportar]')) return;
      try {
        if (!obtenerSesion()?.token) { window.location.href = enlaceAcceso(); return; }
        if (evento.target.closest('[data-editar-comentario]')) {
          const actual = (detalle._mapComments || []).find(entrada => entrada.id === comentario.dataset.comentarioId)?.contenido || '';
          const contenido = window.prompt('Edita tu comentario:', actual);
          if (contenido === null || !contenido.trim()) return;
          await solicitarInteraccion(`/api/comentarios/${comentario.dataset.comentarioId}`, { method: 'PATCH', body: JSON.stringify({ contenido }) });
          await cargarInteracciones(elemento);
          return;
        }
        if (evento.target.closest('[data-eliminar-propio]')) {
          if (!window.confirm('Eliminar tu comentario y sus respuestas?')) return;
          await solicitarInteraccion(`/api/comentarios/${comentario.dataset.comentarioId}`, { method: 'DELETE' });
          await cargarInteracciones(elemento);
          return;
        }
        if (evento.target.closest('[data-comentario-respuesta]')) {
          comentario.querySelector('.comentario-respuesta-formulario').hidden = false;
          comentario.querySelector('textarea')?.focus();
          return;
        }
        if (evento.target.closest('[data-enviar-respuesta]')) {
          const contenido = comentario.querySelector('textarea')?.value || '';
          if (!contenido.trim()) return;
          await solicitarInteraccion(`/api/comentarios/${comentario.dataset.comentarioId}/respuestas`, { method: 'POST', body: JSON.stringify({ contenido }) });
          await cargarInteracciones(elemento);
          return;
        }
        if (evento.target.closest('[data-comentario-me-gusta]')) {
          const estado = await solicitarInteraccion(`/api/comentarios/${comentario.dataset.comentarioId}/likes`);
          await solicitarInteraccion(`/api/comentarios/${comentario.dataset.comentarioId}/likes`, { method: 'POST', body: JSON.stringify({ activo: !estado.liked }) });
          await cargarInteracciones(elemento);
          return;
        }
        if (evento.target.closest('[data-comentario-mensaje]')) {
          const contenido = window.prompt('Escribi tu mensaje:');
          if (contenido?.trim()) await solicitarInteraccion('/api/mensajes', { method: 'POST', body: JSON.stringify({ destinatario_id: comentario.dataset.comentarioUsuario, contenido }) });
        }
      } catch (error) {
        const estado = detalle.querySelector('[data-interaccion-estado]');
        if (estado) estado.textContent = error.message || 'No se pudo completar la accion.';
      }
    });
    botonUbicar.addEventListener('click',ubicarme);
    botonLimpiarFiltros.addEventListener('click',limpiarTodo);
    botonCalcularRuta.addEventListener('click',calcularRuta);
    botonLimpiarRuta.addEventListener('click',limpiarRuta);
    origenRuta.addEventListener('change',()=>{if(origenRuta.value==='user'&&!posicionUsuario)ubicarme()});
    function sincronizarOpcionesRuta(){const esAutomovil=modoRuta.value==='car';evitarPeajes.disabled=!esAutomovil;evitarAutopistas.disabled=!esAutomovil}
    modoRuta.addEventListener('change',sincronizarOpcionesRuta);
    sincronizarOpcionesRuta();
    const mostrarAyudaRuta=document.getElementById('mostrar-ayuda-ruta'),dialogoAyudaRuta=document.getElementById('dialogo-ayuda-ruta');
    mostrarAyudaRuta.addEventListener('click',()=>dialogoAyudaRuta.showModal());
    dialogoAyudaRuta.addEventListener('cancel',evento=>{evento.preventDefault();dialogoAyudaRuta.close()});
    dialogoAyudaRuta.addEventListener('keydown',evento=>{if(evento.key==='Escape'){evento.preventDefault();dialogoAyudaRuta.close()}});
    dialogoAyudaRuta.addEventListener('click',evento=>{if(evento.target===dialogoAyudaRuta)dialogoAyudaRuta.close()});
    load();
    validarSesionMapa().then(()=>{const seleccionado=elementos.find(elemento=>elemento.id===identificadorSeleccionado);if(seleccionado)cargarInteracciones(seleccionado)});
  </script>
</body>
</html>
