<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

function envValue(string $name): string {
    $value = getenv($name);
    if ($value !== false && $value !== '') return trim($value);
    $envPath = dirname(__DIR__, 3) . DIRECTORY_SEPARATOR . 'backend' . DIRECTORY_SEPARATOR . '.env';
    if (!is_readable($envPath)) return '';
    foreach (file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
        $line = trim($line);
        if ($line === '' || str_starts_with($line, '#') || !str_contains($line, '=')) continue;
        [$key, $envValue] = explode('=', $line, 2);
        if (trim($key) === $name) return trim($envValue, " \t\"'");
    }
    return '';
}

function jsonBody(): array {
    $body = json_decode(file_get_contents('php://input'), true);
    return is_array($body) ? $body : [];
}

function supabaseRequest(string $method, string $path, ?array $body = null, ?string $token = null): array {
    $baseUrl = rtrim(envValue('SUPABASE_URL'), '/');
    // Este proxy se ejecuta en Apache, no en el navegador. Usa la clave del
    // servidor para que el modo XAMPP no dependa de una anon key antigua.
    $serverKey = envValue('SUPABASE_SERVICE_KEY') ?: envValue('SUPABASE_ANON_KEY');
    if ($baseUrl === '' || $serverKey === '') return [503, ['error' => 'Configura SUPABASE_URL y SUPABASE_SERVICE_KEY en backend/.env.']];
    $headers = ['apikey: ' . $serverKey, 'Authorization: Bearer ' . ($token ?: $serverKey), 'Accept: application/json', 'Content-Type: application/json'];
    $curl = curl_init($baseUrl . $path);
    curl_setopt_array($curl, [
        CURLOPT_CUSTOMREQUEST => $method, CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => $headers, CURLOPT_TIMEOUT => 12,
    ]);
    if ($body !== null) curl_setopt($curl, CURLOPT_POSTFIELDS, json_encode($body));
    $response = curl_exec($curl);
    $status = (int) curl_getinfo($curl, CURLINFO_HTTP_CODE);
    curl_close($curl);
    $payload = json_decode($response ?: '', true);
    return [$status, is_array($payload) ? $payload : []];
}

function sessionResponse(array $auth): array {
    $user = $auth['user'] ?? [];
    $metadata = $user['user_metadata'] ?? [];
    $nombre = trim((string) ($metadata['nombre'] ?? $metadata['full_name'] ?? strstr((string) ($user['email'] ?? ''), '@', true) ?: 'Usuario'));
    return [
        'token' => $auth['access_token'] ?? null, 'refreshToken' => $auth['refresh_token'] ?? null,
        'expiresAt' => $auth['expires_at'] ?? null,
        'usuario' => ['id' => $user['id'] ?? null, 'nombre' => $nombre, 'correo' => $user['email'] ?? null, 'rol' => 'usuario'],
    ];
}

function bearerToken(): string {
    $header = (string) ($_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '');
    if ($header === '' && function_exists('getallheaders')) {
        $headers = getallheaders();
        $header = (string) ($headers['Authorization'] ?? $headers['authorization'] ?? '');
    }
    return preg_match('/^Bearer\s+(.+)$/i', $header, $matches) ? trim($matches[1]) : '';
}

$action = trim((string) ($_GET['action'] ?? ''));
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$emailRegex = '/^[^\s@]+@[^\s@]+\.[^\s@]+$/';

if ($action === 'google' && $method === 'GET') {
    $redirect = envValue('FRONTEND_URL');
    if ($redirect === '') { http_response_code(503); echo json_encode(['error' => 'Configura FRONTEND_URL para Google OAuth.']); exit; }
    $url = rtrim(envValue('SUPABASE_URL'), '/') . '/auth/v1/authorize?' . http_build_query([
        'provider' => 'google', 'redirect_to' => $redirect, 'flow_type' => 'implicit',
    ]);
    header('Location: ' . $url, true, 302);
    exit;
}

if ($action === 'login' && $method === 'POST') {
    $body = jsonBody();
    $email = strtolower(trim((string) ($body['correo'] ?? $body['email'] ?? '')));
    $password = (string) ($body['password'] ?? '');
    if (!preg_match($emailRegex, $email) || $password === '') { http_response_code(400); echo json_encode(['error' => 'Correo o contraseña inválidos.']); exit; }
    [$status, $auth] = supabaseRequest('POST', '/auth/v1/token?grant_type=password', ['email' => $email, 'password' => $password]);
    if ($status < 200 || $status >= 300 || empty($auth['access_token'])) { http_response_code(401); echo json_encode(['error' => 'Correo o contraseña incorrectos.']); exit; }
    [$profileStatus, $profiles] = supabaseRequest('GET', '/rest/v1/usuarios?select=id,nombre,apellido,correo,rol&id=eq.' . rawurlencode((string) $auth['user']['id']), null, $auth['access_token']);
    $result = sessionResponse($auth);
    if ($profileStatus >= 200 && $profileStatus < 300 && !empty($profiles[0])) $result['usuario'] = $profiles[0];
    echo json_encode($result, JSON_UNESCAPED_UNICODE); exit;
}

