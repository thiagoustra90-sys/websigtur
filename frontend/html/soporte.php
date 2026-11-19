<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Soporte - SIGTUR Salto</title>
  <link rel="stylesheet" href="../css/font.css" />
  <link rel="stylesheet" href="../css/styles.css" />
  <link rel="stylesheet" href="../css/support-events.css?v=20261118" />
</head>

<!-- page-soporte, misma convención de siempre -->
<body class="page-soporte">

<!--
  navbar simplificada, calcada de admin.php (mismo aria-label "Abrir
  menu" en el logo, mismos 3 links sin ninguno "active"). Si alguna
  vez arreglan la inconsistencia del aria-label en admin.php,
  arreglarla acá también para que sean coherentes entre sí
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
      <input type="search" aria-label="Buscar en SIGTUR" autocomplete="off" placeholder="¿Qué querés descubrir hoy en Salto?" />
    </div>

    <div class="nav-links">
      <a href="eventos.php">Eventos</a>
      <a href="turismo.php">Turismo</a>
      <a href="lugares.php">Lugares</a>
    </div>
  </nav>
</header>

<!--
  CONTENIDO PRINCIPAL
  mismo esqueleto ".utility-page" / ".utility-shell" que admin.php,
  osea que estas dos páginas están hechas para verse "hermanas"
  visualmente (mismo kicker arriba, mismo h1 grande, mismo grid de
  secciones abajo). Tiene sentido: son las dos páginas "de sistema"
  del sitio, separadas del contenido turístico
 -->
<main class="utility-page">
  <div class="utility-shell">
    <div class="utility-header">
      <div class="utility-kicker">Ayuda</div>
      <a class="utility-back-link" href="index.php" aria-label="Volver al inicio">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
        Volver a inicio
      </a>
    </div>
    <h1>Soporte</h1>
    <p>
      Espacio para consultas sobre turismo, eventos, lugares publicados o
      problemas de acceso a la página.
    </p>
    <nav class="support-action-bar" aria-label="Acciones de soporte">
      <a class="support-action primary" href="#support-form">Crear ticket</a>
      <a class="support-action" href="#support-ticket-list">Mis tickets</a>
    </nav>

    <div class="utility-grid support-grid">

      <!-- Formulario de soporte y solicitud de verificacion, guardados por la API. -->
      <section class="support-panel">
        <div class="panel-heading">
          <h2>Enviar consulta</h2>
          <!-- este "Listo" probablemente cambia a "Enviado" o similar
               despues de submitear el form, ver #support-status en
               main.js -->
          <span class="status-pill" id="support-status">Listo</span>
        </div>
        <form id="support-form" action="#">
          <div class="form-row">
            <label for="support-name">Nombre</label>
            <input id="support-name" name="name" type="text" placeholder="Tu nombre" required />
          </div>
          <div class="form-row">
            <label for="support-email">Correo</label>
            <input id="support-email" name="email" type="email" placeholder="correo@ejemplo.com" required />
          </div>
          <div class="form-row">
            <label for="support-topic">Tema</label>
            <select id="support-topic" name="topic">
              <option value="account">Cuenta</option>
              <option value="events">Eventos</option>
              <option value="places">Lugares</option>
              <option value="settings">Configuración</option>
              <option value="commerce">Comercios</option>
              <option value="business_verification">Verificación de empresa u organización</option>
            </select>
          </div>
          <fieldset id="support-business-fields" class="support-verification-fields" hidden disabled>
            <legend>Datos para verificar la cuenta</legend>
            <p>Esta solicitud debe enviarse desde la cuenta que querés verificar. No compartas contraseñas ni códigos de acceso.</p>
            <div class="form-row"><label for="support-organization-type">Tipo de cuenta</label><select id="support-organization-type" name="organization_type" required><option value="">Elegí una opción</option><option value="company">Empresa o comercio</option><option value="nonprofit">Organización o asociación</option><option value="tourism_service">Servicio turístico</option><option value="independent_professional">Profesional independiente</option></select></div>
            <div class="form-row"><label for="support-legal-name">Razón social o nombre legal</label><input id="support-legal-name" name="legal_name" maxlength="180" required></div>
            <div class="form-row"><label for="support-public-name">Nombre público o comercial</label><input id="support-public-name" name="public_name" maxlength="180" required></div>
            <div class="form-row"><label for="support-registration-number">RUT o registro (si corresponde)</label><input id="support-registration-number" name="registration_number" maxlength="80" autocomplete="off"></div>
            <div class="form-row"><label for="support-phone">Teléfono de contacto</label><input id="support-phone" name="phone" type="tel" autocomplete="tel" minlength="7" maxlength="40" required></div>
            <div class="form-row"><label for="support-business-address">Dirección del establecimiento</label><input id="support-business-address" name="address" maxlength="250" required></div>
            <div class="form-row"><label for="support-locality">Localidad o departamento</label><input id="support-locality" name="locality" maxlength="120" required></div>
            <div class="form-row"><label for="support-website">Sitio web o red social</label><input id="support-website" name="website" type="url" placeholder="https://..." maxlength="1500"></div>
            <div class="form-row"><label for="support-evidence-url">Enlace adicional que ayude a verificar</label><input id="support-evidence-url" name="evidence_url" type="url" placeholder="https://..." maxlength="1500"></div>
            <label class="support-verification-consent"><input name="authorization" type="checkbox" required> Confirmo que estoy autorizado/a a enviar estos datos en nombre de la cuenta.</label>
          </fieldset>
          <div class="form-row">
            <label id="support-message-label" for="support-message">Mensaje</label>
            <textarea id="support-message" name="message" placeholder="Contanos que necesitas revisar" required></textarea>
          </div>
          <div class="button-row">
            <!--
              ojo con la diferencia entre los 2 botones: "Crear ticket"
              es type="submit" (dispara el form), pero "Limpiar" es
              type="reset" -- distinto de admin.php donde el botón
              "Limpiar" era type="button" con un id para que main.js
              lo maneje a mano (#admin-clear-announcement). Acá en
              cambio usan el reset NATIVO del navegador (type="reset"),
              que vacía el formulario solo, sin necesitar JS para eso.
              Ambas soluciones funcionan, pero es un ejemplo de que el
              mismo equipo resolvió un problema parecido de dos formas
              distintas en dos páginas distintas. No es grave, pero
              si quieren unificar el estilo de código, elegir un
              enfoque y aplicarlo en las dos.
            -->
            <button class="btn-primary" type="submit">Crear ticket</button>
            <button class="btn-secondary" type="reset">Limpiar</button>
          </div>
          <p class="form-help">La consulta se envía al equipo de SIGTUR y queda registrada para su seguimiento.</p>

        </form>
      </section>

      <!--
        ============================================================
        PANEL: Canales
        3 formas de contacto alternativas. El mailto: es un link real
        que abre el cliente de correo del usuario (Gmail, Outlook,
        etc) con el correo público de contacto de la institución.

        El link de "Ubicación" reusa el mismo truco de Google Maps sin
        API key que vimos en lugares.php (maps/search/?api=1&query=...),
        consistente con el resto del sitio.
      -->
      <section class="utility-card">
        <h2>Canales</h2>
        <div class="contact-list">
          <a href="mailto:itssalto@gmail.com"><strong>Email</strong><span>itssalto@gmail.com</span></a>
          <a href="https://www.google.com/maps/search/?api=1&amp;query=Salto+Uruguay" target="_blank" rel="noopener"><strong>Ubicación</strong><span>Salto, Uruguay</span></a>
          <a href="admin.php"><strong>Admin</strong><span>Configuración interna</span></a>

        </div>
      </section>

      <!-- Los tickets y su estado se cargan desde el backend para la cuenta actual. -->
      <section class="utility-card support-wide">
        <h2>Tickets recientes</h2>
        <div class="ticket-list" id="support-ticket-list" aria-live="polite"></div>
      </section>

      <!--
        ============================================================
        PANEL: Atajos útiles
        4 líneas cortas con accesos directos. Las primeras 3 tienen
        un link real "Abrir", la última ("Contacto estimado: 24 h")
        es solo información, sin link -- inconsistencia menor de
        formato (todas parecen "filas" del mismo tipo pero solo 3 de
        4 son clickeables), aunque visualmente probablemente se nota
        la diferencia porque una no tiene el link de "Abrir" al lado
      -->
      <section class="utility-card">
        <h2>Atajos utiles</h2>
        <div class="pill-list">
          <span>Login y registro <a href="login.php">Abrir</a></span>
          <span>Configuración admin <a href="admin.php">Abrir</a></span>
          <span>Pagina principal <a href="index.php">Abrir</a></span>
          <span>Contacto estimado <strong>24 h</strong></span>
        </div>
      </section>


      <section class="utility-card">
        <h2>Preguntas rapidas</h2>
        <details class="faq-item" open>
          <summary>Como publico un evento?</summary>
          <p>Desde configuracion se prepara el contenido y luego se valida visualmente en Eventos.</p>
        </details>
        <details class="faq-item">
          <summary>El login es real?</summary>
          <p>Sí. Las cuentas se validan con el servicio de autenticación conectado a SIGTUR.</p>
        </details>
        <details class="faq-item">
          <summary>Donde se guardan los tickets?</summary>
          <p>Las consultas se guardan en el sistema de soporte. Si iniciaste sesión, podés ver tus consultas recientes aquí.</p>
        </details>
      </section>
    </div>
  </div>
</main>

<script src="../js/api-config.js"></script>
<script src="../js/main.js"></script>
</body>
</html>
