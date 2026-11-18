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
        [$clave, $leerVariableEntorno] = explode('=', $linea, 2);
        if (trim($clave) === $nombreVariable) return trim($leerVariableEntorno, " \t\"'");
    }
    return '';
}

function leerFilasSupabase(string $urlBase, string $claveAnonima, string $tabla, string $seleccion): array {
    $urlSolicitud = rtrim($urlBase, '/') . '/rest/v1/' . $tabla . '?select=' . rawurlencode($seleccion)
        . '&latitude=not.is.null&longitude=not.is.null';
    $encabezados = "apikey: {$claveAnonima}\r\nAuthorization: Bearer {$claveAnonima}\r\nAccept: application/json\r\n";
    $contexto = stream_context_create(['http' => [
        'method' => 'GET', 'header' => $encabezados, 'timeout' => 8, 'ignore_errors' => true,
    ]]);
    $cuerpo = @file_get_contents($urlSolicitud, false, $contexto);
    if ($cuerpo === false) return [];
    $filas = json_decode($cuerpo, true);
    return is_array($filas) ? $filas : [];
}

$urlBase = leerVariableEntorno('SUPABASE_URL');
$claveAnonima = leerVariableEntorno('SUPABASE_ANON_KEY');
if ($urlBase === '' || $claveAnonima === '') {
    http_response_code(503);
    responderJson(['error' => 'Configura SUPABASE_URL y SUPABASE_ANON_KEY para el modo XAMPP.']);
    exit;
}

$puntos = [];
$tablas = [
    ['busines', 'id,name,category,categories,description,location,address,image_url,link,latitude,longitude', 'company'],
    ['events', 'id,title,categories,description,location,address,image_url,link,latitude,longitude,date_start,date_end,price', 'event'],
    ['places', 'id,name,type,categories,description,location,address,image_url,link,latitude,longitude', 'place'],
];

foreach ($tablas as [$tabla, $seleccion, $tipo]) {
    foreach (leerFilasSupabase($urlBase, $claveAnonima, $tabla, $seleccion) as $fila) {
        $latitud = filter_var($fila['latitude'] ?? null, FILTER_VALIDATE_FLOAT);
        $longitud = filter_var($fila['longitude'] ?? null, FILTER_VALIDATE_FLOAT);
        if ($latitud === false || $longitud === false || $latitud < -90 || $latitud > 90 || $longitud < -180 || $longitud > 180) continue;
        $categorias = $fila['categories'] ?? [];
        if (!is_array($categorias)) $categorias = [$categorias ?: ($fila['category'] ?? $fila['type'] ?? 'Cultura')];
        $puntos[] = [
            'id' => $tipo . '-' . ($fila['id'] ?? count($puntos)), 'nombre' => $fila['name'] ?? $fila['title'] ?? 'Punto de interés',
            'tipo' => $tipo, 'categorias' => array_values(array_filter($categorias)), 'lat' => round((float) $latitud, 6),
            'lng' => round((float) $longitud, 6), 'imagen' => $fila['image_url'] ?? null,
            'direccion' => $fila['address'] ?? $fila['location'] ?? null, 'descripcion' => $fila['description'] ?? null,
            'enlace' => $fila['link'] ?? null,
        ];
    }
}

responderJson(['data' => $puntos, 'total' => count($puntos)], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
