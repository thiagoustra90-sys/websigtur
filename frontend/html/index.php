<!DOCTYPE html>
<html lang="es">
<head>
  <!-- Configuración inicial de la portada. -->
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Explora Salto - SIGTUR</title>

  <!-- Tipografías de la portada. -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800;900&family=Cormorant+Garamond:wght@400;500;600;700&family=Nunito:wght@300;400;600;700;800&display=swap" rel="stylesheet" />
  <!-- Fuente de la firma usada en “¿Quedamos?”. -->
  <link href="https://fonts.cdnfonts.com/css/brittany-signature" rel="stylesheet" />
  <link rel="stylesheet" href="../css/font.css" />

  <!-- Hoja de estilos compartida por el sitio. -->
  <link rel="stylesheet" href="../css/styles.css?v=20261119-cc-iconos-legibles" />

</head>
<body class="pagina-inicio">
  <!-- main.js usa esta clase para activar el comportamiento de la portada. -->

<!-- Navegación de la portada, separada del contenido del hero. -->
<nav class="barra-navegacion" id="barra-navegacion">
  <!-- Logo con enlace a la portada. -->
  <a class="navegacion-logotipo" href="index.php" aria-label="Inicio">
    <img src="../imagenes/logo-salto.svg" alt="Explora Salto" />
  </a>

  <!-- Buscador de la portada. -->
  <div class="navegacion-busqueda">
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
    <input type="search" aria-label="Buscar en SIGTUR" autocomplete="off" placeholder="¿Qué querés descubrir hoy en Salto?" />
  </div>

  <!-- Enlaces a Eventos, Turismo y Lugares. -->
  <nav class="navegacion-enlaces">
    <a href="eventos.php">Eventos</a>
    <a href="turismo.php">Turismo</a>
    <a href="lugares.php">Lugares</a>
  </nav>
</nav>
<!-- main.js inserta junto al logotipo el menú de cuenta, administración, soporte y tema. -->


<!--
     Portada principal con título y widget del clima
-->
<header class="portada">

  <div class="portada-fondo"></div> <!-- La imagen y el degradado de fondo se definen en styles.css. -->

  <div class="portada-contenido">
    <div class="descripcion-portada">
    <h1 class="portada-titulo">EXPLORA<br>SALTO</h1>

    <!-- Onda decorativa dibujada en SVG. -->
    <svg class="portada-ola" viewBox="0 0 520 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 28 C60 8, 130 38, 200 18 S340 -2, 420 22 S490 38, 518 20"
            stroke="#3ecfbb" stroke-width="6" stroke-linecap="round" fill="none"/>
    </svg>

    <div class="portada-botones">
      <a href="eventos.php" class="boton-cristal">Explorar Eventos</a>
      <a href="turismo.php#alojamientos" class="boton-cristal">Reservar</a>
      <a href="mapa.php" class="boton-cristal">Ver mapa</a>
    </div>


    <p class="portada-eslogan">Nación Amada</p>
    </div>
    <aside class="clima-widget" aria-label="Clima actual en Salto">
      <div class="clima-orb" data-clima-icono aria-hidden="true">--</div>
      <div class="clima-principal">
        <span class="clima-antetitulo">Salto, Uruguay</span>
        <strong data-clima-temperatura>--&deg;</strong>
        <span data-clima-descripcion>Actualizando clima</span>
      </div>
      <div class="clima-metadatos">
        <span>Sensacion <b data-clima-sensacion>--&deg;</b></span>
        <span>Viento <b data-clima-viento>-- km/h</b></span>
      </div>
    </aside>

  </div>

</header>


<!--
    Accesos principales a Eventos, Turismo y Lugares.
 -->
