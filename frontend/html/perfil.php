<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Mi perfil - SIGTUR Salto</title>
  <link rel="stylesheet" href="../css/font.css" />
  <link rel="stylesheet" href="../css/styles.css" />
</head>
<body class="profile-page">
  <main class="profile-wrapper">
    <a class="profile-back" href="index.php">← Volver a explorar</a>
    <section class="profile-header" aria-labelledby="profile-title">
      <div class="profile-avatar" id="avatar" aria-hidden="true">?</div>
      <div class="user-info">
        <p class="profile-kicker">Tu cuenta SIGTUR</p>
        <h1 id="profile-title">Cargando...</h1>
        <p id="bio">Cargando datos...</p>
        <div id="role-tags" class="role-tags"></div>
        <button class="profile-edit-trigger" type="button" data-profile-edit>Editar perfil</button>
      </div>
    </section>

    <section class="profile-editor" data-profile-editor hidden aria-labelledby="profile-editor-title">
      <div class="profile-section-heading"><p class="profile-kicker">Personalización</p><h2 id="profile-editor-title">Editar perfil</h2></div>
      <form id="profile-edit-form">
        <label class="profile-photo-picker" for="profile-avatar-input"><span id="profile-avatar-preview" class="profile-avatar-preview">?</span><span>Cambiar foto<small>JPG, PNG o WebP</small></span></label>
        <input id="profile-avatar-input" type="file" accept="image/png,image/jpeg,image/webp" hidden>
        <div class="profile-form-grid"><label>Nombre<input name="nombre" maxlength="100" required></label><label>Ubicación<input name="ubicacion" maxlength="100" placeholder="Salto, Uruguay"></label></div>
        <label>Biografía<textarea name="biografia" rows="3" maxlength="300" placeholder="Contanos algo sobre vos..."></textarea></label>
        <label>Sitio web<input name="sitio_web" type="url" maxlength="500" placeholder="https://ejemplo.com"></label>
        <div class="profile-editor-actions"><button type="button" data-profile-edit-cancel>Cancelar</button><button type="submit">Guardar cambios</button></div><p class="profile-editor-status" data-profile-editor-status></p>
      </form>
    </section>

    <section class="profile-messages" aria-labelledby="messages-title">
      <div class="profile-section-heading">
        <p class="profile-kicker">Conversaciones</p>
        <h2 id="messages-title">Mensajes</h2>
      </div>
      <div class="dm-layout">
        <aside class="dm-contacts">
          <label for="dm-contact-search">Buscar conversación</label>
          <input id="dm-contact-search" type="search" placeholder="Buscar por nombre o correo" aria-label="Buscar conversación" />
          <label for="dm-contact">Nueva conversación</label>
          <select id="dm-contact"><option value="">Elegí un usuario</option></select>
          <div id="dm-contact-list" aria-live="polite"></div>
        </aside>
        <section class="dm-thread" aria-live="polite">
          <header class="dm-thread-header">
            <div><small>MENSAJES PRIVADOS</small><strong id="dm-active-contact">Seleccioná una conversación</strong></div>
            <span>🔒 Privado</span>
          </header>
          <div id="dm-thread-list" class="dm-thread-list"><p class="dm-empty">Seleccioná una conversación para comenzar.</p></div>
          <form id="dm-form" class="dm-form">
            <div class="dm-compose-row">
              <textarea id="dm-message" rows="2" maxlength="5000" placeholder="Escribí un mensaje..." disabled></textarea>
              <button class="dm-send-text" type="submit" disabled><span aria-hidden="true">➤</span> Enviar</button>
            </div>
            <div class="dm-audio-tools">
              <button id="dm-record" class="dm-record-button" type="button" aria-pressed="false" disabled><span aria-hidden="true">🎙</span> Grabar audio</button>
              <span id="dm-recording-status" class="dm-recording-status" aria-live="polite">El audio dura hasta 2 minutos.</span>
            </div>
            <section id="dm-audio-preview" class="dm-audio-preview" hidden aria-label="Vista previa del audio">
              <audio id="dm-audio-playback" controls preload="metadata"></audio>
              <div class="dm-audio-preview-actions">
                <button id="dm-audio-discard" type="button">Descartar</button>
                <button id="dm-audio-send" type="button" disabled>Enviar audio</button>
              </div>
            </section>
            <div class="dm-attachment-tools">
              <button id="dm-attach" class="dm-attach-button" type="button" disabled><span aria-hidden="true">📎</span> Adjuntar archivos</button>
              <input id="dm-attachment-input" type="file" accept="image/jpeg,image/png,image/webp,image/gif,application/pdf" multiple hidden disabled>
              <span id="dm-attachment-status" aria-live="polite">JPG, PNG, WebP, GIF o PDF · hasta 3 archivos de 10 MB</span>
            </div>
            <div id="dm-attachment-preview" class="dm-attachment-preview" aria-live="polite"></div>
          </form>
          <p id="dm-status" class="dm-status"></p>
        </section>
      </div>
    </section>

    <div class="stats-row" aria-label="Resumen de actividad">
      <div class="stat"><span id="total-count">0</span><small>Visitas guardadas</small></div>
      <div class="stat"><span id="following">0</span><small>Preferencias</small></div>
      <div class="stat"><span id="followers">0</span><small>Sesión activa</small></div>
    </div>

    <section class="profile-content" aria-labelledby="content-title">
      <div class="profile-section-heading">
        <p class="profile-kicker">Tu tablero</p>
        <h2 id="content-title">Descubre Salto</h2>
      </div>
      <div class="grid-container" id="content-grid"></div>
    </section>

    <section class="profile-reservations" aria-labelledby="reservations-title">
      <div class="profile-section-heading"><p class="profile-kicker">Tu agenda</p><h2 id="reservations-title">Eventos reservados</h2></div>
      <div id="reservations-list" class="reservations-list"></div>
    </section>

    <footer class="profile-footer">
      <button type="button" data-profile-logout>🔒 Cerrar sesión</button>
      <a href="login.php">🔑 Cambiar de cuenta</a>
    </footer>
  </main>
  <script src="../js/api-config.js"></script>
  <script src="../js/main.js?v=20260915-profile-editor"></script>
</body>
</html>
