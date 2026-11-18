<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

function agregarAliasJson(array $datos): array {
    $equivalencias = [
        'error' => 'fallo', 'success' => 'exito', 'pending' => 'pendiente',
        'message' => 'mensaje', 'data' => 'datos', 'total' => 'cantidad',
        'refreshToken' => 'tokenActualizacion', 'expiresAt' => 'venceEn',
        'name' => 'nombre', 'title' => 'titulo', 'description' => 'descripcion',
        'location' => 'ubicacion', 'created_at' => 'creado_en',
        'email' => 'correo', 'password' => 'contrasena', 'user' => 'usuario',
        'address' => 'direccion', 'image_url' => 'imagen', 'link' => 'enlace',
        'categories' => 'categorias', 'type' => 'tipo', 'latitude' => 'latitud',
        'longitude' => 'longitud',
    ];
    foreach ($datos as $clave => $valor) {
        if (is_array($valor)) $datos[$clave] = agregarAliasJson($valor);
    }
    foreach ($equivalencias as $nombreAnterior => $nombreNuevo) {
        if (array_key_exists($nombreAnterior, $datos) && !array_key_exists($nombreNuevo, $datos)) {
            $datos[$nombreNuevo] = $datos[$nombreAnterior];
        } elseif (array_key_exists($nombreNuevo, $datos) && !array_key_exists($nombreAnterior, $datos)) {
            $datos[$nombreAnterior] = $datos[$nombreNuevo];
        }
    }
    return $datos;
}

function responderJson(array $datos, int $opciones = JSON_UNESCAPED_UNICODE): void {
    echo json_encode(agregarAliasJson($datos), $opciones);
}

