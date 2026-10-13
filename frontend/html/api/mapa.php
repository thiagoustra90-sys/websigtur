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

function supabaseRows(string $baseUrl, string $anonKey, string $table, string $select): array {
    $url = rtrim($baseUrl, '/') . '/rest/v1/' . $table . '?select=' . rawurlencode($select)
        . '&latitude=not.is.null&longitude=not.is.null';
    $headers = "apikey: {$anonKey}\r\nAuthorization: Bearer {$anonKey}\r\nAccept: application/json\r\n";
    $context = stream_context_create(['http' => [
        'method' => 'GET', 'header' => $headers, 'timeout' => 8, 'ignore_errors' => true,
    ]]);
    $body = @file_get_contents($url, false, $context);
    if ($body === false) return [];
    $rows = json_decode($body, true);
    return is_array($rows) ? $rows : [];
}

$baseUrl = envValue('SUPABASE_URL');
$anonKey = envValue('SUPABASE_ANON_KEY');
if ($baseUrl === '' || $anonKey === '') {
    http_response_code(503);
    echo json_encode(['error' => 'Configura SUPABASE_URL y SUPABASE_ANON_KEY para el modo XAMPP.']);
    exit;
}

$puntos = [];
$tables = [
    ['busines', 'id,name,category,categories,description,location,address,image_url,link,latitude,longitude', 'company'],
    ['events', 'id,title,categories,description,location,address,image_url,link,latitude,longitude,date_start,date_end,price', 'event'],
    ['places', 'id,name,type,categories,description,location,address,image_url,link,latitude,longitude', 'place'],
];

foreach ($tables as [$table, $select, $type]) {
    foreach (supabaseRows($baseUrl, $anonKey, $table, $select) as $row) {
        $lat = filter_var($row['latitude'] ?? null, FILTER_VALIDATE_FLOAT);
        $lng = filter_var($row['longitude'] ?? null, FILTER_VALIDATE_FLOAT);
        if ($lat === false || $lng === false || $lat < -90 || $lat > 90 || $lng < -180 || $lng > 180) continue;
        $categories = $row['categories'] ?? [];
        if (!is_array($categories)) $categories = [$categories ?: ($row['category'] ?? $row['type'] ?? 'Cultura')];
        $puntos[] = [
            'id' => $type . '-' . ($row['id'] ?? count($puntos)), 'nombre' => $row['name'] ?? $row['title'] ?? 'Punto de interés',
            'tipo' => $type, 'categorias' => array_values(array_filter($categories)), 'lat' => round((float) $lat, 6),
            'lng' => round((float) $lng, 6), 'imagen' => $row['image_url'] ?? null,
            'direccion' => $row['address'] ?? $row['location'] ?? null, 'descripcion' => $row['description'] ?? null,
            'enlace' => $row['link'] ?? null,
        ];
    }
}

echo json_encode(['data' => $puntos, 'total' => count($puntos)], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);