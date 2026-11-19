<!DOCTYPE html>
<html lang="es">
<head>
  <!-- Agenda completa de eventos; la portada muestra una selección destacada. -->
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Eventos - SIGTUR Salto</title>
  <link rel="stylesheet" href="../css/font.css" />
  <link rel="stylesheet" href="../css/styles.css?v=20261119-cc-iconos-legibles" />
  <link rel="stylesheet" href="../css/comment-media.css" />
  <link rel="stylesheet" href="../css/support-events.css?v=20261119-nombres-espanol" />
</head>
<body class="pagina-eventos">

<!-- Navegación principal; Eventos queda marcado como activo en esta página. -->
<header>
  <nav class="barra-navegacion">

    <!-- Logo de SIGTUR. -->
    <a class="navegacion-logotipo" href="index.php" aria-label="Inicio">
      <img src="../imagenes/logo-salto.svg" alt="Explora Salto" />
    </a>

    <!-- Buscador de eventos. -->
    <div class="navegacion-busqueda">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
      <input type="search" aria-label="Buscar en SIGTUR" autocomplete="off" placeholder="¿Qué querés descubrir hoy en Salto?" />
    </div>

    <!-- Enlaces principales de navegación. -->
    <div class="navegacion-enlaces">
      <a href="eventos.php" class="activo">Eventos</a>
      <a href="turismo.php">Turismo</a>
      <a href="lugares.php">Lugares</a>
    </div>

  </nav>
</header>


<!-- Portada de eventos y ola decorativa. Los identificadores del gradiente son locales a este SVG. -->
<section class="portada">
  <div class="portada-fondo"></div>
  <div class="portada-superpuesto"></div>

  <div class="portada-contenido">
    <h1 class="portada-titulo">EVENTOS</h1>

    <!-- Ola decorativa de la portada. -->
    <div class="portada-olas">
      <svg viewBox="0 0 640 60" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:clamp(260px,45vw,640px); height:auto; margin-top:-4px;">
        <path d="M8 38 C80 10, 180 52, 280 26 S440 0, 560 30 S610 50, 632 32"
              stroke="url(#wg1)" stroke-width="14" stroke-linecap="round" fill="none"/>
        <path d="M28 22 C100 4, 200 42, 320 18 S480 -2, 596 20 S620 38, 636 22"
              stroke="url(#wg2)" stroke-width="8" stroke-linecap="round" fill="none" opacity="0.5"/>
        <path d="M80 12 C150 2, 230 28, 360 14"
              stroke="url(#wg2)" stroke-width="6" stroke-linecap="round" fill="none" opacity="0.3"/>
        <defs>
          <linearGradient id="grupo-clima-1" x1="0" y1="0" x2="640" y2="0" gradientUnits="userSpaceOnUse">
            <stop stop-color="#7aa86f"/>
            <stop offset="1" stop-color="#42a41e"/>
          </linearGradient>
          <linearGradient id="grupo-clima-2" x1="0" y1="0" x2="640" y2="0" gradientUnits="userSpaceOnUse">
            <stop stop-color="#7aa86f"/>
            <stop offset="1" stop-color="#42a41e"/>
          </linearGradient>
        </defs>
      </svg>
    </div>
  </div>
</section>


