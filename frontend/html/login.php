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
  dos clases en el body: "page-account" (la gen�rica, para que main.js
  sepa que estamos en una p�gina de cuenta) y "auth-remake" (que suena
  a que esta pantalla se rehizo en algún momento -- "remake" -- 
  reemplazando una version vieja del login. Si alguna vez encuentran 
  estilos .auth-* viejos sin usar en el css, puede ser resto de la 
  version pre-remake)
-->
<body class="page-account auth-remake">

<!-- 
  el logo funciona ac� como bot�n de "volver al inicio", clickeable 
  desde cualquier parte de arriba a la izquierda. No hay navbar 
  completa en esta p�gina (sin buscador ni links de Eventos/Turismo/
  Lugares) porque el login es una pantalla "aislada", tipo modal a 
  pantalla completa, no forma parte de la navegaci�n normal del sitio 
-->
<a class="auth-sun-link" href="index.php" aria-label="Volver al inicio">
  <img src="../imagenes/logo-salto.svg" alt="Explora Salto" />
</a>

<main class="auth-stage">

  <!-- 
    FONDO DECORATIVO: grilla de fotos
    Esto es 100% cosm�tico (aria-hidden="true" -- fuera del sistema
    de accesibilidad porque no aporta informaci�n, solo decora).
    Son 4 filas de 6 im�genes cada una (24 fotos en total) puestas 
    como background-image inline, formando un colage detr�s de la 
    tarjeta de login, como hacen muchos sitios tipo Airbnb/Duolingo 
    en su pantalla de login.

    Fijate que las im�genes se REPITEN entre filas (ej: 
    "campoagricolascaled20.png" aparece en la fila 1 y en la fila 3, 
    "asado.jpg" en la fila 1 y la 3 tambi�n). No es un bug, es una 
    t�cnica com�n: repetir un pool chico de fotos para rellenar una 
    grilla grande sin tener que subir 24 im�genes distintas. Nadie 
    se pone a contar cu�ntas fotos hay realmente, el efecto visual 
    es lo que importa.

    Todas las rutas usan comillas simples DENTRO del atributo style
    (background-image:url('...')) porque el atributo style en s� ya 
    está entre comillas dobles -- si usaran comillas dobles adentro 
    tambi�n, romper�a el HTML. Combo cl�sico: comillas dobles afuera, 
    simples adentro (o viceversa), nunca las mismas anidadas.
  -->
  <section class="auth-intro-grid" aria-hidden="true">
    <!-- Se usan imagenes pequenas para que el fondo no retrase el formulario. -->
    <div class="auth-grid-row">
      <span style="background-image:url('../imagenes/index/Mate-blog.jpg')"></span>
      <span style="background-image:url('../imagenes/eventos/maxv.jpg')"></span>
      <!-- ^ este nombre de archivo es un hash largu�simo, t�pico de cuando 
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
    La tarjeta central, la �nica parte "funcional" de la p�gina.
    aria-labelledby="auth-title" conecta la secci�n con el <h1> de 
    abajo para lectores de pantalla -- buena pr�ctica de accesibilidad, 
    as� el screen reader anuncia el t�tulo de la secci�n al entrar en ella.
  -->
  <section class="auth-card" aria-labelledby="auth-title">
    <!-- 
      la "x" de cerrar es texto plano (la letra x min�scula), no un 
      �cono SVG como en el resto del sitio. funciona pero visualmente 
      es una decisi�n rara, siendo que TODO el resto del proyecto usa 
      iconos SVG hechos a mano. quiz�s valga la pena reemplazarla por 
      un SVG de "X" para que sea consistente con el resto del dise�o
    -->
    <a class="auth-close" href="index.php" aria-label="Cerrar y volver al inicio"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></a>

    <!-- avatar generico (un icono de personita) arriba del formulario -->
    <div class="auth-avatar" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20 21a8 8 0 0 0-16 0"/><circle cx="12" cy="8" r="4"/>
      </svg>
    </div>

    <div class="auth-copy">
      <!-- "Inicia sesion" sin tilde en "sesi�n" -- typo, deber�a ser 
           "sesi�n". Nada grave, pero anotalo si van a hacer una 
           pasada de correcci�n ortogr�fica del sitio entero -->
      <h1 id="auth-title">Inicia sesión para<br>ver más</h1>
      <p>Únete a nuestra comunidad viajera</p>
    </div>

    <!-- 
      Tabs para alternar entre Ingresar / Registrarse. role="tablist" 
      y los data-auth-tab son ganchos para que main.js sepa qué panel 
      mostrar cuando clickean cada bot�n (buscar 'data-auth-tab' en 
      main.js para ver el switcheo). Esto es un patr�n de tabs manual 
      hecho con atributos data-*, no usa el <input type=radio> hack 
      ni nada de CSS puro, depende 100% de JS para funcionar
    -->
    <div class="auth-tabs" role="tablist" aria-label="Opciones de cuenta">
      <button class="auth-tab active" type="button" role="tab" aria-selected="true" aria-controls="login-form" id="login-tab" data-auth-tab="login">Ingresar</button>
      <button class="auth-tab" type="button" role="tab" aria-selected="false" aria-controls="register-form" id="register-tab" data-auth-tab="register">Registrarse</button>
    </div>

    <!-- 
      FORM DE LOGIN
      action="#" -- no manda a ningún lado en serio, esto confirma que 
      no hay backend real atr�s. Todo el manejo del submit lo agarra 
      main.js con un preventDefault() (hay que ir a buscarlo ah�, 
      buscar '#login-form'). Buenos detalles de accesibilidad: cada 
      input tiene su <label for="..."> asociado, y autocomplete 
      correcto (username / current-password) para que el navegador 
      pueda autocompletar bien y los gestores de contrase�as lo 
      reconozcan como un form de login de verdad.
    -->
    <form class="auth-form active" id="login-form" data-auth-panel="login" role="tabpanel" aria-labelledby="login-tab" action="#" novalidate>
      <div class="auth-field">
        <label for="login-user">Correo / Usuario</label>
        <input id="login-user" name="user" type="text" autocomplete="username" placeholder="Correo / Usuario" required />
      </div>
      <div class="auth-field auth-field--password">
        <label for="login-password">Contraseña</label>
        <div class="auth-password-wrap">
          <input id="login-password" name="password" type="password" autocomplete="current-password" placeholder="Tu contrase�a" required />
          <button class="auth-toggle-password" type="button" data-password-toggle="login-password" aria-label="Mostrar contrase�a">Mostrar</button>
        </div>
      </div>
      <button class="auth-link-button" type="button" data-auth-message="recuperar">�¿Olvidaste tu contraseña?</button>
      <button class="auth-submit" type="submit">Iniciar sesión</button>
    </form>

    <!-- 
      FORM DE REGISTRO
      Empieza sin la clase "active" (a diferencia del de login), asique
      arranca oculto por CSS hasta que ???queen el tab "Registrarse".
      Password minima de 4 caracteres -- OJO, eso es re poco para un 
      sistema real (lo normal son 8+), pero como esto es un prototipo 
      sin backend real / sin datos sensibles de verdad, no es grave. 
      Si esto algún día se conecta a un backend posta, HAY que subir 
      ese m�nimo.
    -->
    <form class="auth-form" id="register-form" data-auth-panel="register" role="tabpanel" aria-labelledby="register-tab" action="#" novalidate>
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
          <input id="register-password" name="password" type="password" autocomplete="new-password" placeholder="M�nimo 8 caracteres" required />
          <button class="auth-toggle-password" type="button" data-password-toggle="register-password" aria-label="Mostrar contrase�a">Mostrar</button>
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
      real con OAuth de Google (no hay ningún script de 
      Google Sign-In ni nada parecido cargado en el <head>), son solo 
      botones con logo que simulan la acción -- otro gesto de "prototipo 
      honesto", no prometen algo que no está implementado
    -->
    <div class="auth-socials">
      <button class="auth-social" type="button" data-auth-provider="Google">
        <img class="google-icon" src="../imagenes/google-logo.png" alt="">
        Continuar con Google
      </button>
    </div>

    <!-- 
      Aquí es donde main.js mete los mensajes de feedback (tipo "sesión 
      iniciada", "usuario ya existe", los mensajes de data-auth-message 
      de arriba, etc). aria-live="polite" es clave para accesibilidad: 
      hace que un lector de pantalla anuncie el mensaje automáticamente 
      apenas aparece, sin que el usuario tenga que ir a buscarlo con el 
      cursor. Buen detalle de nuevo.
    -->
    <p class="auth-status" id="auth-status" role="status" aria-live="polite" aria-atomic="true" hidden></p>

    <p class="auth-terms">
      Si continúas, aceptas los <a href="#">Términos del servicio</a> de VPI y
      confirmas que has leído nuestra <a href="#">Política de privacidad</a>.
      <!-- estos dos links de legales van a "#" -- todavia no hay 
           paginas de terminos/privacidad reales, mismo cuento que en 
           el footer del resto del sitio -->
    </p>
  </section>
</main>

<!-- 
  toda la lgica de este login (switch de tabs, submit simulado, 
  mensajes de auth-status, y probablemente el guardado en 
  localStorage que menciona soporte.php en su FAQ "el login es 
  real?") vive en main.js. no hay backend, no hay base de datos: 
  es un prototipo funcional pero 100% del lado del cliente
-->
<script src="../js/api-config.js"></script>
<script src="../js/main.js?v=20260915-auth"></script>
</body>
</html>
