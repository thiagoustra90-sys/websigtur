<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Login y Registro - SIGTUR Salto</title>
  <link rel="stylesheet" href="../css/font.css" />
  <link rel="stylesheet" href="../css/styles.css" />
</head>

<!-- 
  dos clases en el body: "page-account" (la genérica, para que main.js
  sepa que estamos en una página de cuenta) y "auth-remake" (que suena
  a que esta pantalla se rehizo en algún momento -- "remake" -- 
  reemplazando una version vieja del login. Si alguna vez encuentran 
  estilos .auth-* viejos sin usar en el css, puede ser resto de la 
  version pre-remake)
-->
<body class="page-account auth-remake">

<!-- 
  el logo funciona acá como botón de "volver al inicio", clickeable 
  desde cualquier parte de arriba a la izquierda. No hay navbar 
  completa en esta página (sin buscador ni links de Eventos/Turismo/
  Lugares) porque el login es una pantalla "aislada", tipo modal a 
  pantalla completa, no forma parte de la navegación normal del sitio 
-->
<a class="auth-sun-link" href="index.php" aria-label="Volver al inicio">
  <img src="../imagenes/logo-salto.svg" alt="Explora Salto" />
</a>

<main class="auth-stage">

  <!-- 
    FONDO DECORATIVO: grilla de fotos
    Esto es 100% cosmético (aria-hidden="true" -- fuera del sistema
    de accesibilidad porque no aporta información, solo decora).
    Son 4 filas de 6 imágenes cada una (24 fotos en total) puestas 
    como background-image inline, formando un colage detrás de la 
    tarjeta de login, como hacen muchos sitios tipo Airbnb/Duolingo 
    en su pantalla de login.

    Fijate que las imágenes se REPITEN entre filas (ej: 
    "campoagricolascaled20.png" aparece en la fila 1 y en la fila 3, 
    "asado.jpg" en la fila 1 y la 3 también). No es un bug, es una 
    técnica común: repetir un pool chico de fotos para rellenar una 
    grilla grande sin tener que subir 24 imágenes distintas. Nadie 
    se pone a contar cuántas fotos hay realmente, el efecto visual 
    es lo que importa.

    Todas las rutas usan comillas simples DENTRO del atributo style
    (background-image:url('...')) porque el atributo style en sí ya 
    está entre comillas dobles -- si usaran comillas dobles adentro 
    también, rompería el HTML. Combo clásico: comillas dobles afuera, 
    simples adentro (o viceversa), nunca las mismas anidadas.
  -->
  <section class="auth-intro-grid" aria-hidden="true">
    <!-- Se usan imagenes pequenas para que el fondo no retrase el formulario. -->
    <div class="auth-grid-row">
      <span style="background-image:url('../imagenes/index/Mate-blog.jpg')"></span>
      <span style="background-image:url('../imagenes/eventos/maxv.jpg')"></span>
      <!-- ^ este nombre de archivo es un hash larguísimo, típico de cuando 
           se sube una imagen desde Figma/un CMS que auto-genera nombres. 
           imposible de recordar de memoria, hay que ir a la carpeta a 
           buscarlo si quieren cambiar algo -->
      <span style="background-image:url('../imagenes/index/empanadas_uruguayas_11992_1200.jpg')"></span>
      <span style="background-image:url('../imagenes/index/951-.jpg')"></span>
      <span style="background-image:url('../imagenes/index/Mate-blog.jpg')"></span>
      <span style="background-image:url('../imagenes/index/951-.jpg')"></span>
    </div>
    <div class="auth-grid-row">
      <span style="background-image:url('../imagenes/eventos/porco.jpg')"></span>
      <span style="background-image:url('../imagenes/eventos/porco.jpg')"></span>
      <span style="background-image:url('../imagenes/index/empanadas_uruguayas_11992_1200.jpg')"></span>
      <span style="background-image:url('../imagenes/eventos/maxv.jpg')"></span>
      <span style="background-image:url('../imagenes/index/images.jpg')"></span>
      <span style="background-image:url('../imagenes/index/don pedro.jpg')"></span>
    </div>
    <div class="auth-grid-row">
      <span style="background-image:url('../imagenes/index/951-.jpg')"></span>
      <span style="background-image:url('../imagenes/index/images.jpg')"></span>
      <span style="background-image:url('../imagenes/index/Mate-blog.jpg')"></span>
      <span style="background-image:url('../imagenes/eventos/maxv.jpg')"></span>
      <span style="background-image:url('../imagenes/index/empanadas_uruguayas_11992_1200.jpg')"></span>
      <span style="background-image:url('../imagenes/eventos/porco.jpg')"></span>
    </div>
    <div class="auth-grid-row">
      <span style="background-image:url('../imagenes/index/Mate-blog.jpg')"></span>
      <span style="background-image:url('../imagenes/index/951-.jpg')"></span>
      <span style="background-image:url('../imagenes/eventos/maxv.jpg')"></span>
      <span style="background-image:url('../imagenes/eventos/porco.jpg')"></span>
      <span style="background-image:url('../imagenes/index/empanadas_uruguayas_11992_1200.jpg')"></span>
      <span style="background-image:url('../imagenes/index/951-.jpg')"></span>
    </div>
  </section>

  <!-- 
    TARJETA DE LOGIN / REGISTRO
    La tarjeta central, la única parte "funcional" de la página.
    aria-labelledby="auth-title" conecta la sección con el <h1> de 
    abajo para lectores de pantalla -- buena práctica de accesibilidad, 
    así el screen reader anuncia el título de la sección al entrar en ella.
  -->
  <section class="auth-card" aria-labelledby="auth-title">
    <!-- 
      la "x" de cerrar es texto plano (la letra x minúscula), no un 
      ícono SVG como en el resto del sitio. funciona pero visualmente 
      es una decisión rara, siendo que TODO el resto del proyecto usa 
      iconos SVG hechos a mano. quizás valga la pena reemplazarla por 
      un SVG de "X" para que sea consistente con el resto del diseño
    -->
    <a class="auth-close" href="index.php" aria-label="Cerrar y volver al inicio">x</a>

    <!-- avatar generico (un icono de personita) arriba del formulario -->
    <div class="auth-avatar" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20 21a8 8 0 0 0-16 0"/><circle cx="12" cy="8" r="4"/>
      </svg>
    </div>

    <div class="auth-copy">
      <!-- "Inicia sesion" sin tilde en "sesión" -- typo, debería ser 
           "sesión". Nada grave, pero anotalo si van a hacer una 
           pasada de corrección ortográfica del sitio entero -->
      <h1 id="auth-title">Inicia sesion para<br>ver mas</h1>
      <p>Unete a esta comunidad</p>
    </div>

    <!-- 
      Tabs para alternar entre Ingresar / Registrarse. role="tablist" 
      y los data-auth-tab son ganchos para que main.js sepa qué panel 
      mostrar cuando clickean cada botón (buscar 'data-auth-tab' en 
      main.js para ver el switcheo). Esto es un patrón de tabs manual 
      hecho con atributos data-*, no usa el <input type=radio> hack 
      ni nada de CSS puro, depende 100% de JS para funcionar
    -->
    <div class="auth-tabs" role="tablist" aria-label="Cuenta">
      <button class="auth-tab active" type="button" data-auth-tab="login">Ingresar</button>
      <button class="auth-tab" type="button" data-auth-tab="register">Registrarse</button>
    </div>

    <!-- 
      FORM DE LOGIN
      action="#" -- no manda a ningún lado en serio, esto confirma que 
      no hay backend real atrás. Todo el manejo del submit lo agarra 
      main.js con un preventDefault() (hay que ir a buscarlo ahí, 
      buscar '#login-form'). Buenos detalles de accesibilidad: cada 
      input tiene su <label for="..."> asociado, y autocomplete 
      correcto (username / current-password) para que el navegador 
      pueda autocompletar bien y los gestores de contraseñas lo 
      reconozcan como un form de login de verdad.
    -->
    <form class="auth-form active" id="login-form" data-auth-panel="login" action="#" novalidate>
      <div class="auth-field">
        <label for="login-user">Correo / Usuario</label>
        <input id="login-user" name="user" type="text" autocomplete="username" placeholder="Correo / Usuario" required />
      </div>
      <div class="auth-field auth-field--password">
        <label for="login-password">Contraseña</label>
        <div class="auth-password-wrap">
          <input id="login-password" name="password" type="password" autocomplete="current-password" placeholder="Tu contraseña" required />
          <button class="auth-toggle-password" type="button" data-password-toggle="login-password" aria-label="Mostrar contraseña">Mostrar</button>
        </div>
      </div>
      <button class="auth-link-button" type="button" data-auth-message="recuperar">Olvidaste la contraseña?</button>
      <button class="auth-submit" type="submit">Ingresar Sesion</button>
    </form>

    <!-- 
      FORM DE REGISTRO
      Empieza sin la clase "active" (a diferencia del de login), asique
      arranca oculto por CSS hasta que клиqueen el tab "Registrarse".
      Password minima de 4 caracteres -- OJO, eso es re poco para un 
      sistema real (lo normal son 8+), pero como esto es un prototipo 
      sin backend real / sin datos sensibles de verdad, no es grave. 
      Si esto algún día se conecta a un backend posta, HAY que subir 
      ese mínimo.
    -->
    <form class="auth-form" id="register-form" data-auth-panel="register" action="#" novalidate>
      <div class="auth-field">
        <label for="register-name">Nombre</label>
        <input id="register-name" name="name" type="text" autocomplete="name" placeholder="Tu nombre" required />
      </div>
      <div class="auth-field">
        <label for="register-email">Correo</label>
        <input id="register-email" name="email" type="email" autocomplete="email" placeholder="correo@ejemplo.com" required />
      </div>
      <div class="auth-field auth-field--password">
        <label for="register-password">Contraseña</label>
        <div class="auth-password-wrap">
          <input id="register-password" name="password" type="password" autocomplete="new-password" placeholder="Mínimo 8 caracteres" required />
          <button class="auth-toggle-password" type="button" data-password-toggle="register-password" aria-label="Mostrar contraseña">Mostrar</button>
        </div>
      </div>
      <button class="auth-submit" type="submit">Registrar Cuenta</button>
    </form>

    <form class="auth-form" id="recovery-form" data-auth-panel="recovery" action="#" hidden novalidate>
      <div class="auth-field">
        <label for="recovery-email">Correo</label>
        <input id="recovery-email" name="email" type="email" autocomplete="email" placeholder="correo@ejemplo.com" required />
      </div>
      <button class="auth-submit" type="submit">Enviar enlace</button>
      <button class="auth-link-button" id="recovery-cancel" type="button">Volver a ingresar</button>
    </form>

    <div class="auth-divider"><span>o</span></div>

    <!-- 
      Login social (Google / Apple). data-auth-provider indica cuál es 
      cuál para que el JS sepa qué mensaje mostrar. NO hay integración 
      real con OAuth de Google ni de Apple (no hay ningún script de 
      Google Sign-In ni nada parecido cargado en el <head>), son solo 
      botones con logo que simulan la acción -- otro gesto de "prototipo 
      honesto", no prometen algo que no está implementado
    -->
    <div class="auth-socials">
      <button class="auth-social" type="button" data-auth-provider="Google">
        <img class="google-icon" src="../imagenes/google-logo.png" alt="Google logo">
        Continua con Google
      </button>
      <button class="auth-social" type="button" data-auth-provider="Apple">
        <img class="apple-icon" src="../imagenes/applelogo.png" alt="Apple logo">   
        <!-- ^ hay unos espacios de más después de este img antes del 
             cierre de tag, no afecta nada visualmente (HTML colapsa 
             espacios), solo prolijidad de código -->
        Continua con Apple
      </button>
    </div>

    <!-- 
      Acá es donde main.js mete los mensajes de feedback (tipo "sesión 
      iniciada", "usuario ya existe", los mensajes de data-auth-message 
      de arriba, etc). aria-live="polite" es clave para accesibilidad: 
      hace que un lector de pantalla anuncie el mensaje automáticamente 
      apenas aparece, sin que el usuario tenga que ir a buscarlo con el 
      cursor. Buen detalle de nuevo.
    -->
    <p class="auth-status" id="auth-status" role="status" aria-live="polite" aria-atomic="true"></p>

    <p class="auth-terms">
      Si continuas, aceptas los <a href="#">Terminos del servicio</a> de VPI y
      confirmas que has leido nuestra <a href="#">Politica de privacidad</a>.
      <!-- estos dos links de legales van a "#" -- todavia no hay 
           paginas de terminos/privacidad reales, mismo cuento que en 
           el footer del resto del sitio -->
    </p>
  </section>
</main>

<!-- 
  toda la lógica de este login (switch de tabs, submit simulado, 
  mensajes de auth-status, y probablemente el guardado en 
  localStorage que menciona soporte.php en su FAQ "el login es 
  real?") vive en main.js. no hay backend, no hay base de datos: 
  es un prototipo funcional pero 100% del lado del cliente
-->
<script src="../js/api-config.js"></script>
<script src="../js/main.js?v=20260915-auth"></script>
</body>
</html>