if ($action === 'register' && $method === 'POST') {
    $body = jsonBody();
    $nombre = trim((string) ($body['nombre'] ?? ''));
    $email = strtolower(trim((string) ($body['correo'] ?? $body['email'] ?? '')));
    $password = (string) ($body['password'] ?? '');
    if ($nombre === '' || !preg_match($emailRegex, $email) || strlen($password) < 8) { http_response_code(400); echo json_encode(['error' => 'Completa nombre, correo y una contraseña de al menos 8 caracteres.']); exit; }
    // El alta se hace server-side con confirmación automática para no
    // depender del límite de correos de Supabase en el modo XAMPP.
    [$status, $created] = supabaseRequest('POST', '/auth/v1/admin/users', [
        'email' => $email, 'password' => $password, 'email_confirm' => true,
        'user_metadata' => ['nombre' => $nombre],
    ]);
    if ($status < 200 || $status >= 300 || empty($created['id'])) {
        http_response_code($status === 429 ? 429 : 400);
        echo json_encode(['error' => $created['msg'] ?? $created['message'] ?? $created['error_description'] ?? 'No se pudo crear la cuenta.']);
        exit;
    }
    [$loginStatus, $auth] = supabaseRequest('POST', '/auth/v1/token?grant_type=password', ['email' => $email, 'password' => $password]);
    if ($loginStatus < 200 || $loginStatus >= 300 || empty($auth['access_token'])) {
        http_response_code(500);
        echo json_encode(['error' => 'La cuenta se creó, pero no se pudo iniciar sesión automáticamente.']);
        exit;
    }
    [$profileStatus, $profile] = supabaseRequest('POST', '/rest/v1/usuarios', ['id' => $created['id'], 'nombre' => $nombre, 'correo' => $email, 'rol' => 'usuario'], $auth['access_token']);
    if ($profileStatus < 200 || $profileStatus >= 300) {
        http_response_code(500);
        echo json_encode(['error' => 'La cuenta se creó, pero no se pudo crear el perfil.']);
        exit;
    }
    echo json_encode(sessionResponse($auth), JSON_UNESCAPED_UNICODE); exit;
}

if ($action === 'me' && $method === 'GET') {
    $token = bearerToken();
    [$status, $user] = supabaseRequest('GET', '/auth/v1/user', null, $token);
    if ($status < 200 || $status >= 300 || empty($user['id'])) { http_response_code(401); echo json_encode(['error' => 'Sesión inválida o vencida.']); exit; }
    [$profileStatus, $profiles] = supabaseRequest('GET', '/rest/v1/usuarios?select=id,nombre,apellido,correo,rol,created_at&id=eq.' . rawurlencode((string) $user['id']), null, $token);
    $profile = $profileStatus >= 200 && $profileStatus < 300 && !empty($profiles[0]) ? $profiles[0] : sessionResponse(['user' => $user])['usuario'];
    echo json_encode(['usuario' => $profile], JSON_UNESCAPED_UNICODE); exit;
}

if ($action === 'es-admin' && $method === 'GET') {
    $token = bearerToken();
    [$status, $user] = supabaseRequest('GET', '/auth/v1/user', null, $token);
    if ($status < 200 || $status >= 300 || empty($user['id'])) { http_response_code(401); echo json_encode(['error' => 'Sesión inválida o vencida.']); exit; }
    [$profileStatus, $profiles] = supabaseRequest('GET', '/rest/v1/usuarios?select=nombre,correo,rol&id=eq.' . rawurlencode((string) $user['id']), null, $token);
    $profile = $profileStatus >= 200 && $profileStatus < 300 && !empty($profiles[0]) ? $profiles[0] : ['rol' => 'usuario'];
    if (($profile['rol'] ?? 'usuario') !== 'admin') { http_response_code(403); echo json_encode(['error' => 'Necesitás permisos de administrador.']); exit; }
    echo json_encode(['rol' => 'admin', 'nombre' => $profile['nombre'] ?? $user['email'] ?? 'Admin'], JSON_UNESCAPED_UNICODE); exit;
}

if ($action === 'logout' && $method === 'POST') {
    echo json_encode(['ok' => true]); exit;
}

if ($action === 'recuperar' && $method === 'POST') {
    $body = jsonBody();
    $email = strtolower(trim((string) ($body['correo'] ?? $body['email'] ?? '')));
    if (!preg_match($emailRegex, $email)) { http_response_code(400); echo json_encode(['error' => 'Correo inválido.']); exit; }
    $redirect = envValue('PASSWORD_RESET_REDIRECT_URL');
    if ($redirect === '') { http_response_code(503); echo json_encode(['error' => 'Configura PASSWORD_RESET_REDIRECT_URL para recuperar la contraseña.']); exit; }
    [$status] = supabaseRequest('POST', '/auth/v1/recover', ['email' => $email, 'redirect_to' => $redirect]);
    if ($status < 200 || $status >= 300) { http_response_code(400); echo json_encode(['error' => 'No se pudo solicitar la recuperación.']); exit; }
    echo json_encode(['success' => true, 'message' => 'Si el correo existe, recibirás un enlace para cambiar la contraseña.'], JSON_UNESCAPED_UNICODE); exit;
}

http_response_code(404);
echo json_encode(['error' => 'Ruta de autenticación no encontrada.']);