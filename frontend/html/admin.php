<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Configuracion Admin - SIGTUR Salto</title>
  <link rel="stylesheet" href="../css/font.css" />
  <link rel="stylesheet" href="../css/styles.css?v=20261113-visual-system" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
</head>

<!-- 
  page-admin. OJO: esta página no tiene ninguna protección real, o sea,
  cualquiera que escriba "admin.php" en la barra de direcciones entra
  derechito acá, sin login ni verificación de ningún tipo. No hay
  redirect tipo "si no estás logueado como admin, andate a login.php".
  Para un prototipo está bien (probablemente es intencional, para que
  se pueda mostrar la pantalla fácil en una demo), pero si esto se
  convierte en un sitio de verdad, ESTO ES LO PRIMERO que hay que
  arreglar antes de publicarlo: cualquier visitante puede tocar los
  switches de "modo mantenimiento" o "publicar eventos destacados"
  ahora mismo. Ver la nota de soporte.php sobre que el login guarda
  todo en localStorage nomás -- ni siquiera hay un login "real" del
  otro lado para chequear contra esto.
-->
<body class="page-admin">

<!-- 
  Navbar simplificada: mismo logo y links de siempre, pero SIN 
  buscador funcional con la misma lógica de turismo (achica el header 
  a lo esencial porque esta pantalla es mas "utilitaria" que las 
  páginas de contenido). El aria-label del logo dice "Abrir menu" en 
  vez de "Inicio" como en otras páginas -- pequeña inconsistencia de 
  texto (en index.php decía aria-label="Inicio"), no rompe nada pero 
  vale la pena unificarlo
-->
<header>
  <nav class="navbar">
    <a class="nav-logo" href="index.php" aria-label="Abrir menu">
      <img src="../imagenes/logo-salto.svg" alt="Explora Salto" />
    </a>

    <div class="nav-search">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
      <input type="text" placeholder='"Que queres descubrir hoy en Salto?"' />
    </div>

    <!-- 
      curioso: acá NINGÚN link tiene class="active", ni siquiera algo 
      relacionado a "Admin" (que ni existe como opción en este menú). 
      Tiene sentido porque Admin no es una de las 3 secciones 
      principales (Eventos/Turismo/Lugares), es más una pantalla 
      "aparte" a la que se llega por otro lado (el menú circular del 
      logo que arma buildLogoMenu() en main.js, según vimos comentado 
      en index.php)
    -->
    <div class="nav-links">
      <a href="eventos.php">Eventos</a>
      <a href="turismo.php">Turismo</a>
      <a href="lugares.php">Lugares</a>
    </div>
  </nav>
</header>

<!-- 
  
  CONTENIDO PRINCIPAL

  ".utility-page" / ".utility-shell" son clases que comparte con 
  soporte.php -- las dos son "páginas utilitarias" (formularios, 
  paneles, no contenido turístico), así que reusan el mismo layout 
  base y solo cambian el contenido de adentro. Buena reutilización 
  de estilos ahí, a diferencia de otras partes del sitio donde todo 
  se hardcodea de nuevo.
 -->
