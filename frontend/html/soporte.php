<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Soporte - SIGTUR Salto</title>
  <link rel="stylesheet" href="../css/font.css" />
  <link rel="stylesheet" href="../css/styles.css" />
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
      <input type="text" placeholder='"Que queres descubrir hoy en Salto?"' />
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

      <!--
        PANEL: Enviar consulta (el formulario principal)
        action="#" de nuevo, así que confirmamos otra vez que no hay
        backend real recibiendo esto. El <select> de "Tema" no tiene
        atributo value en ninguna <option> -- eso está bien, cuando
        no hay value explícito el navegador usa el texto visible como
        value (ej: seleccionar "Eventos" manda topic=Eventos).
        Funciona, aunque para un sistema mas prolijo se sueler poner
        value="eventos" en minúscula para que el backend reciba algo
        más fácil de comparar en código.
      -->
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
              <option>Cuenta</option>
              <option>Eventos</option>
              <option>Lugares</option>
              <option>Configuración</option>
              <option>Comercios</option>
            </select>
          </div>
          <div class="form-row">
            <label for="support-message">Mensaje</label>
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

      <!--
        ============================================================
        PANEL: Tickets recientes
        vacío en el HTML (id="support-ticket-list" sin contenido), lo
        llena main.js dinámicamente leyendo lo que se guardó en
        localStorage cada vez que alguien mandó el form de arriba.
        aria-live="polite" otra vez, mismo patrón de accesibilidad
        que venimos viendo en todo el sitio para listas que se
        actualizan dinámicamente (bien ahí, es consistente)
      -->
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
