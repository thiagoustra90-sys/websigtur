<?php
declare(strict_types=1);

$consulta = $_SERVER['QUERY_STRING'] ?? '';
$destino = 'login.html' . ($consulta !== '' ? '?' . $consulta : '');

header('Location: ' . $destino, true, 302);
exit;