<section class="caracteristicas">
  <div class="caracteristicas-cuadricula">

    <div class="caracteristica-elemento">
      <div class="caracteristica-icono">
        <img src="../imagenes/index/calendaradd0.svg" alt="Eventos" loading="lazy" decoding="async" />
      </div>
      <h3 class="caracteristica-titulo">Eventos</h3>
      <p class="caracteristica-descripcion">
        Descubrí todo lo que pasa en Salto: festivales, ferias, actividades
        culturales y espectáculos para toda la familia.
      </p>
    </div>

    <div class="caracteristica-elemento">
      <div class="caracteristica-icono">
        <img src="../imagenes/index/Union.png" alt="Turismo" loading="lazy" decoding="async" />
      </div>
      <h3 class="caracteristica-titulo">Turismo</h3>
      <p class="caracteristica-descripcion">
        Hoteles, restaurantes y los mejores lugares turísticos de Salto para
        que tu visita sea inolvidable.
      </p>
    </div>

    <div class="caracteristica-elemento">
      <div class="caracteristica-icono">
        <img src="../imagenes/index/Vector(1).svg" alt="Lugares" loading="lazy" decoding="async" />
      </div>
      <h3 class="caracteristica-titulo">Lugares</h3>
      <p class="caracteristica-descripcion">
        Explorá plazas, parques, la Costanera y todos los rincones únicos
        que hacen especial a nuestra ciudad.
      </p>
    </div>

  </div>
</section>


<!--
     Eventos destacados de la portada; la agenda completa está en eventos.php.
-->
<section class="eventos-seccion" id="eventos">
  <div class="eventos-interior">

    <!-- Texto y enlace a la agenda. -->
    <div class="eventos-izquierda">
      <div class="eventos-encabezado">
        <span><!-- Espaciador del encabezado. --></span>
        <a href="eventos.php" class="seccion-ver-mas">VER MÁS</a>
      </div>
      <h2 class="eventos-titulo">EVENTOS</h2>

      <!-- Separador ondulado de la sección. -->
      <svg class="eventos-ola" viewBox="0 0 460 55" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M2 35 C55 10, 120 48, 200 25 S330 2, 410 30 S448 48, 458 28"
              stroke="#3ecfbb" stroke-width="7" stroke-linecap="round" fill="none"/>
      </svg>

      <p class="eventos-texto">
        Descubrí los eventos más destacados de Salto. Desde ferias artesanales
        y espectáculos musicales hasta celebraciones culturales que llenan la
        ciudad de vida.
      </p>
      <a href="eventos.php" class="boton-leer-mas">Leer más</a>
    </div>

    <!--
      Carrusel de la portada. Sus controles y puntos se inicializan en main.js.
    -->
    <div class="carrusel">
      <div class="carrusel-pista">
        <div class="carrusel-diapositiva">
          <img src="../imagenes/turismo/whatsapp-image-2026-04-23-at-12.51.08-pm.jpeg.webp" alt="Actividades tur?sticas en Salto" loading="lazy" decoding="async" />
        </div>
        <div class="carrusel-diapositiva">
          <img src="../imagenes/turismo/solari.jpg" alt="Parque Solari" loading="lazy" decoding="async" />
        </div>
        <div class="carrusel-diapositiva">
          <img src="../imagenes/eventos/maxv.jpg" alt="Noche de milonga" loading="lazy" decoding="async" />
        </div>
        <div class="carrusel-diapositiva">
          <img src="../imagenes/eventos/porco.jpg" alt="Feria del Libro Salte?o" loading="lazy" decoding="async" />
        </div>
      </div>

      <button class="carrusel-boton anterior" aria-label="Anterior">&#8249;</button>
      <button class="carrusel-boton siguiente" aria-label="Siguiente">&#8250;</button>

      <div class="carrusel-puntos"></div> <!-- main.js genera un indicador por diapositiva. -->
    </div>

  </div>
</section>


<!--
     ALOJAMIENTO — "En donde nos quedamos?"
     tarjetas de alojamientos