function leerVariableEntorno(string $nombreVariable): string {
    $valor = getenv($nombreVariable);
    if ($valor !== false && $valor !== '') return trim($valor);
    $rutaEntorno = dirname(__DIR__, 3) . DIRECTORY_SEPARATOR . 'backend' . DIRECTORY_SEPARATOR . '.env';
    if (!is_readable($rutaEntorno)) return '';
    foreach (file($rutaEntorno, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $linea) {
        $linea = trim($linea);
        if ($linea === '' || str_starts_with($linea, '#') || !str_contains($linea, '=')) continue;
        [$clave, $valorConfiguracion] = explode('=', $linea, 2);
        if (trim($clave) === $nombreVariable) return trim($valorConfiguracion, " \t\"'");
    }
    return '';
}

function leerCuerpoJson(): array {
    $cuerpo = json_decode(file_get_contents('php://input'), true);
    return is_array($cuerpo) ? $cuerpo : [];
}

function solicitarSupabase(string $metodo, string $ruta, ?array $cuerpo = null, ?string $token = null, ?string $claveApi = null): array {
    $urlBase = rtrim(leerVariableEntorno('SUPABASE_URL'), '/');
    // Este proxy se ejecuta en Apache, no en el navegador. Usa la clave del
    // servidor para que el modo XAMPP no dependa de una anon key antigua.
    $claveServidor = leerVariableEntorno('SUPABASE_SERVICE_KEY');
    if ($urlBase === '' || $claveServidor === '' || str_contains(strtolower($claveServidor), 'tu-service')) return [503, ['error' => 'Configura SUPABASE_URL y SUPABASE_SERVICE_KEY en backend/.env.']];
    $encabezados = ['apikey: ' . ($claveApi ?: $claveServidor), 'Authorization: Bearer ' . ($token ?: $claveApi ?: $claveServidor), 'Accept: application/json', 'Content-Type: application/json'];
    $conexion = curl_init($urlBase . $ruta);
    curl_setopt_array($conexion, [
        CURLOPT_CUSTOMREQUEST => $metodo, CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => $encabezados, CURLOPT_TIMEOUT => 12,
    ]);
    if ($cuerpo !== null) curl_setopt($conexion, CURLOPT_POSTFIELDS, json_encode($cuerpo));
    $respuesta = curl_exec($conexion);
    $estado = (int) curl_getinfo($conexion, CURLINFO_HTTP_CODE);
    curl_close($conexion);
    $cargaUtil = json_decode($respuesta ?: '', true);
    return [$estado, is_array($cargaUtil) ? $cargaUtil : []];
}

function crearRespuestaSesion(array $autenticacion): array {
    $usuario = $autenticacion['user'] ?? [];
    $metadatos = $usuario['user_metadata'] ?? [];
    $nombre = trim((string) ($metadatos['nombre'] ?? $metadatos['full_name'] ?? strstr((string) ($usuario['email'] ?? ''), '@', true) ?: 'Usuario'));
    return [
        'token' => $autenticacion['access_token'] ?? null,
        'tokenActualizacion' => $autenticacion['refresh_token'] ?? null,
        'refreshToken' => $autenticacion['refresh_token'] ?? null,
        'expiresAt' => $autenticacion['expires_at'] ?? null,
        'usuario' => ['id' => $usuario['id'] ?? null, 'nombre' => $nombre, 'correo' => $usuario['email'] ?? null, 'rol' => 'usuario'],
    ];
}

function leerTokenPortador(): string {
    $encabezado = (string) ($_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '');
    if ($encabezado === '' && function_exists('getallheaders')) {
        $encabezados = getallheaders();
        $encabezado = (string) ($encabezados['Authorization'] ?? $encabezados['authorization'] ?? '');
    }
    return preg_match('/^Bearer\s+(.+)$/i', $encabezado, $coincidencias) ? trim($coincidencias[1]) : '';
}

$accion = trim((string) ($_GET['action'] ?? ''));
$metodo = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$expresionCorreo = '/^[^\s@]+@[^\s@]+\.[^\s@]+$/';

if ($accion === 'google' && $metodo === 'GET') {
    $urlRetorno = leerVariableEntorno('FRONTEND_URL');
    if ($urlRetorno === '') { http_response_code(503); responderJson(['error' => 'Configura FRONTEND_URL para Google OAuth.']); exit; }
    $urlSolicitud = rtrim(leerVariableEntorno('SUPABASE_URL'), '/') . '/auth/v1/authorize?' . http_build_query([
        'provider' => 'google', 'redirect_to' => $urlRetorno, 'flow_type' => 'implicit',
    ]);
    header('Location: ' . $urlSolicitud, true, 302);
    exit;
}

if ($accion === 'login' && $metodo === 'POST') {
    $cuerpo = leerCuerpoJson();
    $correo = strtolower(trim((string) ($cuerpo['correo'] ?? $cuerpo['email'] ?? '')));
    $contrasena = (string) ($cuerpo['contrasena'] ?? $cuerpo['password'] ?? '');
    if (!preg_match($expresionCorreo, $correo) || $contrasena === '') { http_response_code(400); responderJson(['error' => 'Correo o contraseña inválidos.']); exit; }
    [$estado, $autenticacion] = solicitarSupabase('POST', '/auth/v1/token?grant_type=password', ['email' => $correo, 'password' => $contrasena]);
    if ($estado < 200 || $estado >= 300 || empty($autenticacion['access_token'])) { http_response_code(401); responderJson(['error' => 'Correo o contraseña incorrectos.']); exit; }
    [$estadoPerfil, $perfiles] = solicitarSupabase('GET', '/rest/v1/usuarios?select=id,nombre,apellido,correo,rol&id=eq.' . rawurlencode((string) $autenticacion['user']['id']), null, $autenticacion['access_token']);
    if ($estadoPerfil < 200 || $estadoPerfil >= 300 || empty($perfiles[0])) {
        http_response_code(503); responderJson(['error' => 'No se pudo validar el perfil de la cuenta.']); exit;
    }
    $resultado = crearRespuestaSesion($autenticacion);
    $resultado['usuario'] = $perfiles[0];
    responderJson($resultado, JSON_UNESCAPED_UNICODE); exit;
}

if ($accion === 'refresh' && $metodo === 'POST') {
    $cuerpo = leerCuerpoJson();
    $tokenActualizacion = trim((string) ($cuerpo['tokenActualizacion'] ?? $cuerpo['refreshToken'] ?? $cuerpo['refresh_token'] ?? ''));
    if ($tokenActualizacion === '') { http_response_code(401); responderJson(['error' => 'La sesión venció. Inicia sesión nuevamente.']); exit; }
    [$estado, $autenticacion] = solicitarSupabase('POST', '/auth/v1/token?grant_type=refresh_token', ['refresh_token' => $tokenActualizacion]);
    if ($estado < 200 || $estado >= 300 || empty($autenticacion['access_token'])) {
        $estadoCliente = $estado === 400 || $estado === 401 ? 401 : 503;
        http_response_code($estadoCliente); responderJson(['error' => $estadoCliente === 401 ? 'La sesión venció. Inicia sesión nuevamente.' : 'No se pudo renovar la sesión. Intentá nuevamente.']); exit;
    }
    [$estadoPerfil, $perfiles] = solicitarSupabase('GET', '/rest/v1/usuarios?select=id,nombre,apellido,correo,rol&id=eq.' . rawurlencode((string) ($autenticacion['user']['id'] ?? '')), null, $autenticacion['access_token']);
    if ($estadoPerfil < 200 || $estadoPerfil >= 300 || empty($perfiles[0])) { http_response_code(503); responderJson(['error' => 'No se pudo validar el perfil de la cuenta.']); exit; }
    $resultado = crearRespuestaSesion($autenticacion);
    $resultado['usuario'] = $perfiles[0];
    responderJson($resultado, JSON_UNESCAPED_UNICODE); exit;
}

if ($accion === 'register' && $metodo === 'POST') {
    $cuerpo = leerCuerpoJson();
    $nombre = trim((string) ($cuerpo['nombre'] ?? ''));
    $correo = strtolower(trim((string) ($cuerpo['correo'] ?? $cuerpo['email'] ?? '')));
    $contrasena = (string) ($cuerpo['contrasena'] ?? $cuerpo['password'] ?? '');
    if ($nombre === '' || !preg_match($expresionCorreo, $correo) || strlen($contrasena) < 8) { http_response_code(400); responderJson(['error' => 'Completa nombre, correo y una contraseña de al menos 8 caracteres.']); exit; }
    $clavePublica = leerVariableEntorno('SUPABASE_ANON_KEY');
    if ($clavePublica === '' || str_contains(strtolower($clavePublica), 'tu-anon-key')) {
        http_response_code(503);
        responderJson(['error' => 'El registro no está configurado: falta SUPABASE_ANON_KEY en backend/.env.']);
        exit;
    }
    $urlConfirmacion = leerVariableEntorno('FRONTEND_URL') ?: 'https://websigtur.onrender.com/login.html';
    [$estado, $autenticacion] = solicitarSupabase('POST', '/auth/v1/signup?redirect_to=' . rawurlencode($urlConfirmacion), [
        'email' => $correo, 'password' => $contrasena,
        'data' => ['nombre' => $nombre, 'apellido' => ''],
    ], null, $clavePublica);
    $usuarioCreado = $autenticacion['user'] ?? [];
    if ($estado < 200 || $estado >= 300 || empty($usuarioCreado['id'])) {
        http_response_code($estado === 429 ? 429 : ($estado >= 500 ? 503 : 400));
        responderJson(['error' => $autenticacion['msg'] ?? $autenticacion['message'] ?? $autenticacion['error_description'] ?? 'No se pudo crear la cuenta. Revisa la configuración de correo de Supabase.']);
        exit;
    }
    if (array_key_exists('identities', $usuarioCreado) && $usuarioCreado['identities'] === []) {
        responderJson(['pending' => true, 'message' => 'Si el correo está disponible, recibirás un enlace para confirmar la cuenta.'], JSON_UNESCAPED_UNICODE);
        exit;
    }
    [$estadoPerfil, $perfil] = solicitarSupabase('POST', '/rest/v1/usuarios', [
        'id' => $usuarioCreado['id'], 'nombre' => $nombre, 'correo' => $correo, 'rol' => 'usuario'
    ]);
    if ($estadoPerfil < 200 || $estadoPerfil >= 300) {
        solicitarSupabase('DELETE', '/auth/v1/admin/users/' . rawurlencode((string) $usuarioCreado['id']));
        http_response_code(500);
        responderJson(['error' => 'La cuenta se creó, pero no se pudo crear el perfil.']);
        exit;
    }
    responderJson([
        'pending' => true,
        'message' => 'Cuenta creada. Revisá tu correo para confirmar la cuenta antes de iniciar sesión.',
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($accion === 'me' && $metodo === 'GET') {
    $token = leerTokenPortador();
    [$estado, $usuario] = solicitarSupabase('GET', '/auth/v1/user', null, $token);
    if ($estado < 200 || $estado >= 300 || empty($usuario['id'])) { http_response_code(401); responderJson(['error' => 'Sesión inválida o vencida.']); exit; }
    [$estadoPerfil, $perfiles] = solicitarSupabase('GET', '/rest/v1/usuarios?select=id,nombre,apellido,correo,rol,created_at&id=eq.' . rawurlencode((string) $usuario['id']), null, $token);
    if ($estadoPerfil < 200 || $estadoPerfil >= 300 || empty($perfiles[0])) { http_response_code(503); responderJson(['error' => 'No se pudo validar el perfil de la cuenta.']); exit; }
    $perfil = $perfiles[0];
    responderJson(['usuario' => $perfil], JSON_UNESCAPED_UNICODE); exit;
}

if ($accion === 'es-admin' && $metodo === 'GET') {
    $token = leerTokenPortador();
    [$estado, $usuario] = solicitarSupabase('GET', '/auth/v1/user', null, $token);
    if ($estado < 200 || $estado >= 300 || empty($usuario['id'])) { http_response_code(401); responderJson(['error' => 'Sesión inválida o vencida.']); exit; }
    [$estadoPerfil, $perfiles] = solicitarSupabase('GET', '/rest/v1/usuarios?select=nombre,correo,rol&id=eq.' . rawurlencode((string) $usuario['id']), null, $token);
    $perfil = $estadoPerfil >= 200 && $estadoPerfil < 300 && !empty($perfiles[0]) ? $perfiles[0] : ['rol' => 'usuario'];
    if (($perfil['rol'] ?? 'usuario') !== 'admin') { http_response_code(403); responderJson(['error' => 'Necesitás permisos de administrador.']); exit; }
    responderJson(['rol' => 'admin', 'nombre' => $perfil['nombre'] ?? $usuario['email'] ?? 'Admin'], JSON_UNESCAPED_UNICODE); exit;
}

if ($accion === 'logout' && $metodo === 'POST') {
    $token = leerTokenPortador();
    if ($token !== '') solicitarSupabase('POST', '/auth/v1/logout', null, $token);
    responderJson(['ok' => true]); exit;
}

if ($accion === 'password' && $metodo === 'PATCH') {
    $token = leerTokenPortador();
    $datos = leerCuerpoJson();
    $contrasena = (string) ($datos['contrasena'] ?? $datos['password'] ?? '');
    if ($token === '') { http_response_code(401); responderJson(['error' => 'El enlace de recuperación no es válido.']); exit; }
    if (strlen($contrasena) < 8 || strlen($contrasena) > 128) { http_response_code(400); responderJson(['error' => 'La contraseña debe tener entre 8 y 128 caracteres.']); exit; }
    [$estado, $actualizado] = solicitarSupabase('PUT', '/auth/v1/user', ['password' => $contrasena], $token);
    if ($estado < 200 || $estado >= 300) { http_response_code($estado === 401 ? 401 : 400); responderJson(['error' => 'El enlace venció o ya fue utilizado. Solicitá uno nuevo.']); exit; }
    responderJson(['ok' => true]); exit;
}

if ($accion === 'recuperar' && $metodo === 'POST') {
    $cuerpo = leerCuerpoJson();
    $correo = strtolower(trim((string) ($cuerpo['correo'] ?? $cuerpo['email'] ?? '')));
    if (!preg_match($expresionCorreo, $correo)) { http_response_code(400); responderJson(['error' => 'Correo inválido.']); exit; }
    $urlRetorno = leerVariableEntorno('PASSWORD_RESET_REDIRECT_URL');
    if ($urlRetorno === '') { http_response_code(503); responderJson(['error' => 'Configura PASSWORD_RESET_REDIRECT_URL para recuperar la contraseña.']); exit; }
    [$estado] = solicitarSupabase('POST', '/auth/v1/recover', ['email' => $correo, 'redirect_to' => $urlRetorno]);
    if ($estado < 200 || $estado >= 300) { http_response_code(400); responderJson(['error' => 'No se pudo solicitar la recuperación.']); exit; }
    responderJson(['success' => true, 'message' => 'Si el correo existe, recibirás un enlace para cambiar la contraseña.'], JSON_UNESCAPED_UNICODE); exit;
}

http_response_code(404);
responderJson(['error' => 'Ruta de autenticación no encontrada.']);
