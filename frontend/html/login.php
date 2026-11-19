<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Login y Registro - SIGTUR Salto</title>
  <link rel="stylesheet" href="../css/font.css" />
  <link rel="stylesheet" href="../css/styles.css" />
  <link rel="stylesheet" href="../css/support-events.css?v=20261118-contraste" />
</head>
<body class="auth-remake">
<main class="auth-stage">
  <a class="auth-sun-link" href="index.php" aria-label="Volver al inicio de SIGTUR">
    <img src="../imagenes/logo-salto.svg" alt="SIGTUR · Salto" />
  </a>
  <section class="auth-card" aria-labelledby="auth-title">
    <div class="auth-avatar" aria-hidden="true"><span>✦</span></div>
    <div class="auth-copy">
      <h1 id="auth-title">Inicia sesión para<br>ver más</h1>
      <p>Únete a nuestra comunidad viajera</p>
    </div>

    <!--
      Tabs para alternar entre Ingresar / Registrarse. role="tablist"
      y los data-auth-tab son ganchos para que main.js sepa qué panel
      mostrar cuando clickean cada botón (buscar 'data-auth-tab' en
      main.js para ver el switcheo). Esto es un patrón de tabs manual
      hecho con atributos data-*, no usa el <input type=radio> hack
      ni nada de CSS puro, depende 100% de JS para funcionar
    -->
    <div class="auth-tabs" role="tablist" aria-label="Opciones de cuenta">
      <button class="auth-tab active" type="button" role="tab" aria-selected="true" aria-controls="login-form" id="login-tab" data-auth-tab="login">Ingresar</button>
      <button class="auth-tab" type="button" role="tab" aria-selected="false" aria-controls="register-form" id="register-tab" data-auth-tab="register">Registrarse</button>
    </div>


    <form class="auth-form active" id="login-form" data-auth-panel="login" role="tabpanel" aria-labelledby="login-tab" action="#" novalidate>
      <div class="auth-field">
        <label for="login-user">Correo</label>
        <input id="login-user" name="user" type="email" autocomplete="username" placeholder="correo@ejemplo.com" required />
      </div>
      <div class="auth-field auth-field--password">
        <label for="login-password">Contraseña</label>
        <div class="auth-password-wrap">
          <input id="login-password" name="password" type="password" autocomplete="current-password" placeholder="Tu contraseña" required />
          <button class="auth-toggle-password" type="button" data-password-toggle="login-password" aria-label="Mostrar contraseña">Mostrar</button>
        </div>
      </div>
      <button class="auth-link-button" type="button" data-auth-message="recuperar">¿Olvidaste tu contraseña?</button>
      <button class="auth-submit" type="submit">Iniciar sesión</button>
    </form>


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

    <form class="auth-form" id="password-reset-form" action="#" hidden novalidate>
      <div class="auth-field auth-field--password">
        <label for="password-reset-new">Nueva contraseña</label>
        <input id="password-reset-new" name="password" type="password" autocomplete="new-password" minlength="8" required />
      </div>
      <div class="auth-field auth-field--password">
        <label for="password-reset-confirm">Confirma la contraseña</label>
        <input id="password-reset-confirm" name="password_confirmation" type="password" autocomplete="new-password" minlength="8" required />
      </div>
      <button class="auth-submit" type="submit">Guardar contraseña</button>
    </form>

    <div class="auth-divider"><span>o</span></div>


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
      Si continúas, aceptas los <a href="terminos.html">Términos del servicio</a> de SIGTUR y
      confirmas que has leído nuestra <a href="privacidad.html">Política de privacidad</a>.
    </p>
  </section>
</main>


<script src="../js/api-config.js"></script>
<script src="../js/main.js?v=20261118-map-return"></script>
</body>
</html>