<main class="utility-page">
  <div class="utility-shell">
    <div class="utility-header">
      <div class="utility-kicker">Panel interno</div>
      <a class="utility-back-link" href="index.php" aria-label="Volver al inicio">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
        Volver a inicio
      </a>
    </div>
    <h1>Configuracion para admins</h1>
    <p>
      Vista simple para ajustar contenido, publicar avisos y revisar el estado
      general de la pagina sin entrar todavia en una base de datos.
    </p>
    <!-- 
      ^ esta frase "sin entrar todavia en una base de datos" confirma 
      lo que sospechabamos: todo lo que se guarda acá (switches, 
      avisos, etc) vive en localStorage del navegador, NO en un 
      servidor. Si limpian el localStorage o entran desde otra 
      computadora, no van a ver los mismos datos. Es una limitación 
      conocida y aceptada del prototipo, no un bug escondido.
    -->

    <div class="utility-grid admin-grid">

      <!-- 
        
        PANEL: Ajustes de página
       
        4 switches (toggle on/off) para prender/apagar features del 
        sitio. Cada uno es un <label> que envuelve un checkbox real 
        (input type=checkbox, class="switch-input") + un span decorativo 
        (class="switch-control") que es el que se ve como el toggle 
        visual -- patrón clásico de "checkbox escondido + CSS que 
        dibuja el interruptor encima" (buscar .switch-input y 
        .switch-control en styles.css para ver el truco de CSS).
        Esto es full accesible: sigue siendo un checkbox real por 
        debajo, funciona con teclado y con lectores de pantalla, 
        no es solo un div con onclick.
      -->
      <section class="admin-panel">
        <div class="panel-heading">
          <h2>Ajustes de pagina</h2>
          <!-- este span probablemente lo actualiza main.js cuando 
               guarda cambios (algo tipo "Guardando..." -> "Guardado 
               local" con un setTimeout, es un patrón común) -->
          <span class="status-pill" id="admin-save-status">Guardado local</span>
        </div>
        <form id="admin-settings-form" class="settings-list">
          <label class="settings-item">
            <div>
              <strong>Publicar eventos destacados</strong>
              <span>Permite mostrar eventos nuevos en la pagina principal.</span>
            </div>
            <input class="switch-input" type="checkbox" name="featuredEvents" checked />
            <span class="switch-control" aria-hidden="true"></span>
          </label>
          <label class="settings-item">
            <div>
              <strong>Revisar lugares antes de publicar</strong>
              <span>Deja las fichas nuevas en revision visual.</span>
            </div>
            <input class="switch-input" type="checkbox" name="reviewPlaces" checked />
            <span class="switch-control" aria-hidden="true"></span>
          </label>
          <label class="settings-item">
            <div>
              <strong>Mostrar soporte en menu</strong>
              <span>Acceso rapido para consultas de usuarios y comercios.</span>
            </div>
            <input class="switch-input" type="checkbox" name="showSupport" checked />
            <span class="switch-control" aria-hidden="true"></span>
          </label>
          <label class="settings-item">
            <div>
              <strong>Modo mantenimiento</strong>
              <span>Muestra una advertencia interna para evitar publicar cambios incompletos.</span>
            </div>
            <!-- este es el único switch que arranca DESAPAGADO (sin 
                 "checked") de los 4 -- tiene sentido, el modo 
                 mantenimiento no debería estar prendido por defecto -->
            <input class="switch-input" type="checkbox" name="maintenanceMode" />
            <span class="switch-control" aria-hidden="true"></span>
          </label>
        </form>
      </section>

      <!-- 
        
        PANEL: Resumen (metricas)
        
        4 numeritos tipo "dashboard". Los data-admin-metric="..." son 
        ganchos para que main.js los actualice dinámicamente (aunque 
        acá vienen con valores hardcodeados de partida: 12, 8, 3, 2). 
        No hay ningún cálculo real detrás -- no cuenta cuántos 
        .event-card hay en eventos.php ni nada por el estilo, son 
        numeros de mentira puestos a mano para que la pantalla no se 
        vea vacía. Si en algún momento quieren que sean reales, hay 
        que armar algún tipo de "fuente de datos" compartida (un JSON, 
        un backend, algo) de la que main.js pueda leer los conteos 
        de verdad.
      -->
      <section class="utility-card">
        <h2>Resumen</h2>
        <div class="metric-grid">
          <article><span>Eventos activos</span><strong data-admin-metric="events">12</strong></article>
          <article><span>Lugares publicados</span><strong data-admin-metric="places">8</strong></article>
          <article><span>Consultas pendientes</span><strong data-admin-metric="tickets">3</strong></article>
          <article><span>Revision</span><strong data-admin-metric="review">2</strong></article>
        </div>
      </section>

      <!-- 
       
        PANEL: Aviso del sitio
        
        Formulario para escribir un anuncio corto (tipo "Termas 
        abiertas este finde") que se guarda y se puede mostrar en 
        algún lado del sitio (no vimos todavía DÓNDE se muestra ese 
        aviso en las otras páginas -- puede ser que esta feature esté 
        a medio conectar, o que se muestre solo dentro de esta misma 
        pantalla en el <p id="admin-announcement-preview">).
      -->
      <section class="admin-panel">
        <h2>Aviso del sitio</h2>
        <form id="admin-announcement-form">
          <div class="form-row">
            <label for="announcement-title">Titulo</label>
            <input id="announcement-title" name="title" type="text" placeholder="Ej: Termas abiertas este finde" />
          </div>
          <div class="form-row">
            <label for="announcement-body">Mensaje</label>
            <textarea id="announcement-body" name="body" placeholder="Escribi un aviso corto para mostrar al equipo"></textarea>
          </div>
          <div class="button-row">
            <button class="btn-primary" type="submit">Guardar aviso</button>
            <button class="btn-secondary" type="button" id="admin-clear-announcement">Limpiar</button>
          </div>
          <!-- este parrafo probablemente se actualiza en vivo con lo 
               que vas escribiendo arriba (o al guardar), mostrando 
               una vista previa del aviso. arranca con el texto por 
               defecto "Sin aviso publicado." -->
          <p class="form-help" id="admin-announcement-preview">Sin aviso publicado.</p>
        </form>
      </section>

      <!-- 
      
        PANEL: Acciones rápidas
        
        3 links directos (Eventos / Lugares / Soporte) + un botón de 
        "Exportar estado" que NO es un link, es un <button> con JS 
        atrás (probablemente arma un JSON o similar con la 
        configuración actual y lo descarga, ver id="admin-export" 
        en main.js). Los 3 primeros usan la clase "glass-action" 
        tanto en <a> como en el <button>, mostrando que la clase de 
        estilo no depende del tag HTML, es puramente visual.
      -->
      <section class="utility-card">
        <h2>Acciones rapidas</h2>
        <div class="admin-actions">
          <a class="glass-action" href="eventos.php">Revisar eventos</a>
          <a class="glass-action" href="lugares.php">Ver lugares</a>
          <a class="glass-action" href="soporte.php">Abrir soporte</a>
          <button class="glass-action" type="button" id="admin-export">Exportar estado</button>
        </div>
        <!-- 
          este div vacío es donde main.js probablemente va agregando 
          un log de actividad (tipo "Se guardó el aviso a las 14:32", 
          "Se activó modo mantenimiento", etc), aria-live="polite" de 
          nuevo para que se anuncie automáticamente a lectores de 
          pantalla apenas se agrega una entrada nueva
        -->
        <div class="activity-list" id="admin-activity" aria-live="polite"></div>
      </section>

      <section class="admin-panel">
        <h2>Crear evento</h2>
        <form id="admin-event-form" class="settings-list">
          <div class="form-row"><label for="admin-event-title">Título</label><input id="admin-event-title" name="title" required></div>
          <div class="form-row"><label for="admin-event-description">Descripción</label><textarea id="admin-event-description" name="description" placeholder="Opcional"></textarea></div>
          <div class="form-row"><label for="admin-event-location">Lugar</label><input id="admin-event-location" name="location" required></div>
          <!-- El mapa define el punto exacto que usaran los marcadores publicos. -->
          <div class="form-row"><label>Ubicación en el mapa</label><div id="admin-event-map" class="admin-event-map" aria-label="Selector de ubicación del evento"></div><p class="form-help">Hacé clic en el mapa para fijar el punto del evento.</p><div class="admin-event-coordinates"><label for="admin-event-latitude">Latitud<input id="admin-event-latitude" name="latitude" type="number" step="any" min="-90" max="90" required></label><label for="admin-event-longitude">Longitud<input id="admin-event-longitude" name="longitude" type="number" step="any" min="-180" max="180" required></label></div></div>
          <div class="form-row"><label for="admin-event-date-start">Desde</label><input id="admin-event-date-start" name="date_start" type="date" required></div>
          <div class="form-row"><label for="admin-event-date-end">Hasta</label><input id="admin-event-date-end" name="date_end" type="date"></div>
          <div class="form-row"><label for="admin-event-categories">Categorías</label><input id="admin-event-categories" name="categories" placeholder="música, cultura"></div>
          <div class="form-row"><label for="admin-event-price">Precio (0 para gratuito)</label><input id="admin-event-price" name="price" type="number" min="0" step="1" value="0"></div>
          <div class="form-row"><label for="admin-event-color">Color del evento</label><input id="admin-event-color" name="color" type="color" value="#16b3a3" title="Elegí el color principal del evento"></div>
          <div class="form-row"><label for="admin-event-image">Imagen de portada (URL)</label><input id="admin-event-image" name="image_url" type="url" placeholder="https://..."></div>
          <button class="btn-primary" type="submit">Publicar evento</button>
        </form>
      </section>

      <section class="admin-panel">
        <h2>Usuarios y moderación</h2>
        <p id="admin-resource-status" class="form-help" aria-live="polite"></p>
        <ul id="admin-users-list" class="admin-users-list"></ul>
        <h3>Comentarios recientes</h3>
        <ul id="admin-comments-list" class="admin-users-list"></ul>
        <p class="form-help">Para convertir una cuenta en administradora, ejecutá <code>database/migration_admin.sql</code> reemplazando el correo.</p>
      </section>
    </div>
  </div>
</main>

<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script src="../js/api-config.js"></script>
<script src="../js/main.js?v=20260915-admin-v5"></script>
</body>
</html>
