<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Login y Registro - SIGTUR Salto</title>
  <link rel="stylesheet" href="../css/font.css" />
  <link rel="stylesheet" href="../css/styles.css?v=20261119-nombres-espanol" />
  <link rel="stylesheet" href="../css/support-events.css?v=20261119-nombres-espanol" />
</head>
<body class="cuenta-redisenada">
<main class="cuenta-escenario">
  <section class="cuenta-cuadricula-presentacion" aria-hidden="true">
    <div class="cuenta-fila-cuadricula">
      <span style="background-image:url('../imagenes/index/Mate-blog.jpg')"></span>
      <span style="background-image:url('../imagenes/eventos/maxv.jpg')"></span>
      <span style="background-image:url('../imagenes/index/empanadas_uruguayas_11992_1200.jpg')"></span>
      <span style="background-image:url('../imagenes/index/951-.jpeg')"></span>
      <span style="background-image:url('../imagenes/index/Mate-blog.jpg')"></span>
      <span style="background-image:url('../imagenes/index/951-.jpeg')"></span>
    </div>
    <div class="cuenta-fila-cuadricula">
      <span style="background-image:url('../imagenes/eventos/porco.jpg')"></span>
      <span style="background-image:url('../imagenes/eventos/porco.jpg')"></span>
      <span style="background-image:url('../imagenes/index/empanadas_uruguayas_11992_1200.jpg')"></span>
      <span style="background-image:url('../imagenes/eventos/maxv.jpg')"></span>
      <span style="background-image:url('../imagenes/index/images.jpg')"></span>
      <span style="background-image:url('../imagenes/index/don_pedro.jpg')"></span>
    </div>
    <div class="cuenta-fila-cuadricula">
      <span style="background-image:url('../imagenes/index/951-.jpeg')"></span>
      <span style="background-image:url('../imagenes/index/images.jpg')"></span>
      <span style="background-image:url('../imagenes/index/Mate-blog.jpg')"></span>
      <span style="background-image:url('../imagenes/eventos/maxv.jpg')"></span>
      <span style="background-image:url('../imagenes/index/empanadas_uruguayas_11992_1200.jpg')"></span>
      <span style="background-image:url('../imagenes/eventos/porco.jpg')"></span>
    </div>
    <div class="cuenta-fila-cuadricula">
      <span style="background-image:url('../imagenes/index/Mate-blog.jpg')"></span>
      <span style="background-image:url('../imagenes/index/951-.jpeg')"></span>
      <span style="background-image:url('../imagenes/eventos/maxv.jpg')"></span>
      <span style="background-image:url('../imagenes/eventos/porco.jpg')"></span>
      <span style="background-image:url('../imagenes/index/empanadas_uruguayas_11992_1200.jpg')"></span>
      <span style="background-image:url('../imagenes/index/951-.jpeg')"></span>
    </div>
  </section>
  <a class="cuenta-enlace-logotipo" href="index.php" aria-label="Volver al inicio de SIGTUR">
    <img src="../imagenes/logo-salto.svg" alt="SIGTUR · Salto" />
  </a>
  <section class="cuenta-tarjeta" aria-labelledby="cuenta-titulo">
    <div class="cuenta-avatar" aria-hidden="true"><span>✦</span></div>
    <div class="cuenta-texto">
      <h1 id="cuenta-titulo">Inicia sesión para<br>ver más</h1>
      <p>Únete a nuestra comunidad viajera</p>
    </div>

    <!--
      Tabs para alternar entre Ingresar / Registrarse. role="tablist"
      y los data-cuenta-pestana son ganchos para que main.js sepa qué panel
      mostrar cuando clickean cada botón (buscar 'data-cuenta-pestana' en
      main.js para ver el switcheo). Esto es un patrón de tabs manual
      hecho con atributos data-*, no usa el <input type=radio> hack
      ni nada de CSS puro, depende 100% de JS para funcionar
    -->
    <div class="cuenta-pestanas" role="tablist" aria-label="Opciones de cuenta">
      <button class="cuenta-pestana activo" type="button" role="tab" aria-selected="true" aria-controls="acceso-formulario" id="acceso-pestana" data-cuenta-pestana="acceso">Ingresar</button>
      <button class="cuenta-pestana" type="button" role="tab" aria-selected="false" aria-controls="registro-formulario" id="registro-pestana" data-cuenta-pestana="registro">Registrarse</button>
    </div>


    <form class="cuenta-formulario activo" id="acceso-formulario" data-cuenta-panel="acceso" role="tabpanel" aria-labelledby="acceso-pestana" action="#" novalidate>
      <div class="cuenta-campo">
        <label for="acceso-usuario">Correo</label>
        <input id="acceso-usuario" name="user" type="email" autocomplete="username" placeholder="correo@ejemplo.com" required />
      </div>
      <div class="cuenta-campo cuenta-campo--contrasena">
        <label for="acceso-contrasena">Contraseña</label>
        <div class="cuenta-contenedor-contrasena">
          <input id="acceso-contrasena" name="password" type="password" autocomplete="current-password" placeholder="Tu contraseña" required />
          <button class="cuenta-alternar-contrasena" type="button" data-contrasena-alternar="acceso-contrasena" aria-label="Mostrar contraseña">Mostrar</button>
        </div>
      </div>
      <button class="cuenta-boton-enlace" type="button" data-cuenta-mensaje="recuperar">¿Olvidaste tu contraseña?</button>
      <button class="cuenta-enviar" type="submit">Iniciar sesión</button>
    </form>


    <form class="cuenta-formulario" id="registro-formulario" data-cuenta-panel="registro" role="tabpanel" aria-labelledby="registro-pestana" action="#" novalidate>
      <div class="cuenta-campo">
        <label for="registro-nombre">Nombre</label>
        <input id="registro-nombre" name="name" type="text" autocomplete="name" placeholder="Tu nombre" required />
      </div>
      <div class="cuenta-campo">
        <label for="registro-correo">Correo</label>
        <input id="registro-correo" name="email" type="email" autocomplete="email" placeholder="correo@ejemplo.com" required />
      </div>
      <div class="cuenta-campo cuenta-campo--contrasena">
        <label for="registro-contrasena">Contraseña</label>
        <div class="cuenta-contenedor-contrasena">
          <input id="registro-contrasena" name="password" type="password" autocomplete="new-password" placeholder="Mínimo 8 caracteres" required />
          <button class="cuenta-alternar-contrasena" type="button" data-contrasena-alternar="registro-contrasena" aria-label="Mostrar contraseña">Mostrar</button>
        </div>
      </div>
      <button class="cuenta-enviar" type="submit">Registrar Cuenta</button>
    </form>

    <form class="cuenta-formulario" id="recuperacion-formulario" data-cuenta-panel="recuperacion" action="#" hidden novalidate>
      <div class="cuenta-campo">
        <label for="recuperacion-correo">Correo</label>
        <input id="recuperacion-correo" name="email" type="email" autocomplete="email" placeholder="correo@ejemplo.com" required />
      </div>
      <button class="cuenta-enviar" type="submit">Enviar enlace</button>
      <button class="cuenta-boton-enlace" id="recuperacion-cancelar" type="button">Volver a ingresar</button>
    </form>

    <form class="cuenta-formulario" id="contrasena-reset-formulario" action="#" hidden novalidate>
      <div class="cuenta-campo cuenta-campo--contrasena">
        <label for="contrasena-reset-new">Nueva contraseña</label>
        <input id="contrasena-reset-new" name="password" type="password" autocomplete="new-password" minlength="8" required />
      </div>
      <div class="cuenta-campo cuenta-campo--contrasena">
        <label for="contrasena-reset-confirm">Confirma la contraseña</label>
        <input id="contrasena-reset-confirm" name="password_confirmation" type="password" autocomplete="new-password" minlength="8" required />
      </div>
      <button class="cuenta-enviar" type="submit">Guardar contraseña</button>
    </form>

    <div class="cuenta-separador"><span>o</span></div>


    <div class="cuenta-redes-sociales">
      <button class="cuenta-red-social" type="button" data-cuenta-proveedor="Google">
        <img class="google-icono" src="../imagenes/google-logo.png" alt="">
        Continuar con Google
      </button>
    </div>

    <!--
      Aquí es donde main.js mete los mensajes de feedback (tipo "sesión
      iniciada", "usuario ya existe", los mensajes de data-cuenta-mensaje
      de arriba, etc). aria-live="polite" es clave para accesibilidad:
      hace que un lector de pantalla anuncie el mensaje automáticamente
      apenas aparece, sin que el usuario tenga que ir a buscarlo con el
      cursor. Buen detalle de nuevo.
    -->
    <p class="cuenta-estado" id="cuenta-estado" role="status" aria-live="polite" aria-atomic="true" hidden></p>

    <p class="cuenta-terminos">
      Si continúas, aceptas los <a href="terminos.html">Términos del servicio</a> de SIGTUR y
      confirmas que has leído nuestra <a href="privacidad.html">Política de privacidad</a>.
    </p>
  </section>
</main>


<script src="../js/api-config.js"></script>
<script src="../js/main.js?v=20261119-nombres-espanol"></script>
</body>
</html>