<!-- Eventos destacados. -->
<section class="destacados-seccion">

  <div class="destacados-encabezado">
    <h2>DESTACADOS</h2>
    <a href="eventos.php#anteriores-pestanas" class="ver-mas-enlace">Ver todos</a>
  </div>

  <div class="destacados-cuadricula">
    <!-- Tarjeta 3 – Vacaciones de Julio en Energimundo -->
    <div class="evento-tarjeta" style="border-radius:49px; margin-top:12px;">
      <img class="evento-tarjeta-imagen" src="../imagenes/eventos/energimundo.webp" alt="Vacaciones de Julio en Energimundo" loading="lazy" decoding="async" />
      <p class="evento-tarjeta-fecha" style="font-size:0.75rem;opacity:0.65;margin:6px 14px 0;">27 Jun</p>
      <p class="evento-tarjeta-titulo">Vacaciones de Julio en Energimundo 2026</p>
      <p class="evento-tarjeta-subtitulo">Familiar | Salto Grande · Energimundo</p>
    </div>

    <!-- Tarjeta 4 – Rally de Salto -->
    <div class="evento-tarjeta" style="border-radius:49px; margin-top:12px;">
      <img class="evento-tarjeta-imagen" src="../imagenes/eventos/rally.webp" alt="4ª Fecha Rally de Salto" loading="lazy" decoding="async" />
      <p class="evento-tarjeta-fecha" style="font-size:0.75rem;opacity:0.65;margin:6px 14px 0;">26 Jun</p>
      <p class="evento-tarjeta-titulo">4ª Fecha Rally de Salto &ndash; Copa 95 Años de ANCAP 2026</p>
      <p class="evento-tarjeta-subtitulo">Deportivo | Del 26 al 28 de junio · Entrada libre</p>
    </div>

    <!-- Tarjeta 5 – Muestra Academia de Danzas de Lucía Tenca -->
    <div class="evento-tarjeta" style="border-radius:49px; margin-top:12px;">
      <img class="evento-tarjeta-imagen" src="../imagenes/eventos/muestradanza.webp" alt="Muestra Academia de Danzas de Lucía Tenca" loading="lazy" decoding="async" />
      <p class="evento-tarjeta-fecha" style="font-size:0.75rem;opacity:0.65;margin:6px 14px 0;">25 Jun</p>
      <p class="evento-tarjeta-titulo">Muestra Academia de Danzas de Lucía Tenca</p>
      <p class="evento-tarjeta-subtitulo">Cultural | Teatro Larrañaga · 20:30 hs</p>
    </div>

  </div>
</section>


<!-- El buscador filtra por texto y las pestañas por data-categoria-evento; ambos se conectan en main.js. -->
<section class="próximos-seccion">

  <div class="próximos-encabezado">
    <h2>Próximos eventos</h2>
  </div>

  <!-- Búsqueda de eventos. -->
  <div class="busqueda-filtro-barra">
    <div class="busqueda-pastilla">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
      <input type="search" aria-label="Buscar eventos" autocomplete="off" placeholder="Buscá por nombre, lugar o categoría" />
    </div>
  </div>

  <!-- Filtros por categoría. -->
  <div class="categoria-pestanas">
    <button class="categoria-pestana activo" data-categoria-evento="todos">Todos</button>
    <button class="categoria-pestana" data-categoria-evento="musica">Música</button>
    <button class="categoria-pestana" data-categoria-evento="deportes">Deportes</button>
    <button class="categoria-pestana" data-categoria-evento="cultura">Cultura</button>
    <button class="categoria-pestana" data-categoria-evento="gastronomia">Gastronomía</button>
    <button class="categoria-pestana" data-categoria-evento="feria">Feria</button>
    <button class="categoria-pestana" data-categoria-evento="religiosos">Religiosos</button>
    <button class="categoria-pestana" data-categoria-evento="infantiles">Infantiles</button>
  </div>

  <!-- Agenda de eventos. -->
  <div class="evento-entradas">

    <!-- Evento 1 – Maratón Internacional -->
    <div class="entrada-fila" data-categoria-evento="deportes">
      <div class="entrada-fecha">
        <span class="dia">03</span>
        <span class="mes">NOV</span>
      </div>
      <div class="entrada-separador"></div>
      <div class="entrada-informacion">
        <span class="entrada-titulo">Maratón Internacional</span>
        <span class="entrada-subtitulo">Veni a correr con nosotros</span>
        <div class="entrada-ubicacion">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
          </svg>
          Costanera Norte
        </div>
      </div>
      <span class="entrada-insignia insignia-verde">Deportes</span>
      <span class="entrada-hora">20:00 hs</span>
      <button class="entrada-corazon" aria-label="Guardar">
        <svg viewBox="0 0 79 79" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path class="corazon-relleno" d="M39.5 65 C20 50 8 40 8 26 A14 14 0 0 1 39.5 22 A14 14 0 0 1 71 26 C71 40 59 50 39.5 65Z"
                fill="none" stroke="rgba(0,0,0,0.25)" stroke-width="3"/>
        </svg>
      </button>
    </div>

    <!-- Evento 2 – Festival Primavera -->
    <div class="entrada-fila" data-categoria-evento="musica">
      <div class="entrada-fecha">
        <span class="dia">03</span>
        <span class="mes">NOV</span>
      </div>
      <div class="entrada-separador"></div>
      <div class="entrada-informacion">
        <span class="entrada-titulo">Festival Primavera</span>
        <span class="entrada-subtitulo">Veni a correr con nosotros</span>
        <div class="entrada-ubicacion">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
          </svg>
          Costanera Norte
        </div>
      </div>
      <span class="entrada-insignia insignia-purpura">Música</span>
      <span class="entrada-hora">20:00 hs</span>
      <button class="entrada-corazon" aria-label="Guardar">
        <svg viewBox="0 0 79 79" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path class="corazon-relleno" d="M39.5 65 C20 50 8 40 8 26 A14 14 0 0 1 39.5 22 A14 14 0 0 1 71 26 C71 40 59 50 39.5 65Z"
                fill="none" stroke="rgba(0,0,0,0.25)" stroke-width="3"/>
        </svg>
      </button>
    </div>

    <!-- Evento 3 – Expo Salto Productivo -->
    <div class="entrada-fila" data-categoria-evento="feria">
      <div class="entrada-fecha">
        <span class="dia">03</span>
        <span class="mes">NOV</span>
      </div>
      <div class="entrada-separador"></div>
      <div class="entrada-informacion">
        <span class="entrada-titulo">Expo Salto Productivo</span>
        <span class="entrada-subtitulo">Veni a correr con nosotros</span>
        <div class="entrada-ubicacion">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
          </svg>
          Costanera Norte
        </div>
      </div>
      <span class="entrada-insignia insignia-dorado">Feria</span>
      <span class="entrada-hora">20:00 hs</span>
      <button class="entrada-corazon" aria-label="Guardar">
        <svg viewBox="0 0 79 79" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path class="corazon-relleno" d="M39.5 65 C20 50 8 40 8 26 A14 14 0 0 1 39.5 22 A14 14 0 0 1 71 26 C71 40 59 50 39.5 65Z"
                fill="none" stroke="rgba(0,0,0,0.25)" stroke-width="3"/>
        </svg>
      </button>
    </div>

  </div>

  <!-- Control para mostrar más eventos. -->
  <a href="eventos.php#anteriores-pestanas" class="ver-mas-boton">Ver más próximos eventos</a>

