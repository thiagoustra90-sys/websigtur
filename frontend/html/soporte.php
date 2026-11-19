<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Soporte - SIGTUR Salto</title>
  <link rel="stylesheet" href="../css/font.css" />
  <link rel="stylesheet" href="../css/styles.css?v=20261119-cc-iconos-legibles" />
  <link rel="stylesheet" href="../css/support-events.css?v=20261119-nombres-espanol" />
</head>

<!-- Los estilos de esta página se aplican con la clase pagina-soporte. -->
<body class="pagina-soporte">

<!--
  navbar simplificada, calcada de admin.php (mismo aria-label "Abrir
  menu" en el logo, mismos 3 links sin ninguno "active"). Si alguna
  vez arreglan la inconsistencia del aria-label en admin.php,
  arreglarla acá también para que sean coherentes entre sí
-->
<header>
  <nav class="barra-navegacion">
    <a class="navegacion-logotipo" href="index.php" aria-label="Abrir menu">
      <img src="../imagenes/logo-salto.svg" alt="Explora Salto" />
    </a>

    <div class="navegacion-busqueda">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
      <input type="search" aria-label="Buscar en SIGTUR" autocomplete="off" placeholder="¿Qué querés descubrir hoy en Salto?" />
    </div>

    <div class="navegacion-enlaces">
      <a href="eventos.php">Eventos</a>
      <a href="turismo.php">Turismo</a>
      <a href="lugares.php">Lugares</a>
    </div>
  </nav>
</header>

<!-- Estructura compartida con la página de administración. -->
<main class="utilidad-pagina">
  <div class="utilidad-marco">
    <div class="utilidad-encabezado">
      <div class="utilidad-antetitulo">Ayuda</div>
      <a class="utilidad-volver-enlace" href="index.php" aria-label="Volver al inicio">
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
    <nav class="soporte-accion-barra" aria-label="Acciones de soporte">
      <a class="soporte-accion principal" href="#soporte-formulario">Crear ticket</a>
      <a class="soporte-accion" href="#soporte-entrada-lista">Mis tickets</a>
    </nav>

    <div class="utilidad-cuadricula soporte-cuadricula">

      <!-- La API recibe las consultas y solicitudes de verificación. -->
      <section class="soporte-panel">
        <div class="panel-encabezado">
          <h2>Enviar consulta</h2>
          <!-- main.js actualiza este estado al enviar la consulta. -->
          <span class="estado-pastilla" id="soporte-estado">Listo</span>
        </div>
        <form id="soporte-formulario" action="#">
          <div class="formulario-fila">
            <label for="soporte-nombre">Nombre</label>
            <input id="soporte-nombre" name="name" type="text" placeholder="Tu nombre" required />
          </div>
          <div class="formulario-fila">
            <label for="soporte-correo">Correo</label>
            <input id="soporte-correo" name="email" type="email" placeholder="correo@ejemplo.com" required />
          </div>
          <div class="formulario-fila">
            <label for="soporte-tema">Tema</label>
            <select id="soporte-tema" name="topic">
              <option value="account">Cuenta</option>
              <option value="events">Eventos</option>
              <option value="places">Lugares</option>
              <option value="settings">Configuración</option>
              <option value="commerce">Comercios</option>
              <option value="business_verification">Verificación de empresa u organización</option>
            </select>
          </div>
          <fieldset id="soporte-negocio-fields" class="soporte-verificacion-fields" hidden disabled>
            <legend>Datos para verificar la cuenta</legend>
            <p>Esta solicitud debe enviarse desde la cuenta que querés verificar. No compartas contraseñas ni códigos de acceso.</p>
            <div class="formulario-fila"><label for="soporte-organizacion-tipo">Tipo de cuenta</label><select id="soporte-organizacion-tipo" name="organization_type" required><option value="">Elegí una opción</option><option value="company">Empresa o comercio</option><option value="nonprofit">Organización o asociación</option><option value="tourism_service">Servicio turístico</option><option value="independent_professional">Profesional independiente</option></select></div>
            <div class="formulario-fila"><label for="soporte-legal-nombre">Razón social o nombre legal</label><input id="soporte-legal-nombre" name="legal_name" maxlength="180" required></div>
            <div class="formulario-fila"><label for="soporte-publico-nombre">Nombre público o comercial</label><input id="soporte-publico-nombre" name="public_name" maxlength="180" required></div>
            <div class="formulario-fila"><label for="soporte-registro-numero">RUT o registro (si corresponde)</label><input id="soporte-registro-numero" name="registration_number" maxlength="80" autocomplete="off"></div>
            <div class="formulario-fila"><label for="soporte-telefono">Teléfono de contacto</label><input id="soporte-telefono" name="phone" type="tel" autocomplete="tel" minlength="7" maxlength="40" required></div>
            <div class="formulario-fila"><label for="soporte-negocio-direccion">Dirección del establecimiento</label><input id="soporte-negocio-direccion" name="address" maxlength="250" required></div>
            <div class="formulario-fila"><label for="soporte-localidad">Localidad o departamento</label><input id="soporte-localidad" name="locality" maxlength="120" required></div>
            <div class="formulario-fila"><label for="soporte-sitio-web">Sitio web o red social</label><input id="soporte-sitio-web" name="website" type="url" placeholder="https://..." maxlength="1500"></div>
            <div class="formulario-fila"><label for="soporte-evidencia-url">Enlace adicional que ayude a verificar</label><input id="soporte-evidencia-url" name="evidence_url" type="url" placeholder="https://..." maxlength="1500"></div>
            <label class="soporte-verificacion-consentimiento"><input name="authorization" type="checkbox" required> Confirmo que estoy autorizado/a a enviar estos datos en nombre de la cuenta.</label>
          </fieldset>
          <div class="formulario-fila">
            <label id="soporte-mensaje-rotulo" for="soporte-mensaje">Mensaje</label>
            <textarea id="soporte-mensaje" name="message" placeholder="Contanos que necesitas revisar" required></textarea>
          </div>
          <div class="boton-fila">

            <button class="boton-principal" type="submit">Crear ticket</button>
            <button class="boton-secundario" type="reset">Limpiar</button>
          </div>
          <p class="formulario-ayuda">La consulta se envía al equipo de SIGTUR y queda registrada para su seguimiento.</p>

        </form>
      </section>

      <!-- Canales de contacto y ubicación. -->
      <section class="utilidad-tarjeta">
        <h2>Canales</h2>
        <div class="contacto-lista">
          <a href="mailto:itssalto@gmail.com"><strong>Email</strong><span>itssalto@gmail.com</span></a>
          <a href="https://www.google.com/maps/search/?api=1&amp;query=Salto+Uruguay" target="_blank" rel="noopener"><strong>Ubicación</strong><span>Salto, Uruguay</span></a>
          <a href="admin.php" data-enlace-administracion hidden><strong>Admin</strong><span>Configuración interna</span></a>

        </div>
      </section>

      <!-- Los tickets y su estado se cargan desde el backend para la cuenta actual. -->
      <section class="utilidad-tarjeta soporte-wide">
        <h2>Tickets recientes</h2>
        <div class="entrada-lista" id="soporte-entrada-lista" aria-live="polite"></div>
      </section>

      <!-- Accesos directos a recursos de soporte. -->
      <section class="utilidad-tarjeta">
        <h2>Atajos utiles</h2>
        <div class="pastilla-lista">
          <span>Login y registro <a href="login.php">Abrir</a></span>
          <span data-enlace-administracion hidden>Configuración admin <a href="admin.php">Abrir</a></span>
          <span>Pagina principal <a href="index.php">Abrir</a></span>
          <span>Contacto estimado <strong>24 h</strong></span>
        </div>
      </section>


      <section class="utilidad-tarjeta">
        <h2>Preguntas rapidas</h2>
        <details class="preguntas-frecuentes-elemento" open>
          <summary>Como publico un evento?</summary>
          <p>Desde configuracion se prepara el contenido y luego se valida visualmente en Eventos.</p>
        </details>
        <details class="preguntas-frecuentes-elemento">
          <summary>El login es real?</summary>
          <p>Sí. Las cuentas se validan con el servicio de autenticación conectado a SIGTUR.</p>
        </details>
        <details class="preguntas-frecuentes-elemento">
          <summary>Donde se guardan los tickets?</summary>
          <p>Las consultas se guardan en el sistema de soporte. Si iniciaste sesión, podés ver tus consultas recientes aquí.</p>
        </details>
      </section>
    </div>
  </div>
</main>

<script src="../js/api-config.js"></script>
<script src="../js/main.js?v=20261119-nombres-espanol"></script>
</body>
</html>