-->
<section class="alojamiento-seccion" id="alojamiento">
  <div class="alojamiento-interior">

    <div class="alojamiento-encabezado">
      <div class="alojamiento-titulo-contenedor">
        <h2 class="alojamiento-titulo">¿EN DÓNDE<br>NOS QUEDAMOS?</h2>
        <span class="alojamiento-guion">¿Quedamos?</span> <!-- Firma decorativa con tipografía propia. -->
      </div>
      <a href="turismo.php" class="seccion-ver-mas" style="margin-top:8px;">VER MÁS</a>
    </div>

    <!-- Las tarjetas de alojamiento están definidas en esta página y no vienen de la API. -->
    <div class="tarjetas-cuadricula">

      <!-- Tarjeta 1. -->
      <div class="alojamiento-tarjeta">
        <div class="alojamiento-multimedia">
          <img class="alojamiento-imagen" src="../imagenes/index/951-.jpeg" alt="Dayman, Salto" loading="lazy" decoding="async" />
          <!-- main.js sincroniza este botón con los lugares guardados de la cuenta. -->
          <button class="alojamiento-corazon" aria-label="Guardar">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </button>
        </div>
        <div class="alojamiento-informacion">
          <p class="alojamiento-nombre">Dayman, Salto</p>
        </div>
      </div>

      <!-- Tarjeta 2. -->
      <div class="alojamiento-tarjeta">
        <div class="alojamiento-multimedia">
          <img class="alojamiento-imagen" src="../imagenes/index/images.jpg" alt="Mesias Hotel, Salto" loading="lazy" decoding="async" />
          <button class="alojamiento-corazon" aria-label="Guardar">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </button>
        </div>
        <div class="alojamiento-informacion">
          <p class="alojamiento-nombre">Mesias Hotel, Salto</p>
        </div>
      </div>

      <!-- Tarjeta 3. -->
      <div class="alojamiento-tarjeta">
        <div class="alojamiento-multimedia">
          <img class="alojamiento-imagen" src="../imagenes/index/don_pedro.jpg" alt="Jose Pedro, Salto" loading="lazy" decoding="async" />
          <button class="alojamiento-corazon" aria-label="Guardar">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </button>
        </div>
        <div class="alojamiento-informacion">
          <p class="alojamiento-nombre">Jose Pedro, Salto</p>
        </div>
      </div>

    </div>
  </div>
</section>


<!-- Gastronomía local; se conserva el id lugares para mantener sus enlaces. -->
<section class="gastronomia-seccion" id="lugares">
  <div class="gastronomia-interior">

    <div class="gastronomia-encabezado">
      <div>
        <h2 class="gastronomia-titulo">GASTRONOMÍA<br>LOCAL</h2>
        <div class="gastronomia-underline"></div>
      </div>
      <a href="turismo.php" class="seccion-ver-mas" style="margin-top:8px;">VER MÁS</a>
    </div>

    <div class="comida-cuadricula">
      <div class="comida-tarjeta">
        <div class="comida-tarjeta-fondo">
          <img class="comida-tarjeta-imagen" src="../imagenes/index/asado.jpg" alt="Parrillada de asado criollo" loading="lazy" decoding="async" />
        </div>
        <div class="comida-tarjeta-rotulo">
          <span class="comida-tarjeta-boton">Asado criollo</span>
          <p class="comida-tarjeta-descripcion">Parrilla, fuego lento y cortes clásicos de la mesa uruguaya.</p>
        </div>
      </div>
      <div class="comida-tarjeta">
        <div class="comida-tarjeta-fondo">
          <img class="comida-tarjeta-imagen" src="../imagenes/index/empanadas_uruguayas_11992_1200.jpg" alt="Empanadas uruguayas" loading="lazy" decoding="async" />
        </div>
        <div class="comida-tarjeta-rotulo">
          <span class="comida-tarjeta-boton">Empanadas</span>
          <p class="comida-tarjeta-descripcion">Sabores caseros para comer al paso o compartir en familia.</p>
        </div>
      </div>
      <div class="comida-tarjeta">
        <div class="comida-tarjeta-fondo">
          <img class="comida-tarjeta-imagen" src="../imagenes/index/Mate-blog.jpg" alt="Mate uruguayo" loading="lazy" decoding="async" />
        </div>
        <div class="comida-tarjeta-rotulo">
          <span class="comida-tarjeta-boton">Cultura del mate</span>
          <p class="comida-tarjeta-descripcion">Una tradición cotidiana que acompaña plazas, rambla y encuentros.</p>
        </div>
      </div>
    </div>
  </div>
</section>


<!--
     El pie se repite en las páginas principales; mantener los cambios sincronizados.
 -->