</section>


<!-- Carrusel de eventos destacados. main.js agrega las copias necesarias para el desplazamiento continuo. -->
<section class="carrusel-seccion">

  <div class="encabezado-seccion">
    <div></div>
    <a href="eventos.php#anteriores-pestanas" class="ver-mas-enlace">Ver todos</a>
  </div>

  <div class="destacado-carrusel">
    <div class="destacado-pista">

      <!-- Diapositiva 1 – Noche de Milonga -->
      <div class="destacado-diapositiva">
        <div class="destacado-tarjeta" style="overflow:hidden;position:relative;">
          <img src="../imagenes/eventos/maxv.jpg" alt="Noche de Milonga" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0.4;border-radius:inherit;" loading="lazy" decoding="async" />
          <div style="position:relative;z-index:1;">
            <p class="destacado-titulo">Noche de Milonga</p>
            <p class="destacado-subtitulo">Cultura | Club Remeros | Vie. 27/6</p>
          </div>
        </div>
      </div>

      <!-- Diapositiva 2 – Feria del Libro Salteño -->
      <div class="destacado-diapositiva">
        <div class="destacado-tarjeta" style="overflow:hidden;position:relative;">
          <img src="../imagenes/eventos/porco.jpg" alt="Feria del Libro Salteño" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0.4;border-radius:inherit;" loading="lazy" decoding="async" />
          <div style="position:relative;z-index:1;">
            <p class="destacado-titulo">Feria del Libro Salteño</p>
            <p class="destacado-subtitulo">Feria | Biblioteca Departamental | Sáb. 28/6</p>
          </div>
        </div>
      </div>

      <!-- Diapositiva 3 – Torneo de Paddle Nocturno -->
      <div class="destacado-diapositiva">
        <div class="destacado-tarjeta" style="overflow:hidden;position:relative;">
          <img src="../imagenes/eventos/whatsapp-image-2025-03-17-92805-am-1.jpeg" alt="Torneo de Paddle Nocturno" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0.4;border-radius:inherit;" loading="lazy" decoding="async" />
          <div style="position:relative;z-index:1;">
            <p class="destacado-titulo">Torneo de Paddle Nocturno</p>
            <p class="destacado-subtitulo">Deportivo | Complejo Solari | Dom. 29/6</p>
          </div>
        </div>
      </div>

      <!-- Diapositiva 4 (clone para loop suave) -->
      <div class="destacado-diapositiva" aria-hidden="true">
        <div class="destacado-tarjeta" style="overflow:hidden;position:relative;">
          <img src="../imagenes/eventos/maxv.jpg" alt="Noche de Milonga" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0.4;border-radius:inherit;" loading="lazy" decoding="async" />
          <div style="position:relative;z-index:1;">
            <p class="destacado-titulo">Noche de Milonga</p>
            <p class="destacado-subtitulo">Cultura | Club Remeros | Vie. 27/6</p>
          </div>
        </div>
      </div>

      <!-- Diapositiva 5: copia para el bucle del carrusel. -->
      <div class="destacado-diapositiva" aria-hidden="true">
        <div class="destacado-tarjeta" style="overflow:hidden;position:relative;">
          <img src="../imagenes/eventos/porco.jpg" alt="Feria del Libro Salteño" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0.4;border-radius:inherit;" loading="lazy" decoding="async" />
          <div style="position:relative;z-index:1;">
            <p class="destacado-titulo">Feria del Libro Salteño</p>
            <p class="destacado-subtitulo">Feria | Biblioteca Departamental | Sáb. 28/6</p>
          </div>
        </div>
      </div>

      <!-- Diapositiva 6: copia para el bucle del carrusel. -->
      <div class="destacado-diapositiva" aria-hidden="true">
        <div class="destacado-tarjeta" style="overflow:hidden;position:relative;">
          <img src="../imagenes/eventos/whatsapp-image-2025-03-17-92805-am-1.jpeg" alt="Torneo de Paddle Nocturno" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0.4;border-radius:inherit;" loading="lazy" decoding="async" />
          <div style="position:relative;z-index:1;">
            <p class="destacado-titulo">Torneo de Paddle Nocturno</p>
            <p class="destacado-subtitulo">Deportivo | Complejo Solari | Dom. 29/6</p>
          </div>
        </div>
      </div>

    </div><!-- Fin de la pista de destacados. -->
  </div><!-- Fin del carrusel de destacados. -->

  <!-- Indicadores del carrusel. -->
  <div class="carrusel-puntos"></div>

</section>


<!-- El id anteriores-pestanas es el destino de los enlaces a esta sección. -->
<section class="anteriores-seccion">

  <div class="anteriores-encabezado">
    <h2>EVENTOS ANTERIORES</h2>
    <a href="eventos.php" class="ver-mas-enlace">Todos los eventos</a>
  </div>

  <!-- Filtros de eventos anteriores. -->
  <div class="categoria-pestanas" id="anteriores-pestanas">
    <button class="categoria-pestana activo" data-categoria-evento="todos">Todos</button>
    <button class="categoria-pestana" data-categoria-evento="musica">Música</button>
    <button class="categoria-pestana" data-categoria-evento="deportes">Deportes</button>
    <button class="categoria-pestana" data-categoria-evento="cultura">Cultura</button>
    <button class="categoria-pestana" data-categoria-evento="gastronomia">Gastronomía</button>
    <button class="categoria-pestana" data-categoria-evento="feria">Feria</button>
    <button class="categoria-pestana" data-categoria-evento="religiosos">Religiosos</button>
    <button class="categoria-pestana" data-categoria-evento="infantiles">Infantiles</button>
  </div>

  <div class="evento-entradas" id="anteriores-lista">

    <div class="entrada-fila" data-categoria-evento="musica">
      <div class="entrada-fecha">
        <span class="dia">03</span>
        <span class="mes">NOV</span>
      </div>
      <div class="entrada-separador"></div>
      <div class="entrada-informacion">
        <span class="entrada-titulo">Festival Primavera</span>
        <span class="entrada-subtitulo">Bandas locales y cierre en vivo</span>
        <div class="entrada-ubicacion">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
          </svg>
          Costanera Norte
        </div>
      </div>
      <span class="entrada-insignia insignia-purpura">Música</span>
      <span class="entrada-hora">20:00 hs</span>
      <button class="entrada-corazon" aria-label="Guardar">
        <svg viewBox="0 0 79 79" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path class="corazon-relleno" d="M39.5 65 C20 50 8 40 8 26 A14 14 0 0 1 39.5 22 A14 14 0 0 1 71 26 C71 40 59 50 39.5 65Z"
                fill="none" stroke="rgba(0,0,0,0.25)" stroke-width="3"/>
        </svg>
      </button>
    </div>

    <div class="entrada-fila" data-categoria-evento="deportes">
      <div class="entrada-fecha">
        <span class="dia">12</span>
        <span class="mes">OCT</span>
      </div>
      <div class="entrada-separador"></div>
      <div class="entrada-informacion">
        <span class="entrada-titulo">Maratón Costanera</span>
        <span class="entrada-subtitulo">Carrera participativa junto al río</span>
        <div class="entrada-ubicacion">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
          </svg>
          Costanera Sur
        </div>
      </div>
      <span class="entrada-insignia insignia-verde">Deportes</span>
      <span class="entrada-hora">09:00 hs</span>
      <button class="entrada-corazon" aria-label="Guardar">
        <svg viewBox="0 0 79 79" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path class="corazon-relleno" d="M39.5 65 C20 50 8 40 8 26 A14 14 0 0 1 39.5 22 A14 14 0 0 1 71 26 C71 40 59 50 39.5 65Z"
                fill="none" stroke="rgba(0,0,0,0.25)" stroke-width="3"/>
        </svg>
      </button>
    </div>

    <div class="entrada-fila" data-categoria-evento="cultura">
      <div class="entrada-fecha">
        <span class="dia">21</span>
        <span class="mes">SEP</span>
      </div>
      <div class="entrada-separador"></div>
      <div class="entrada-informacion">
        <span class="entrada-titulo">Noche de Museos</span>
        <span class="entrada-subtitulo">Recorridos, charlas y muestras abiertas</span>
        <div class="entrada-ubicacion">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
          </svg>
          Centro Cultural
        </div>
      </div>
      <span class="entrada-insignia insignia-azul">Cultura</span>
      <span class="entrada-hora">19:30 hs</span>
      <button class="entrada-corazon" aria-label="Guardar">
        <svg viewBox="0 0 79 79" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path class="corazon-relleno" d="M39.5 65 C20 50 8 40 8 26 A14 14 0 0 1 39.5 22 A14 14 0 0 1 71 26 C71 40 59 50 39.5 65Z"
                fill="none" stroke="rgba(0,0,0,0.25)" stroke-width="3"/>
        </svg>
      </button>
    </div>

    <div class="entrada-fila" data-categoria-evento="gastronomia">
      <div class="entrada-fecha">
        <span class="dia">08</span>
        <span class="mes">AGO</span>
      </div>
      <div class="entrada-separador"></div>
      <div class="entrada-informacion">
        <span class="entrada-titulo">Sabores del Litoral</span>
        <span class="entrada-subtitulo">Degustaciones, parrilla y productos regionales</span>
        <div class="entrada-ubicacion">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
          </svg>
          Mercado 18 de Julio
        </div>
      </div>
      <span class="entrada-insignia insignia-dorado">Gastronomía</span>
      <span class="entrada-hora">18:00 hs</span>
      <button class="entrada-corazon" aria-label="Guardar">
        <svg viewBox="0 0 79 79" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path class="corazon-relleno" d="M39.5 65 C20 50 8 40 8 26 A14 14 0 0 1 39.5 22 A14 14 0 0 1 71 26 C71 40 59 50 39.5 65Z"
                fill="none" stroke="rgba(0,0,0,0.25)" stroke-width="3"/>
        </svg>
      </button>
    </div>

    <div class="entrada-fila" data-categoria-evento="feria">
      <div class="entrada-fecha">
        <span class="dia">14</span>
        <span class="mes">JUL</span>
      </div>
      <div class="entrada-separador"></div>
      <div class="entrada-informacion">
        <span class="entrada-titulo">Feria de Artesanos</span>
        <span class="entrada-subtitulo">Diseño, tejidos y emprendimientos salteños</span>
        <div class="entrada-ubicacion">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
          </svg>
          Plaza Artigas
        </div>
      </div>
      <span class="entrada-insignia insignia-dorado">Feria</span>
      <span class="entrada-hora">15:00 hs</span>
      <button class="entrada-corazon" aria-label="Guardar">
        <svg viewBox="0 0 79 79" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path class="corazon-relleno" d="M39.5 65 C20 50 8 40 8 26 A14 14 0 0 1 39.5 22 A14 14 0 0 1 71 26 C71 40 59 50 39.5 65Z"
                fill="none" stroke="rgba(0,0,0,0.25)" stroke-width="3"/>
        </svg>
      </button>
    </div>

    <div class="entrada-fila" data-categoria-evento="religiosos">
      <div class="entrada-fecha">
        <span class="dia">24</span>
        <span class="mes">JUN</span>
      </div>
      <div class="entrada-separador"></div>
      <div class="entrada-informacion">
        <span class="entrada-titulo">Fiesta de San Juan</span>
        <span class="entrada-subtitulo">Encuentro comunitario y celebración tradicional</span>
        <div class="entrada-ubicacion">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
          </svg>
          Barrio Ceibal
        </div>
      </div>
      <span class="entrada-insignia insignia-turquesa">Religiosos</span>
      <span class="entrada-hora">17:00 hs</span>
      <button class="entrada-corazon" aria-label="Guardar">
        <svg viewBox="0 0 79 79" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path class="corazon-relleno" d="M39.5 65 C20 50 8 40 8 26 A14 14 0 0 1 39.5 22 A14 14 0 0 1 71 26 C71 40 59 50 39.5 65Z"
                fill="none" stroke="rgba(0,0,0,0.25)" stroke-width="3"/>
        </svg>
      </button>
    </div>

    <div class="entrada-fila" data-categoria-evento="infantiles">
      <div class="entrada-fecha">
        <span class="dia">09</span>
        <span class="mes">MAY</span>
      </div>
      <div class="entrada-separador"></div>
      <div class="entrada-informacion">
        <span class="entrada-titulo">Tarde de Juegos</span>
        <span class="entrada-subtitulo">Actividades para niños, plaza y espectáculo familiar</span>
        <div class="entrada-ubicacion">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
          </svg>
          Parque Solari
        </div>
      </div>
      <span class="entrada-insignia insignia-rosa">Infantiles</span>
      <span class="entrada-hora">16:00 hs</span>
      <button class="entrada-corazon" aria-label="Guardar">
        <svg viewBox="0 0 79 79" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path class="corazon-relleno" d="M39.5 65 C20 50 8 40 8 26 A14 14 0 0 1 39.5 22 A14 14 0 0 1 71 26 C71 40 59 50 39.5 65Z"
                fill="none" stroke="rgba(0,0,0,0.25)" stroke-width="3"/>
        </svg>
      </button>
    </div>

  </div><!-- Fin de la lista de eventos anteriores. -->

</section>


<!-- El pie se mantiene sincronizado con las otras páginas principales. -->
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
          <li><a href="#">Sobre TURI-SMART</a></li>
          <li><a href="#">UTU Catalina Harrigue de Castaños</a></li>
        </ul>
      </div>
    </div>

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
      <a href="#">Términos y Condiciones</a>
      <a href="#">Políticas de Privacidad</a>
      <a href="#">Bases Legales</a>
    </div>
  </div>
</footer>

<script src="../js/api-config.js"></script>
<script src="../js/comment-media.js?v=20261119-nombres-espanol"></script>
<script src="../js/main.js?v=20261119-nombres-espanol"></script>

</body>
</html>