<footer class="pie-pagina">
  <div class="pie-pagina-superior-fila">
    <div class="pie-pagina-columnas">
      <div class="pie-pagina-columna">
        <h4 class="pie-pagina-columna-titulo">EVENTOS</h4>
        <ul>
          <li><a href="eventos.php">Eventos Destacados</a></li>
          <li><a href="eventos.php">Todos los Eventos</a></li>
          <li><a href="eventos.php#anteriores-pestanas">Eventos Posteriores</a></li>
        </ul>
      </div>

      <div class="pie-pagina-columna">
        <h4 class="pie-pagina-columna-titulo">TURISMO</h4>
        <ul>
          <li><a href="turismo.php#alojamientos">Hoteles</a></li>
          <li><a href="turismo.php#restaurantes">Restaurantes</a></li>
          <li><a href="lugares.php">Lugares Turísticos</a></li>
          <li><a href="turismo.php#historia">Historia Turística</a></li>
        </ul>
      </div>

      <div class="pie-pagina-columna">
        <h4 class="pie-pagina-columna-titulo">LUGARES</h4>
        <ul>
          <li><a href="lugares.php#plaza-artigas">Plaza Artigas</a></li>
          <li><a href="lugares.php#plaza-33">Plaza Treinta y Tres</a></li>
          <li><a href="lugares.php#parque-solari">Parque Solari</a></li>
          <li><a href="lugares.php#costanera-norte">Costanera Norte</a></li>
        </ul>
      </div>

      <div class="pie-pagina-columna">
        <h4 class="pie-pagina-columna-titulo">SIGTUR</h4>
        <ul>
          <li><a href="#">Sobre VPI</a></li>
          <li><a href="#">UTU Catalina Harrigue de Castaños</a></li>
        </ul>
      </div>
    </div>

    <!-- Acceso directo al formulario de soporte. -->
    <aside class="pie-pagina-soporte-tarjeta">
      <p class="pie-pagina-soporte-antetitulo">Soporte</p>
      <p class="pie-pagina-soporte-mensaje">
        <span class="pie-pagina-soporte-titular">¿Tienes alguna sugerencia?</span>
        <span class="pie-pagina-soporte-cuerpo">Si tienes una sugerencia sobre algún error o problema, hacé click en el botón.</span>
      </p>
      <a class="pie-pagina-soporte-boton" href="soporte.php">Ir a soporte</a>
    </aside>
  </div>

  <div class="pie-pagina-separador"></div>

  <!-- Enlaces sociales con SVG y etiquetas accesibles. -->
  <div class="pie-pagina-redes-sociales">
    <a class="red-social-icono icono-instagram" href="#" aria-label="Instagram">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M11.5821 2.09315C14.652 2.09315 15.0707 2.09315 16.3266 2.09315C17.4429 2.09315 18.0011 2.37224 18.4197 2.51178C18.9779 2.79087 19.3965 2.93041 19.8151 3.34904C20.2338 3.76767 20.5129 4.1863 20.6524 4.74447C20.7919 5.1631 20.9315 5.72127 21.071 6.83762C21.071 8.09351 21.071 8.3726 21.071 11.5821C21.071 14.7916 21.071 15.0707 21.071 16.3266C21.071 17.4429 20.7919 18.0011 20.6524 18.4197C20.3733 18.9779 20.2338 19.3965 19.8151 19.8151C19.3965 20.2338 18.9779 20.5129 18.4197 20.6524C18.0011 20.7919 17.4429 20.9315 16.3266 21.071C15.0707 21.071 14.7916 21.071 11.5821 21.071C8.3726 21.071 8.09351 21.071 6.83762 21.071C5.72127 21.071 5.1631 20.7919 4.74447 20.6524C4.1863 20.3733 3.76767 20.2338 3.34904 19.8151C2.93041 19.3965 2.65132 18.9779 2.51178 18.4197C2.37224 18.0011 2.23269 17.4429 2.09315 16.3266C2.09315 15.0707 2.09315 14.7916 2.09315 11.5821C2.09315 8.3726 2.09315 8.09351 2.09315 6.83762C2.09315 5.72127 2.37224 5.1631 2.51178 4.74447C2.79087 4.1863 2.93041 3.76767 3.34904 3.34904C3.76767 2.93041 4.1863 2.65132 4.74447 2.51178C5.1631 2.37224 5.72127 2.23269 6.83762 2.09315C8.09351 2.09315 8.51214 2.09315 11.5821 2.09315ZM11.5821 0C8.3726 0 8.09351 0 6.83762 0C5.58173 0 4.74447 0.279087 4.04676 0.558174C3.34904 0.83726 2.65132 1.25589 1.95361 1.95361C1.25589 2.65132 0.976804 3.2095 0.558174 4.04676C0.279087 4.74447 0.139543 5.58173 0 6.83762C0 8.09351 0 8.51214 0 11.5821C0 14.7916 0 15.0707 0 16.3266C0 17.5824 0.279087 18.4197 0.558174 19.1174C0.83726 19.8151 1.25589 20.5129 1.95361 21.2106C2.65132 21.9083 3.2095 22.1874 4.04676 22.606C4.74447 22.8851 5.58173 23.0246 6.83762 23.1642C8.09351 23.1642 8.51214 23.1642 11.5821 23.1642C14.652 23.1642 15.0707 23.1642 16.3266 23.1642C17.5824 23.1642 18.4197 22.8851 19.1174 22.606C19.8151 22.3269 20.5129 21.9083 21.2106 21.2106C21.9083 20.5129 22.1874 19.9547 22.606 19.1174C22.8851 18.4197 23.0246 17.5824 23.1642 16.3266C23.1642 15.0707 23.1642 14.652 23.1642 11.5821C23.1642 8.51214 23.1642 8.09351 23.1642 6.83762C23.1642 5.58173 22.8851 4.74447 22.606 4.04676C22.3269 3.34904 21.9083 2.65132 21.2106 1.95361C20.5129 1.25589 19.9547 0.976804 19.1174 0.558174C18.4197 0.279087 17.5824 0.139543 16.3266 0C15.0707 0 14.7916 0 11.5821 0Z" fill="white"/>
        <path d="M11.5821 5.58173C8.23305 5.58173 5.58173 8.23305 5.58173 11.5821C5.58173 14.9311 8.23305 17.5824 11.5821 17.5824C14.9311 17.5824 17.5824 14.9311 17.5824 11.5821C17.5824 8.23305 14.9311 5.58173 11.5821 5.58173ZM11.5821 15.4893C9.48894 15.4893 7.67488 13.8148 7.67488 11.5821C7.67488 9.48894 9.3494 7.67488 11.5821 7.67488C13.6752 7.67488 15.4893 9.3494 15.4893 11.5821C15.4893 13.6752 13.6752 15.4893 11.5821 15.4893Z" fill="white"/>
        <path d="M17.722 6.83762C18.4927 6.83762 19.1174 6.21286 19.1174 5.44219C19.1174 4.67151 18.4927 4.04676 17.722 4.04676C16.9513 4.04676 16.3266 4.67151 16.3266 5.44219C16.3266 6.21286 16.9513 6.83762 17.722 6.83762Z" fill="white"/>
      </svg>
    </a>
    <a class="red-social-icono icono-facebook" href="#" aria-label="Facebook">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M20.2687 0H2.89552C1.29864 0 0 1.29864 0 2.89552V20.2687C0 21.8655 1.29864 23.1642 2.89552 23.1642H11.5821V15.2015H8.68657V11.5821H11.5821V8.68657C11.5821 7.53466 12.0397 6.42993 12.8542 5.6154C13.6687 4.80088 14.7735 4.34328 15.9254 4.34328H18.8209V7.96269H17.3731C16.574 7.96269 15.9254 7.8874 15.9254 8.68657V11.5821H19.5448L18.097 15.2015H15.9254V23.1642H20.2687C21.8655 23.1642 23.1642 21.8655 23.1642 20.2687V2.89552C23.1642 1.29864 21.8655 0 20.2687 0Z" fill="white"/>
      </svg>
    </a>
    <a class="red-social-icono icono-twitter" href="#" aria-label="Twitter">
      <svg width="28" height="24" viewBox="0 0 28 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M27.5075 2.69347C26.5595 3.3412 25.4465 3.68514 24.3089 3.68188C25.5251 2.94389 26.4357 1.77139 26.8678 0.387186C25.8596 1.26507 24.5892 1.75942 23.2694 1.78743C22.3992 0.869392 21.2634 0.266809 20.0326 0.070111C18.8017 -0.126587 17.5421 0.0932115 16.4427 0.69652C15.3434 1.29983 14.4637 2.2541 13.9356 3.41614C13.4075 4.57817 13.2595 5.88528 13.5138 7.14131C11.2743 7.01952 9.08473 6.41393 7.08719 5.36385C5.08966 4.31377 3.32886 2.84269 1.91913 1.04612C1.22929 2.33191 1.02731 3.83567 1.35232 5.26609C1.67732 6.6965 2.50618 7.95175 3.67832 8.78865C2.7937 8.80153 1.9181 8.60423 1.11949 8.21208C1.141 9.53888 1.59388 10.8199 2.4057 11.8503C3.21752 12.8806 4.34136 13.6007 5.59745 13.8954C4.76131 14.1203 3.88675 14.1485 3.03862 13.9778C3.40449 15.1532 4.1173 16.1817 5.07768 16.92C6.03806 17.6582 7.19813 18.0694 8.39617 18.0962C5.86592 19.6772 2.95938 20.5041 0 20.4848C2.4785 22.1515 5.35742 23.077 8.31628 23.1583C11.2752 23.2396 14.1979 22.4735 16.7591 20.9452C19.3203 19.4169 21.4195 17.1864 22.823 14.5021C24.2266 11.8178 24.8794 8.78489 24.7087 5.74106C25.7639 4.85221 26.7045 3.82804 27.5075 2.69347Z" fill="white"/>
      </svg>
    </a>
    <a class="red-social-icono icono-youtube" href="#" aria-label="Youtube">
      <svg width="32" height="24" viewBox="0 0 32 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M31.0545 3.51599C30.6564 2.06823 29.661 1.03412 28.2676 0.620469C25.8788 3.57628e-07 15.7263 0 15.7263 0C15.7263 0 5.77296 3.57628e-07 3.18509 0.620469C1.79162 1.03412 0.796263 2.06823 0.398128 3.51599C-6.07967e-06 6.20469 0 11.5821 0 11.5821C0 11.5821 6.07967e-06 16.9595 0.597208 19.6482C0.995342 21.0959 1.99067 22.1301 3.38414 22.5437C5.77294 23.1642 15.9254 23.1642 15.9254 23.1642C15.9254 23.1642 25.8787 23.1642 28.4666 22.5437C29.86 22.1301 30.8554 21.0959 31.2536 19.6482C31.8508 16.9595 31.8507 11.5821 31.8507 11.5821C31.8507 11.5821 31.8508 6.20469 31.0545 3.51599ZM12.7403 16.5458V6.61834L21.1011 11.5821L12.7403 16.5458Z" fill="white"/>
      </svg>
    </a>
  </div>

  <div class="pie-pagina-divider2"></div>

  <div class="pie-pagina-inferior">
    <p class="pie-pagina-licencia">
      <a href="https://websigtur.onrender.com">SIGTUR</a>
      &copy; 2026 por <span>Turismart</span>. Est? bajo la licencia
      <a href="https://creativecommons.org/licenses/by-nc-nd/4.0/" target="_blank" rel="license noopener noreferrer">CC BY-NC-ND 4.0</a>
      <span class="pie-pagina-licencia-iconos" aria-hidden="true">
        <img src="https://mirrors.creativecommons.org/presskit/icons/cc.svg" alt="" width="18" height="18" loading="lazy" decoding="async">
        <img src="https://mirrors.creativecommons.org/presskit/icons/by.svg" alt="" width="18" height="18" loading="lazy" decoding="async">
        <img src="https://mirrors.creativecommons.org/presskit/icons/nc.svg" alt="" width="18" height="18" loading="lazy" decoding="async">
        <img src="https://mirrors.creativecommons.org/presskit/icons/nd.svg" alt="" width="18" height="18" loading="lazy" decoding="async">
      </span>
    </p>
    <div class="pie-pagina-legal">
      <!-- Estos enlaces legales necesitan sus páginas de destino. -->
      <a href="#">Términos y Condiciones</a>
      <a href="#">Políticas de Privacidad</a>
      <a href="#">Bases Legales</a>
    </div>
  </div>
</footer>

<!-- main.js reúne las interacciones compartidas de la página. -->
<script src="../js/api-config.js"></script>
<script src="../js/main.js?v=20261119-eventos-inicio-visible"></script>
</body>
</html>
